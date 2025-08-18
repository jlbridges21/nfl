import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sportsdata.io/v3/nfl'
const API_KEY = process.env.SPORTSDATA_API_KEY

// Rate limiting - simple in-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // per minute per IP

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return `rate_limit:${ip}`
}

function checkRateLimit(request: NextRequest): boolean {
  const key = getRateLimitKey(request)
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  record.count++
  return true
}

async function handleSportsDataRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Check if API key is configured
  if (!API_KEY) {
    console.error('SPORTSDATA_API_KEY environment variable is not set')
    return NextResponse.json(
      { error: 'SportsData API is not configured' },
      { status: 500 }
    )
  }

  // Rate limiting
  if (!checkRateLimit(request)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    )
  }

  // Construct the path
  const path = params.path.join('/')
  
  // Get query parameters from the original request
  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.searchParams)
  
  // Add the API key
  searchParams.set('key', API_KEY)
  
  // Construct the final URL
  const sportsDataUrl = `${API_BASE_URL}/${path}?${searchParams.toString()}`
  
  try {
    console.log(`Proxying request to: ${API_BASE_URL}/${path}`)
    
    const response = await fetch(sportsDataUrl, {
      method: request.method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NFL-Predictor-App/1.0',
      },
      // Cache for 5 minutes for most requests
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      console.error(`SportsData API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { 
          error: 'Failed to fetch data from SportsData API',
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Return the data with appropriate headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
    
  } catch (error) {
    console.error('Error proxying SportsData request:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error while fetching data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle GET requests
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleSportsDataRequest(request, { params: resolvedParams })
}

// Handle POST requests (if needed for future endpoints)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleSportsDataRequest(request, { params: resolvedParams })
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// Block dangerous methods
export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

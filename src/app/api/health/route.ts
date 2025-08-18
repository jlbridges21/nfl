import { NextResponse } from 'next/server'

export async function GET() {
  const healthData = {
    ok: true,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    service: 'NFL Game Predictor API',
    status: 'healthy'
  }

  return NextResponse.json(healthData, { status: 200 })
}

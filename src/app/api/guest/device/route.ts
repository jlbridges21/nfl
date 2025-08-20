import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface DeviceRequestBody {
  action: 'get' | 'set' | 'clear';
  deviceId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DeviceRequestBody = await request.json();
    
    if (!body.action || (body.action !== 'get' && body.action !== 'set' && body.action !== 'clear')) {
      return NextResponse.json(
        { error: 'action must be "get", "set", or "clear"' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const COOKIE_NAME = 'guest_device_id';

    if (body.action === 'get') {
      // Return existing cookie value if present
      const existingDeviceId = cookieStore.get(COOKIE_NAME)?.value;
      return NextResponse.json({ 
        deviceId: existingDeviceId || null 
      });
    }

    if (body.action === 'set') {
      if (!body.deviceId) {
        return NextResponse.json(
          { error: 'deviceId is required for set action' },
          { status: 400 }
        );
      }

      // Check if cookie already exists
      const existingDeviceId = cookieStore.get(COOKIE_NAME)?.value;
      
      if (existingDeviceId) {
        // Return existing value, don't overwrite
        return NextResponse.json({ 
          deviceId: existingDeviceId,
          message: 'Cookie already exists, returning existing value'
        });
      }

      // Set new cookie with long expiration (365 days)
      const response = NextResponse.json({ 
        deviceId: body.deviceId,
        message: 'Cookie set successfully'
      });

      response.cookies.set(COOKIE_NAME, body.deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 365 days in seconds
        path: '/',
      });

      return response;
    }

    if (body.action === 'clear') {
      // Clear the guest device cookie
      const response = NextResponse.json({ 
        message: 'Guest device cookie cleared successfully'
      });

      response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Guest device API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to manage guest device ID.' },
    { status: 405 }
  );
}

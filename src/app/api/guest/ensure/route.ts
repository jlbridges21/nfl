import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

interface EnsureRequestBody {
  deviceId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EnsureRequestBody = await request.json();
    
    if (!body.deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      );
    }

    const supabase = await createServiceRoleClient();

    // First, check if the guest session exists
    const { data: existingSession, error: selectError } = await (supabase as any)
      .from('guest_sessions')
      .select('credits_used')
      .eq('device_id', body.deviceId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Failed to check existing guest session:', selectError);
      return NextResponse.json(
        { error: 'Failed to check guest session' },
        { status: 500 }
      );
    }

    // Use UPSERT to handle both insert and update cases
    const { data: upsertedSession, error: upsertError } = await (supabase as any)
      .from('guest_sessions')
      .upsert({
        device_id: body.deviceId,
        credits_used: existingSession?.credits_used || 0,
        created_at: existingSession?.created_at || new Date().toISOString(),
        last_seen: new Date().toISOString(),
      }, {
        onConflict: 'device_id',
        ignoreDuplicates: false
      })
      .select('credits_used')
      .single();

    if (upsertError) {
      console.error('Failed to upsert guest session:', upsertError);
      return NextResponse.json(
        { error: 'Failed to create/update guest session' },
        { status: 500 }
      );
    }

    const used = upsertedSession?.credits_used || 0;
    const remaining = Math.max(0, 10 - used);

    return NextResponse.json({ 
      used, 
      remaining 
    });

  } catch (error) {
    console.error('Guest ensure API error:', error);
    
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
    { error: 'Method not allowed. Use POST to ensure guest session.' },
    { status: 405 }
  );
}

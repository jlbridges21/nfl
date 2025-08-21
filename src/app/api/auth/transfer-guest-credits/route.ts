import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

interface TransferRequestBody {
  userId: string;
  deviceId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TransferRequestBody = await request.json();
    
    if (!body.userId || !body.deviceId) {
      return NextResponse.json(
        { error: 'userId and deviceId are required' },
        { status: 400 }
      );
    }

    const supabase = await createServiceRoleClient();

    // First, check if the user profile already has free_credits_remaining set
    // If it's still at the default (10), then this is the first transfer
    const { data: currentProfile, error: profileCheckError } = await (supabase as any)
      .from('profiles')
      .select('free_credits_remaining')
      .eq('id', body.userId)
      .single();

    if (profileCheckError) {
      console.error('Failed to check current profile:', profileCheckError);
      return NextResponse.json(
        { error: 'Failed to check current profile' },
        { status: 500 }
      );
    }

    // If profile already has credits transferred (not the default 15), skip transfer
    if (currentProfile && currentProfile.free_credits_remaining !== 15) {
      console.log(`Credits already transferred for user ${body.userId}: ${currentProfile.free_credits_remaining}/15`);
      return NextResponse.json({ 
        success: true,
        guest_credits_used: 0,
        free_credits_remaining: currentProfile.free_credits_remaining,
        guest_session_burned: false,
        already_transferred: true
      });
    }

    // Get guest session credits used
    const { data: guestSession, error: guestError } = await (supabase as any)
      .from('guest_sessions')
      .select('credits_used')
      .eq('device_id', body.deviceId)
      .single();

    if (guestError && guestError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Failed to get guest session:', guestError);
      return NextResponse.json(
        { error: 'Failed to get guest session' },
        { status: 500 }
      );
    }

    // New users always get 15 full credits when creating an account
    // regardless of how many guest credits they used
    const guestCreditsUsed = guestSession?.credits_used || 0;
    const freeCreditsRemaining = 15; // Always give 15 new credits

    // Update user profile with full 15 credits
    const { error: updateError } = await (supabase as any)
      .from('profiles')
      .update({ free_credits_remaining: freeCreditsRemaining })
      .eq('id', body.userId);

    if (updateError) {
      console.error('Failed to update user profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    // CRITICAL: Burn the guest session to prevent reuse
    // Set credits_used = 10 so this guest session can never be used again
    if (guestSession) {
      const { error: burnError } = await (supabase as any)
        .from('guest_sessions')
        .update({ 
          credits_used: 10,
          last_seen: new Date().toISOString()
        })
        .eq('device_id', body.deviceId);

      if (burnError) {
        console.error('Failed to burn guest session:', burnError);
        // Don't fail the entire operation, but log the issue
        console.warn(`Guest session ${body.deviceId} was not burned - potential for credit reuse`);
      } else {
        console.log(`Guest session ${body.deviceId} burned successfully`);
      }
    }

    console.log(`Transferred guest credits for user ${body.userId}: guest_used=${guestCreditsUsed}, free_remaining=${freeCreditsRemaining}`);

    return NextResponse.json({ 
      success: true,
      guest_credits_used: guestCreditsUsed,
      free_credits_remaining: freeCreditsRemaining,
      guest_session_burned: true
    });

  } catch (error) {
    console.error('Transfer guest credits API error:', error);
    
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
    { error: 'Method not allowed. Use POST to transfer guest credits.' },
    { status: 405 }
  );
}

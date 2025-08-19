import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

// Force this route to run on Node.js runtime (not Edge)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // For debugging, allow passing user_id in request body
    const body = await request.json().catch(() => ({}))
    const debugUserId = body.user_id

    let user: any = null

    if (debugUserId) {
      // Use the provided user_id for debugging
      user = { id: debugUserId, email: null }
    } else {
      // Get authenticated user
      const supabase = await createClient()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized - provide user_id in body for debug' }, { status: 401 })
      }
      user = authUser
    }

    // Use service role client for database operations
    const serviceSupabase = await createServiceRoleClient()

    // Get user's current subscription record
    const { data: existingSubscription, error: fetchError } = await serviceSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let stripeCustomerId = existingSubscription?.stripe_customer_id

    // If no customer ID, try to find customer by email in Stripe
    if (!stripeCustomerId) {
      try {
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1
        })

        if (customers.data.length > 0) {
          stripeCustomerId = customers.data[0].id
        } else {
          return NextResponse.json({ 
            error: 'No Stripe customer found for this email',
            synced: false 
          }, { status: 404 })
        }
      } catch (stripeError) {
        console.error('Error searching for Stripe customer:', stripeError)
        return NextResponse.json({ 
          error: 'Failed to search Stripe customers',
          synced: false 
        }, { status: 500 })
      }
    }

    // Get active subscriptions for this customer
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'active',
        limit: 1,
        expand: ['data.items.data.price']
      })

      if (subscriptions.data.length === 0) {
        return NextResponse.json({ 
          message: 'No active subscriptions found',
          synced: false 
        })
      }

      const subscription = subscriptions.data[0]

      // Upsert the subscription record
      const currentPeriodEnd = (subscription as any).current_period_end
      const { data: upsertResult, error: upsertError } = await serviceSupabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: subscription.id,
          price_id: subscription.items.data[0]?.price.id,
          status: subscription.status,
          current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
          cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
        }, {
          onConflict: 'user_id'
        })
        .select()

      if (upsertError) {
        console.error('Error upserting subscription:', upsertError)
        return NextResponse.json({ 
          error: 'Database error',
          synced: false 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        synced: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          price_id: subscription.items.data[0]?.price.id,
          current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
        }
      })

    } catch (stripeError) {
      console.error('Error retrieving subscriptions from Stripe:', stripeError)
      return NextResponse.json({ 
        error: 'Stripe API error',
        synced: false 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Sync billing error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      synced: false 
    }, { status: 500 })
  }
}

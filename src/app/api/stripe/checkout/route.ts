import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Ensure a subscriptions row exists for the user
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let stripeCustomerId = subscription?.stripe_customer_id

    // If no subscription record exists, create one
    if (subError && subError.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          price_id: null,
          status: null,
          current_period_end: null,
          cancel_at_period_end: null,
        })

      if (insertError) {
        console.error('Error creating subscription record:', insertError)
        return NextResponse.json(
          { error: 'Failed to create subscription record' },
          { status: 500 }
        )
      }
    }

    // Create Stripe customer if needed
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
        },
      })

      stripeCustomerId = customer.id

      // Update the subscription record with the customer ID
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating customer ID:', updateError)
        return NextResponse.json(
          { error: 'Failed to update customer information' },
          { status: 500 }
        )
      }
    }

    // Create Checkout Session
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_UNLIMITED!,
          quantity: 1,
        },
      ],
      customer: stripeCustomerId,
      success_url: `${origin}/?success=1`,
      cancel_url: `${origin}/?canceled=1`,
      metadata: {
        user_id: user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

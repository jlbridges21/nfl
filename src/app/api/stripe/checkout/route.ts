import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  // Environment and runtime diagnostics
  const hasStripeSecret = !!process.env.STRIPE_SECRET_KEY
  const hasPriceId = !!process.env.STRIPE_PRICE_UNLIMITED
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasAppUrl = !!process.env.NEXT_PUBLIC_APP_URL

  console.log('Checkout route diagnostics:', {
    hasStripeSecret,
    hasPriceId,
    hasServiceRole,
    hasSupabaseUrl,
    hasAnonKey,
    hasAppUrl,
    runtime: 'node'
  })

  try {
    // Basic env validation
    if (!hasStripeSecret) {
      console.error('Missing STRIPE_SECRET_KEY')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    if (!hasPriceId) {
      console.error('Missing STRIPE_PRICE_UNLIMITED')
      return NextResponse.json(
        { error: 'Pricing configuration error' },
        { status: 500 }
      )
    }
    if (!hasServiceRole) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Supabase clients
    const supabase = await createClient() // authenticated (RLS-safe for reads)
    const supabaseServiceRole = await createServiceRoleClient() // privileged writes

    // Test service-role client with diagnostic query
    try {
      const { data: testData, error: testError } = await supabaseServiceRole
        .from('subscriptions')
        .select('id')
        .limit(1)
      
      if (testError) {
        console.error('Service-role client test failed:', {
          code: testError.code,
          details: testError.details,
          hint: testError.hint,
          message: testError.message
        })
      } else {
        console.log('Service-role client test passed')
      }
    } catch (serviceTestError) {
      console.error('Service-role client test exception:', serviceTestError)
    }

    // Require authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Authentication failed:', authError)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Read subscription with RLS (user can read own row)
    const { data: subscription, error: readError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (readError) {
      console.error('Error reading subscription (RLS):', readError)
      return NextResponse.json(
        { error: 'Failed to fetch subscription information' },
        { status: 500 }
      )
    }

    // Ensure subscription row exists (avoid unique-constraint races)
    let subRow = subscription
    if (!subRow) {
      const { data: upserted, error: upsertError } = await supabaseServiceRole
        .from('subscriptions')
        .upsert({ user_id: user.id }, { onConflict: 'user_id' })
        .select('*')
        .single()
      
      if (upsertError) {
        console.error('Upsert subscription error (service role):', {
          code: upsertError.code,
          details: upsertError.details,
          hint: upsertError.hint,
          message: upsertError.message,
          constraint: upsertError.details?.includes('unique') ? 'unique_violation' : null
        })
        
        // If it's a race condition (unique violation), try to re-select the row
        if (upsertError.code === '23505' || upsertError.details?.includes('unique')) {
          console.log('Race condition detected, re-selecting subscription row')
          const { data: existingRow, error: selectError } = await supabaseServiceRole
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()
          
          if (selectError) {
            console.error('Failed to re-select after race condition:', {
              code: selectError.code,
              details: selectError.details,
              hint: selectError.hint,
              message: selectError.message
            })
            return NextResponse.json(
              { error: 'Failed to create subscription record' },
              { status: 500 }
            )
          }
          subRow = existingRow
        } else {
          return NextResponse.json(
            { error: 'Failed to create subscription record' },
            { status: 500 }
          )
        }
      } else {
        subRow = upserted
      }
    }

    // Ensure Stripe customer exists
    let stripeCustomerId = subRow?.stripe_customer_id ?? null
    if (!stripeCustomerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email ?? undefined,
          metadata: { user_id: user.id },
        })
        stripeCustomerId = customer.id

        const { error: updateError } = await supabaseServiceRole
          .from('subscriptions')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('user_id', user.id)
        
        if (updateError) {
          console.error('Failed to persist stripe_customer_id:', {
            code: updateError.code,
            details: updateError.details,
            hint: updateError.hint,
            message: updateError.message
          })
          return NextResponse.json(
            { error: 'Failed to create subscription record' },
            { status: 500 }
          )
        }
      } catch (stripeError: any) {
        console.error('Stripe customer creation failed:', {
          type: stripeError.type,
          code: stripeError.code,
          doc_url: stripeError.doc_url,
          message: stripeError.message
        })
        return NextResponse.json(
          { error: 'Failed to create billing customer' },
          { status: 500 }
        )
      }
    }

    // Guard
    if (!stripeCustomerId) {
      console.error('Stripe customer ID missing after creation/update.')
      return NextResponse.json(
        { error: 'Failed to prepare billing customer' },
        { status: 500 }
      )
    }

    // Success/cancel URLs
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000'

    // Create Checkout Session
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{ price: process.env.STRIPE_PRICE_UNLIMITED, quantity: 1 }],
        success_url: `${origin}/?success=1`,
        cancel_url: `${origin}/?canceled=1`,
        metadata: { user_id: user.id },
      })

      if (!session.url) {
        console.error('Stripe session created but no URL returned')
        return NextResponse.json(
          { error: 'Failed to create checkout session' },
          { status: 500 }
        )
      }

      return NextResponse.json({ url: session.url }, { status: 200 })
    } catch (stripeError: any) {
      console.error('Stripe checkout session creation failed:', {
        type: stripeError.type,
        code: stripeError.code,
        doc_url: stripeError.doc_url,
        message: stripeError.message
      })
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error('Checkout route fatal error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

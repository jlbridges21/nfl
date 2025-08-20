import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Force this route to run on Node.js runtime (not Edge)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables first
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Initialize Stripe client and webhook secret after validation
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Temporary logging
    console.log('Webhook received:', {
      type: event.type,
      livemode: event.livemode,
      id: event.id
    })

    const supabase = await createServiceRoleClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id

        console.log('Processing checkout.session.completed:', {
          type: event.type,
          livemode: event.livemode,
          user_id: userId,
          session_id: session.id
        })
        
        if (!userId) {
          console.error('No user_id in checkout session metadata for session:', session.id)
          return NextResponse.json({ error: 'Missing user_id in metadata' }, { status: 400 })
        }

        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string
          const customerId = session.customer as string

          try {
            // Get the subscription details from Stripe with expanded price data
            const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
              expand: ['items.data.price']
            })
            
            // Upsert the subscription record
            const currentPeriodEnd = (subscription as any).current_period_end
            const { data: upsertResult, error } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                price_id: subscription.items.data[0]?.price.id,
                status: subscription.status,
                current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
                cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
              }, {
                onConflict: 'user_id'
              })
              .select()

            if (error) {
              console.error('Error upserting subscription after checkout:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint,
                userId,
                sessionId: session.id,
                subscriptionId
              })
              return NextResponse.json({ error: 'Database error' }, { status: 500 })
            } else {
              console.log('Subscription upserted for user:', {
                userId,
                sessionId: session.id,
                subscriptionId,
                status: subscription.status,
                upsertResult
              })
            }
          } catch (stripeError) {
            console.error('Error retrieving subscription from Stripe:', {
              error: stripeError,
              subscriptionId,
              sessionId: session.id
            })
            return NextResponse.json({ error: 'Stripe API error' }, { status: 500 })
          }
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log('Processing subscription event:', {
          type: event.type,
          livemode: event.livemode,
          customer_id: customerId,
          subscription_id: subscription.id
        })

        // Find the user by customer ID
        const { data: existingSubscription, error: findError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (findError || !existingSubscription) {
          console.error('Could not find user for customer:', {
            customerId,
            error: findError
          })
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Upsert the subscription
        const currentPeriodEnd = (subscription as any).current_period_end
        const { data: upsertResult, error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: existingSubscription.user_id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            price_id: subscription.items.data[0]?.price.id,
            status: subscription.status,
            current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
            cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
          }, {
            onConflict: 'user_id'
          })
          .select()

        if (error) {
          console.error('Error upserting subscription:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            userId: existingSubscription.user_id
          })
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        } else {
          console.log('Subscription upserted for user:', {
            userId: existingSubscription.user_id,
            subscriptionId: subscription.id,
            status: subscription.status,
            upsertResult
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log('Processing subscription deletion:', {
          type: event.type,
          livemode: event.livemode,
          customer_id: customerId,
          subscription_id: subscription.id
        })

        // Find the user by customer ID
        const { data: existingSubscription, error: findError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (findError || !existingSubscription) {
          console.error('Could not find user for customer:', {
            customerId,
            error: findError
          })
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Update the subscription status to canceled, keep current_period_end if provided
        const updateData: any = {
          status: 'canceled',
          cancel_at_period_end: false,
        }

        // Keep current_period_end if it exists in the subscription object
        const currentPeriodEnd = (subscription as any).current_period_end
        if (currentPeriodEnd) {
          updateData.current_period_end = new Date(currentPeriodEnd * 1000).toISOString()
        }

        const { data: updateResult, error } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('user_id', existingSubscription.user_id)
          .select()

        if (error) {
          console.error('Error canceling subscription:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            userId: existingSubscription.user_id
          })
          return NextResponse.json({ error: 'Database error' }, { status: 500 })
        } else {
          console.log('Subscription canceled for user:', {
            userId: existingSubscription.user_id,
            subscriptionId: subscription.id,
            updateResult
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

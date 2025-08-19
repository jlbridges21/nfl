import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
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

    const supabase = await createServiceRoleClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string
          const customerId = session.customer as string
          const userId = session.metadata?.user_id

          if (!userId) {
            console.error('No user_id in checkout session metadata')
            break
          }

          // Get the subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          
          // Update the subscription record
          const { error } = await supabase
            .from('subscriptions')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              price_id: subscription.items.data[0]?.price.id,
              status: 'active',
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
              cancel_at_period_end: (subscription as any).cancel_at_period_end,
            })
            .eq('user_id', userId)

          if (error) {
            console.error('Error updating subscription after checkout:', error)
          } else {
            console.log('Subscription activated for user:', userId)
          }
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find the user by customer ID
        const { data: existingSubscription, error: findError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (findError || !existingSubscription) {
          console.error('Could not find user for customer:', customerId)
          break
        }

        // Update the subscription
        const { error } = await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            price_id: subscription.items.data[0]?.price.id,
            status: subscription.status as any,
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: (subscription as any).cancel_at_period_end,
          })
          .eq('user_id', existingSubscription.user_id)

        if (error) {
          console.error('Error updating subscription:', error)
        } else {
          console.log('Subscription updated for user:', existingSubscription.user_id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find the user by customer ID
        const { data: existingSubscription, error: findError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (findError || !existingSubscription) {
          console.error('Could not find user for customer:', customerId)
          break
        }

        // Update the subscription status to canceled
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
          })
          .eq('user_id', existingSubscription.user_id)

        if (error) {
          console.error('Error canceling subscription:', error)
        } else {
          console.log('Subscription canceled for user:', existingSubscription.user_id)
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

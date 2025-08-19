'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreditCard, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useBilling } from '@/hooks/use-billing'

interface PaywallModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaywallModal({ open, onOpenChange }: PaywallModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { gracePeriodActive } = useBilling()

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to create checkout session'
        throw new Error(errorMessage)
      }
      
      const { url } = await response.json()
      
      if (!url) {
        throw new Error('No checkout URL received')
      }
      
      // Use window.location.assign for better reliability
      window.location.assign(url)
    } catch (error) {
      console.error('Checkout error:', error)
      const message = error instanceof Error ? error.message : 'Failed to start checkout process'
      toast.error(message)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            You've used all 10 of your free predictions. Unlock unlimited predictions for $0.99/month.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">Premium Plan - $0.99/month</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Unlimited NFL game predictions</li>
              <li>• Access to all prediction models</li>
              <li>• Advanced analytics and insights</li>
              <li>• Priority support</li>
              <li>• Cancel anytime</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Maybe Later
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpgrade}
              disabled={isLoading || gracePeriodActive}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {gracePeriodActive 
                ? 'Processing Payment...' 
                : isLoading 
                ? 'Processing...' 
                : 'Upgrade for $0.99/mo'
              }
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={async () => {
                try {
                  const response = await fetch('/api/stripe/portal', {
                    method: 'POST',
                  })
                  
                  if (!response.ok) {
                    throw new Error('Failed to open billing portal')
                  }
                  
                  const { url } = await response.json()
                  window.location.assign(url)
                } catch (error) {
                  toast.error('Failed to open billing portal')
                }
              }}
            >
              Manage Billing
            </Button>
            <p className="text-xs text-muted-foreground">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreditCard, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface PaywallModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaywallModal({ open, onOpenChange }: PaywallModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }
      
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast.error('Failed to start checkout process')
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Upgrade to Unlimited
          </DialogTitle>
          <DialogDescription>
            You've used all 10 of your free predictions. Upgrade to unlimited predictions for just $10/month.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">Unlimited Plan - $10/month</h3>
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
              disabled={isLoading}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isLoading ? 'Processing...' : 'Upgrade for $10/mo'}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Secure payment powered by Stripe. Cancel anytime from your account settings.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

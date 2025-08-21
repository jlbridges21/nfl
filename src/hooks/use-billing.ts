'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import type { Tables } from '@/types/database'

type BillingData = Tables<'me_billing'>

export function useBilling() {
  const [billing, setBilling] = useState<BillingData | null>(null)
  const [optimisticCredits, setOptimisticCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gracePeriodActive, setGracePeriodActive] = useState(false)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const { user, isAuthenticated } = useAuth()
  const supabase = createClient()

  const fetchBilling = async () => {
    if (!isAuthenticated || !user) {
      setBilling(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('me_billing')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        setError(fetchError.message)
        setBilling(null)
      } else {
        setBilling(data)
      }
    } catch (err) {
      setError('Failed to fetch billing information')
      setBilling(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBilling()
    
    // Check for success parameter in URL to start grace period
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('success') === '1') {
        startGracePeriod()
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [user, isAuthenticated])

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  const startGracePeriod = () => {
    setGracePeriodActive(true)
    
    // Start polling every 15 seconds for up to 5 minutes
    let pollCount = 0
    const maxPolls = 20 // 5 minutes / 15 seconds
    
    const interval = setInterval(async () => {
      pollCount++
      await fetchBilling()
      
      // Stop polling if subscription is active or max polls reached
      if (billing?.sub_status === 'active' || pollCount >= maxPolls) {
        setGracePeriodActive(false)
        clearInterval(interval)
        setPollingInterval(null)
      }
    }, 15000)
    
    setPollingInterval(interval)
    
    // End grace period after 5 minutes regardless
    setTimeout(() => {
      setGracePeriodActive(false)
      if (pollingInterval) {
        clearInterval(pollingInterval)
        setPollingInterval(null)
      }
    }, 5 * 60 * 1000)
  }

  const refreshBilling = () => {
    setOptimisticCredits(null) // Clear optimistic state
    fetchBilling()
  }

  const optimisticAdjustCredits = (delta: number) => {
    if (!billing) return
    
    const currentCredits = optimisticCredits ?? billing.free_credits_remaining
    const newCredits = Math.max(0, Math.min(15, currentCredits + delta))
    setOptimisticCredits(newCredits)
  }

  const getStatusDisplay = () => {
    if (!billing) return 'Loading...'
    
    // Show Premium during grace period or if actually active
    if (billing.sub_status === 'active' || gracePeriodActive) {
      return 'Premium'
    }
    
    return `Free: ${billing.free_credits_remaining}/15`
  }

  const hasActiveSubscription = billing?.sub_status === 'active' || gracePeriodActive
  const creditsRemaining = optimisticCredits ?? (billing?.free_credits_remaining ?? 0)
  const hasCreditsRemaining = creditsRemaining > 0

  const creditsLabel = hasActiveSubscription 
    ? 'Premium' 
    : `Credits: ${creditsRemaining}/15`

  return {
    billing,
    loading,
    error,
    refreshBilling,
    getStatusDisplay,
    hasActiveSubscription,
    hasCreditsRemaining,
    canMakePrediction: hasActiveSubscription || hasCreditsRemaining,
    gracePeriodActive,
    creditsRemaining,
    creditsLabel,
    optimisticAdjustCredits,
  }
}

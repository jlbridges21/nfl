"use client"

import { useState, useCallback, useEffect } from 'react'
import { getOrCreateDeviceId } from '@/lib/guest'
import { toast } from 'sonner'

export interface GuestCreditsState {
  used: number
  remaining: number
  loading: boolean
}

export interface GuestCreditsHook extends GuestCreditsState {
  refresh: () => Promise<void>
  updateCredits: (used: number, remaining: number) => void
  guestCreditsRemaining: number
  guestLabel: string
  optimisticAdjustGuestCredits: (delta: number) => void
  refreshGuestCredits: () => Promise<void>
}

export function useGuestCredits(): GuestCreditsHook {
  const [state, setState] = useState<GuestCreditsState>({
    used: 0,
    remaining: 10,
    loading: false,
  })
  const [optimisticRemaining, setOptimisticRemaining] = useState<number | null>(null)

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    setOptimisticRemaining(null) // Clear optimistic state

    try {
      const deviceId = await getOrCreateDeviceId()
      
      const response = await fetch('/api/guest/ensure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to refresh guest credits')
      }

      const data = await response.json()
      
      setState({
        used: data.used || 0,
        remaining: data.remaining !== undefined ? data.remaining : 10,
        loading: false,
      })
    } catch (error) {
      console.error('Failed to refresh guest credits:', error)
      toast.error('Failed to refresh guest credits')
      
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const updateCredits = useCallback((used: number, remaining: number) => {
    setState(prev => ({
      ...prev,
      used,
      remaining,
    }))
    setOptimisticRemaining(null) // Clear optimistic state when getting real data
  }, [])

  const optimisticAdjustGuestCredits = useCallback((delta: number) => {
    const currentRemaining = optimisticRemaining ?? state.remaining
    const newRemaining = Math.max(0, Math.min(10, currentRemaining + delta))
    setOptimisticRemaining(newRemaining)
  }, [optimisticRemaining, state.remaining])

  const refreshGuestCredits = useCallback(() => {
    return refresh()
  }, [refresh])

  // Initialize credits on mount
  useEffect(() => {
    refresh()
  }, [refresh])

  const guestCreditsRemaining = optimisticRemaining ?? state.remaining
  const guestLabel = `Guest: ${guestCreditsRemaining}/10`

  return {
    ...state,
    refresh,
    updateCredits,
    guestCreditsRemaining,
    guestLabel,
    optimisticAdjustGuestCredits,
    refreshGuestCredits,
    remaining: guestCreditsRemaining, // Override with optimistic value
  }
}

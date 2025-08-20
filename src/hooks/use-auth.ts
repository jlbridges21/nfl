'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { getOrCreateDeviceId } from '@/lib/guest'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUser = session?.user ?? null
        
        // Transfer guest credits when user signs in
        if (event === 'SIGNED_IN' && newUser) {
          try {
            const deviceId = await getOrCreateDeviceId()
            
            // Transfer guest credits to the authenticated user
            const response = await fetch('/api/auth/transfer-guest-credits', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: newUser.id,
                deviceId: deviceId,
              }),
            })

            if (!response.ok) {
              const errorData = await response.json()
              console.error('Failed to transfer guest credits:', errorData.error)
            } else {
              const result = await response.json()
              console.log('Guest credits transferred:', result)
            }
          } catch (error) {
            console.error('Error transferring guest credits:', error)
          }
        }
        
        // Do not clear guest device ID - let it persist across auth events
        setUser(newUser)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  }
}

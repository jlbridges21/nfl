'use client'

import { useAuth } from '@/hooks/use-auth'
import { SignInModal } from '@/components/auth/sign-in-modal'
import { ProfileDashboard } from '@/components/profile/profile-dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { User, LogIn } from 'lucide-react'
import { useState } from 'react'

export default function ProfilePage() {
  const { user, loading, isAuthenticated } = useAuth()
  const [showSignInModal, setShowSignInModal] = useState(false)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Sign in to view your profile</h2>
                    <p className="text-muted-foreground mt-2">
                      Access your prediction history, accuracy stats, and more.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowSignInModal(true)}
                    className="w-full"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <SignInModal 
          open={showSignInModal} 
          onOpenChange={setShowSignInModal}
        />
      </>
    )
  }

  return <ProfileDashboard />
}

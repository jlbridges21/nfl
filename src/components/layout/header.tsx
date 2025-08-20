"use client"

import Link from "next/link"
import { Zap, Settings, Menu, X, User, LogOut, CreditCard } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SignInModal } from "@/components/auth/sign-in-modal"
import { PaywallModal } from "@/components/auth/paywall-modal"
import { useAuth } from "@/hooks/use-auth"
import { useBilling } from "@/hooks/use-billing"
import { useGuestCredits } from "@/hooks/use-guest-credits"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [showPaywallModal, setShowPaywallModal] = useState(false)
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth()
  const { getStatusDisplay, refreshBilling, billing, hasActiveSubscription, gracePeriodActive, loading: billingLoading } = useBilling()
  const { used: guestUsed, remaining: guestRemaining, loading: guestLoading, refresh: refreshGuestCredits } = useGuestCredits()

  // Listen for guest credit updates from other components
  useEffect(() => {
    const handleGuestCreditsUpdate = () => {
      refreshGuestCredits()
      // Also refresh billing for signed-in users
      if (isAuthenticated) {
        refreshBilling()
      }
    }

    window.addEventListener('GUEST_CREDITS_UPDATED', handleGuestCreditsUpdate)
    
    return () => {
      window.removeEventListener('GUEST_CREDITS_UPDATED', handleGuestCreditsUpdate)
    }
  }, [refreshGuestCredits, refreshBilling, isAuthenticated])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      refreshBilling()
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }
      
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast.error('Failed to open billing portal')
    }
  }

  const handleStatusBadgeClick = () => {
    // Open paywall modal if user has no active subscription and no credits remaining
    if (billing && !hasActiveSubscription && billing.free_credits_remaining === 0) {
      setShowPaywallModal(true)
    }
  }

  const handleGuestBadgeClick = () => {
    // Always open paywall modal when clicking guest credits badge
    setShowPaywallModal(true)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-[var(--nfl-accent)]" />
            <span className="text-xl font-bold text-foreground">
              NFL Predict Plus
            </span>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/" className={navigationMenuTriggerStyle()}>
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/team-stats" className={navigationMenuTriggerStyle()}>
                    Team Stats
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/scoreboard" className={navigationMenuTriggerStyle()}>
                    Scoreboard
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/profile" className={navigationMenuTriggerStyle()}>
                    History
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/about" className={navigationMenuTriggerStyle()}>
                    About
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {/* Auth and Billing Section */}
            {authLoading ? (
              <div className="h-9 w-20 animate-pulse bg-muted rounded" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                {/* Guest Credits Badge for Free Users or Premium Badge for Premium Users */}
                {hasActiveSubscription ? (
                  <Badge 
                    variant="default"
                    className={cn(
                      "hidden sm:inline-flex",
                      gracePeriodActive ? "animate-pulse" : ""
                    )}
                  >
                    Premium
                  </Badge>
                ) : (
                  <>
                    {(guestLoading || billingLoading) ? (
                      <div className="h-6 w-16 animate-pulse bg-muted rounded" />
                    ) : (
                      <Badge 
                        variant="outline"
                        className={cn(
                          "hidden sm:inline-flex cursor-pointer hover:bg-secondary/80",
                          (isAuthenticated ? (billing?.free_credits_remaining || 0) === 0 : guestRemaining === 0) ? "animate-pulse" : ""
                        )}
                        onClick={handleGuestBadgeClick}
                      >
                        Guest Credits: {isAuthenticated ? `${billing?.free_credits_remaining || 0}/10` : `${10-guestUsed}/10`}
                      </Badge>
                    )}
                  </>
                )}
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline-block max-w-32 truncate">
                        {user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.email}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground sm:hidden">
                      {hasActiveSubscription ? (
                        <Badge 
                          variant="default"
                          className={cn(
                            "text-xs",
                            gracePeriodActive ? "animate-pulse" : ""
                          )}
                        >
                          Premium
                        </Badge>
                      ) : (
                        <>
                          {guestLoading ? (
                            <div className="h-4 w-16 animate-pulse bg-muted rounded" />
                          ) : (
                            <Badge 
                              variant="outline"
                              className={cn(
                                "text-xs cursor-pointer hover:bg-secondary/80",
                                guestRemaining === 0 ? "animate-pulse" : ""
                              )}
                              onClick={handleGuestBadgeClick}
                            >
                              Guest Credits: {10-guestUsed}/10
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleManageBilling}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Billing
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Guest Credits Badge */}
                {guestLoading ? (
                  <div className="h-6 w-16 animate-pulse bg-muted rounded" />
                ) : (
                  <Badge 
                    variant="outline"
                    className={cn(
                      "hidden sm:inline-flex cursor-pointer hover:bg-secondary/80",
                      guestRemaining === 0 ? "animate-pulse" : ""
                    )}
                    onClick={handleGuestBadgeClick}
                  >
                    Guest Credits: {10-guestUsed}/10
                  </Badge>
                )}
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => setShowSignInModal(true)}
                >
                  Sign In
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Menu className="h-[1.2rem] w-[1.2rem]" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container py-4 space-y-2">
              <Link
                href="/"
                className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                href="/team-stats"
                className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Team Stats
              </Link>
              <Link
                href="/scoreboard"
                className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Scoreboard
              </Link>
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                History
              </Link>
              <Link
                href="/about"
                className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              
              {/* Mobile Auth Section */}
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2 border-t">
                    <div className="text-sm font-medium mb-1">{user.email}</div>
                    {hasActiveSubscription ? (
                      <Badge 
                        variant="default"
                        className={cn(
                          "text-xs",
                          gracePeriodActive ? "animate-pulse" : ""
                        )}
                      >
                        Premium
                      </Badge>
                    ) : (
                      <>
                        {(guestLoading || billingLoading) ? (
                          <div className="h-4 w-16 animate-pulse bg-muted rounded" />
                        ) : (
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs cursor-pointer hover:bg-secondary/80",
                              (isAuthenticated ? (billing?.free_credits_remaining || 0) === 0 : guestRemaining === 0) ? "animate-pulse" : ""
                            )}
                            onClick={handleGuestBadgeClick}
                          >
                            Guest Credits: {isAuthenticated ? `${billing?.free_credits_remaining || 0}/10` : `${10-guestUsed}/10`}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <Link
                    href="/profile"
                    className="block"
                    onClick={closeMobileMenu}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      handleManageBilling()
                      closeMobileMenu()
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Billing
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      handleSignOut()
                      closeMobileMenu()
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="px-4 py-2 border-t">
                  <div className="text-sm font-medium mb-2">Guest Mode</div>
                  {guestLoading ? (
                    <div className="h-6 w-24 animate-pulse bg-muted rounded mb-2" />
                  ) : (
                    <Badge 
                      variant="outline"
                      className={cn(
                        "mb-2 cursor-pointer hover:bg-secondary/80",
                        guestRemaining === 0 ? "animate-pulse" : ""
                      )}
                      onClick={handleGuestBadgeClick}
                    >
                      Guest Credits: {10-guestUsed}/10
                    </Badge>
                  )}
                  <Button 
                    variant="default" 
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setShowSignInModal(true)
                      closeMobileMenu()
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              )}
              
              <div className="px-4 py-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Settings"
                  className="w-full justify-start"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('OPEN_CALCULATION_MODAL'))
                    }
                    closeMobileMenu()
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Sign In Modal */}
      <SignInModal 
        open={showSignInModal} 
        onOpenChange={setShowSignInModal}
        onSignInSuccess={() => {
          // After signing in, reopen paywall modal for upgrade
          setShowPaywallModal(true)
        }}
      />

      {/* Paywall Modal */}
      <PaywallModal 
        open={showPaywallModal} 
        onOpenChange={setShowPaywallModal}
        onSignInRequired={() => {
          setShowPaywallModal(false)
          setShowSignInModal(true)
        }}
      />
    </>
  )
}

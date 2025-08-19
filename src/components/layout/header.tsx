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
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [showPaywallModal, setShowPaywallModal] = useState(false)
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth()
  const { getStatusDisplay, refreshBilling, billing, hasActiveSubscription, gracePeriodActive } = useBilling()

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

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-[var(--nfl-accent)]" />
            <span className="text-xl font-bold text-foreground">
              NFL Game Predictor
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
                {/* Status Badge */}
                <Badge 
                  variant={hasActiveSubscription ? "default" : "secondary"}
                  className={cn(
                    "hidden sm:inline-flex",
                    billing && !hasActiveSubscription && billing.free_credits_remaining === 0 
                      ? "cursor-pointer hover:bg-secondary/80" 
                      : "",
                    gracePeriodActive ? "animate-pulse" : ""
                  )}
                  onClick={handleStatusBadgeClick}
                >
                  {getStatusDisplay()}
                </Badge>
                
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
                      <Badge 
                        variant={hasActiveSubscription ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          gracePeriodActive ? "animate-pulse" : ""
                        )}
                      >
                        {getStatusDisplay()}
                      </Badge>
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
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowSignInModal(true)}
              >
                Sign In
              </Button>
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
                    <Badge 
                      variant={hasActiveSubscription ? "default" : "secondary"}
                      className={cn(
                        "text-xs",
                        gracePeriodActive ? "animate-pulse" : ""
                      )}
                    >
                      {getStatusDisplay()}
                    </Badge>
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
      />

      {/* Paywall Modal */}
      <PaywallModal 
        open={showPaywallModal} 
        onOpenChange={setShowPaywallModal}
      />
    </>
  )
}

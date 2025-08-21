"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

interface CreditsBadgeProps {
  credits: number
  maxCredits?: number
  loading?: boolean
  onClick?: () => void
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary"
  size?: "sm" | "default" | "lg"
}

export function CreditsBadge({ 
  credits, 
  maxCredits = 10, 
  loading = false,
  onClick,
  className,
  variant = "outline",
  size = "default"
}: CreditsBadgeProps) {
  const { isAuthenticated } = useAuth()

  if (loading) {
    return <div className={cn("h-6 w-16 animate-pulse bg-muted rounded", className)} />
  }

  const actualMaxCredits = isAuthenticated ? 15 : 10
  const label = isAuthenticated 
    ? `Credits: ${credits}/${actualMaxCredits}` 
    : `Guest Credits: ${credits}/${actualMaxCredits}`

  const isLowCredits = credits === 0
  const sizeClasses = {
    sm: "text-xs",
    default: "",
    lg: "text-base"
  }

  return (
    <Badge 
      variant={variant}
      className={cn(
        "cursor-pointer hover:bg-secondary/80",
        sizeClasses[size],
        isLowCredits ? "animate-pulse" : "",
        className
      )}
      onClick={onClick}
    >
      {label}
    </Badge>
  )
}

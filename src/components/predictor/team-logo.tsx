import { teamColors, type TeamCode } from "@/config/theme"
import { cn } from "@/lib/utils"

interface TeamLogoProps {
  teamCode: TeamCode
  size?: "sm" | "md" | "lg"
  className?: string
}

export function TeamLogo({ teamCode, size = "md", className }: TeamLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-base",
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold text-white",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: teamColors[teamCode] }}
    >
      {teamCode}
    </div>
  )
}

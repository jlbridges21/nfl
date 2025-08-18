"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Shield, Target, Zap, Activity, Swords } from "lucide-react"
import type { TeamsRow } from "@/types/db"

interface TeamStats {
  team_id: string
  Year: number
  Points_Per_Game: number
  Opponent_Points_per_Game: number
  Yards_per_Game: number
  Opponent_Yards_per_Game: number
  Passing_Yards_Per_Game: number
  Opponent_Passing_Yards_per_Game: number
  Rushing_Yards_Per_Game_: number
  Opponent_Rushing_Yards_per_Game: number
  Average_Scoring_Margin: number
  Yards_Per_Point: number
  Red_Zone_Scores_Per_Game_TD_only: number
  Opponent_Red_Zone_Scores_per_Game_TDs_only: number
  teams: TeamsRow
}

interface TeamComparisonProps {
  awayTeam: TeamsRow
  homeTeam: TeamsRow
  year: number
}

interface StatComparison {
  name: string
  icon: React.ComponentType<{ className?: string }>
  awayValue: number
  homeValue: number
  unit: string
  higherIsBetter: boolean
  category: 'offense' | 'defense' | 'efficiency'
}

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

const createTeamColorStyles = (teamColor: string) => {
  const rgb = hexToRgb(teamColor || '#6b7280')
  if (!rgb) return {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    color: 'rgb(75, 85, 99)'
  }
  
  return {
    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
    color: `rgba(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)}, 1)`
  }
}

const createGradient = (color1: string, color2: string): string => {
  const rgb1 = hexToRgb(color1 || '#6b7280')
  const rgb2 = hexToRgb(color2 || '#6b7280')
  
  if (!rgb1 || !rgb2) return 'linear-gradient(135deg, #6b7280 0%, #6b7280 100%)'
  
  return `linear-gradient(135deg, rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, 0.8) 0%, rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.8) 100%)`
}

export function TeamComparison({ awayTeam, homeTeam, year }: TeamComparisonProps) {
  const [awayStats, setAwayStats] = useState<TeamStats | null>(null)
  const [homeStats, setHomeStats] = useState<TeamStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTeamStats() {
      try {
        setLoading(true)
        const response = await fetch(`/api/team-stats?year=${year}`)
        const data = await response.json()
        
        if (data.data) {
          const awayTeamStats = data.data.find((stat: TeamStats) => stat.team_id === awayTeam.id)
          const homeTeamStats = data.data.find((stat: TeamStats) => stat.team_id === homeTeam.id)
          
          setAwayStats(awayTeamStats || null)
          setHomeStats(homeTeamStats || null)
        }
      } catch (error) {
        console.error('Failed to fetch team stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamStats()
  }, [awayTeam.id, homeTeam.id, year])

  if (loading) {
    return (
      <Card className="rounded-2xl border-border shadow-md dark:shadow-none">
        <CardHeader className="p-6 md:p-8">
          <CardTitle>Team Stats Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0">
          <div className="space-y-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!awayStats || !homeStats) {
    return (
      <Card className="rounded-2xl border-border shadow-md dark:shadow-none">
        <CardHeader className="p-6 md:p-8">
          <CardTitle>Team Stats Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0">
          <div className="text-center text-muted-foreground">
            Team statistics not available for {year} season
          </div>
        </CardContent>
      </Card>
    )
  }

  const statComparisons: StatComparison[] = [
    {
      name: "Points Per Game",
      icon: Target,
      awayValue: awayStats.Points_Per_Game || 0,
      homeValue: homeStats.Points_Per_Game || 0,
      unit: "pts",
      higherIsBetter: true,
      category: 'offense'
    },
    {
      name: "Points Allowed",
      icon: Shield,
      awayValue: awayStats.Opponent_Points_per_Game || 0,
      homeValue: homeStats.Opponent_Points_per_Game || 0,
      unit: "pts",
      higherIsBetter: false,
      category: 'defense'
    },
    {
      name: "Total Yards Per Game",
      icon: TrendingUp,
      awayValue: awayStats.Yards_per_Game || 0,
      homeValue: homeStats.Yards_per_Game || 0,
      unit: "yds",
      higherIsBetter: true,
      category: 'offense'
    },
    {
      name: "Yards Allowed",
      icon: TrendingDown,
      awayValue: awayStats.Opponent_Yards_per_Game || 0,
      homeValue: homeStats.Opponent_Yards_per_Game || 0,
      unit: "yds",
      higherIsBetter: false,
      category: 'defense'
    },
    {
      name: "Passing Yards Per Game",
      icon: Zap,
      awayValue: awayStats.Passing_Yards_Per_Game || 0,
      homeValue: homeStats.Passing_Yards_Per_Game || 0,
      unit: "yds",
      higherIsBetter: true,
      category: 'offense'
    },
    {
      name: "Rushing Yards Per Game",
      icon: Activity,
      awayValue: awayStats.Rushing_Yards_Per_Game_ || 0,
      homeValue: homeStats.Rushing_Yards_Per_Game_ || 0,
      unit: "yds",
      higherIsBetter: true,
      category: 'offense'
    },
    {
      name: "Scoring Margin",
      icon: Target,
      awayValue: awayStats.Average_Scoring_Margin || 0,
      homeValue: homeStats.Average_Scoring_Margin || 0,
      unit: "pts",
      higherIsBetter: true,
      category: 'efficiency'
    },
    {
      name: "Yards Per Point",
      icon: TrendingUp,
      awayValue: awayStats.Yards_Per_Point || 0,
      homeValue: homeStats.Yards_Per_Point || 0,
      unit: "yds/pt",
      higherIsBetter: false,
      category: 'efficiency'
    }
  ]

  const gradient = createGradient(awayTeam.primaryColor || '#6b7280', homeTeam.primaryColor || '#6b7280')

  const StatSlider = ({ stat }: { stat: StatComparison }) => {
    const awayBetter = stat.higherIsBetter 
      ? stat.awayValue > stat.homeValue 
      : stat.awayValue < stat.homeValue
    
    const total = Math.abs(stat.awayValue) + Math.abs(stat.homeValue)
    const awayPercentage = total > 0 ? (Math.abs(stat.awayValue) / total) * 100 : 50
    
    // Calculate the visual representation for the comparison bar
    const awayWidth = awayPercentage
    const homeWidth = 100 - awayPercentage

    const IconComponent = stat.icon

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{stat.name}</span>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              stat.category === 'offense' ? 'border-blue-500 text-blue-600' :
              stat.category === 'defense' ? 'border-red-500 text-red-600' :
              'border-purple-500 text-purple-600'
            }`}
          >
            {stat.category.toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {awayTeam.logoUrl ? (
              <img 
                src={awayTeam.logoUrl} 
                alt={`${awayTeam.name} logo`}
                className="h-5 w-5 object-contain"
              />
            ) : (
              <div 
                className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: awayTeam.primaryColor || '#6b7280' }}
              >
                {awayTeam.abbreviation.slice(0, 2)}
              </div>
            )}
            <span className={`font-semibold ${awayBetter ? 'text-green-600' : 'text-muted-foreground'}`}>
              {stat.awayValue.toFixed(1)} {stat.unit}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${!awayBetter ? 'text-green-600' : 'text-muted-foreground'}`}>
              {stat.homeValue.toFixed(1)} {stat.unit}
            </span>
            {homeTeam.logoUrl ? (
              <img 
                src={homeTeam.logoUrl} 
                alt={`${homeTeam.name} logo`}
                className="h-5 w-5 object-contain"
              />
            ) : (
              <div 
                className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: homeTeam.primaryColor || '#6b7280' }}
              >
                {homeTeam.abbreviation.slice(0, 2)}
              </div>
            )}
          </div>
        </div>
        
        {/* Team vs Team Comparison Bar */}
        <div className="relative flex items-center h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {/* Away Team Side */}
          <div 
            className="h-full flex items-center justify-end pr-2 transition-all duration-300"
            style={{ 
              width: `${awayWidth}%`,
              backgroundColor: awayTeam.primaryColor || '#6b7280',
              opacity: awayBetter ? 1 : 0.7
            }}
          >
            <span className="text-white text-xs font-bold">
              {awayTeam.abbreviation}
            </span>
          </div>
          
          {/* Center VS Icon */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-white dark:bg-gray-900 rounded-full p-1 border-2 border-gray-300 dark:border-gray-600 shadow-sm">
              <Swords className="h-3 w-3 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          
          {/* Home Team Side */}
          <div 
            className="h-full flex items-center justify-start pl-2 transition-all duration-300"
            style={{ 
              width: `${homeWidth}%`,
              backgroundColor: homeTeam.primaryColor || '#6b7280',
              opacity: !awayBetter ? 1 : 0.7
            }}
          >
            <span className="text-white text-xs font-bold">
              {homeTeam.abbreviation}
            </span>
          </div>
        </div>
        
        {/* Advantage Indicator */}
        <div className="flex justify-center">
          <div 
            className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium"
            style={awayBetter 
              ? createTeamColorStyles(awayTeam.primaryColor || '#6b7280')
              : createTeamColorStyles(homeTeam.primaryColor || '#6b7280')
            }
          >
            {awayBetter ? (
              <>
                {awayTeam.logoUrl ? (
                  <img 
                    src={awayTeam.logoUrl} 
                    alt={`${awayTeam.name} logo`}
                    className="h-3 w-3 object-contain"
                  />
                ) : (
                  <div 
                    className="h-3 w-3 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                    style={{ backgroundColor: awayTeam.primaryColor || '#6b7280' }}
                  >
                    {awayTeam.abbreviation.slice(0, 1)}
                  </div>
                )}
                {awayTeam.abbreviation} advantage
              </>
            ) : (
              <>
                {homeTeam.logoUrl ? (
                  <img 
                    src={homeTeam.logoUrl} 
                    alt={`${homeTeam.name} logo`}
                    className="h-3 w-3 object-contain"
                  />
                ) : (
                  <div 
                    className="h-3 w-3 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                    style={{ backgroundColor: homeTeam.primaryColor || '#6b7280' }}
                  >
                    {homeTeam.abbreviation.slice(0, 1)}
                  </div>
                )}
                {homeTeam.abbreviation} advantage
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card 
      className="rounded-2xl border-border shadow-md dark:shadow-none overflow-hidden"
      style={{ background: gradient }}
    >
      <div className="bg-background/95 backdrop-blur-sm">
        <CardHeader className="p-6 md:p-8">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">2024 Team Stats Comparison</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {awayTeam.logoUrl ? (
                  <img 
                    src={awayTeam.logoUrl} 
                    alt={`${awayTeam.name} logo`}
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: awayTeam.primaryColor || '#6b7280' }}
                  >
                    {awayTeam.abbreviation}
                  </div>
                )}
                <span className="font-semibold text-sm">{awayTeam.abbreviation}</span>
              </div>
              <span className="text-muted-foreground">vs</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{homeTeam.abbreviation}</span>
                {homeTeam.logoUrl ? (
                  <img 
                    src={homeTeam.logoUrl} 
                    alt={`${homeTeam.name} logo`}
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: homeTeam.primaryColor || '#6b7280' }}
                  >
                    {homeTeam.abbreviation}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0">
          <div className="space-y-6">
            {statComparisons.map((stat, index) => (
              <StatSlider key={index} stat={stat} />
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

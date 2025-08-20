'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Settings, Calendar, Target } from 'lucide-react'
import { Tables } from '@/types/database'
import { cn } from '@/lib/utils'

type PredictionEnriched = Tables<'my_predictions_enriched'>

interface PredictionCardProps {
  prediction: PredictionEnriched
}

interface BoxScore {
  q1: number
  q2: number
  q3: number
  q4: number
  ot?: number
}

function parseBoxScore(boxScoreString: string | null): BoxScore | null {
  if (!boxScoreString) return null
  
  try {
    const scores = boxScoreString.split(',').map(s => parseInt(s.trim(), 10))
    if (scores.length < 4) return null
    
    const boxScore: BoxScore = {
      q1: scores[0] || 0,
      q2: scores[1] || 0,
      q3: scores[2] || 0,
      q4: scores[3] || 0,
    }
    
    if (scores.length > 4 && scores[4] > 0) {
      boxScore.ot = scores[4]
    }
    
    return boxScore
  } catch {
    return null
  }
}

function TeamLogo({ logoUrl, teamAbbr, teamName }: { logoUrl: string | null, teamAbbr: string, teamName: string }) {
  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={`${teamName} logo`}
        className="h-8 w-8 object-contain"
        onError={(e) => {
          // Fallback to abbreviation if image fails to load
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          target.nextElementSibling?.classList.remove('hidden')
        }}
      />
    )
  }
  
  return (
    <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
      {teamAbbr}
    </div>
  )
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  
  const homeBoxScore = parseBoxScore(prediction.box_home)
  const awayBoxScore = parseBoxScore(prediction.box_away)
  
  const showActualResults = prediction.season_year === 2024 && 
    prediction.home_score !== null && 
    prediction.away_score !== null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatConfiguration = (config: any) => {
    if (!config || typeof config !== 'object') return {}
    
    // Handle missing keys gracefully
    const defaultConfig = {
      offensiveWeight: 0.3,
      defensiveWeight: 0.3,
      recentFormWeight: 0.2,
      homeFieldWeight: 0.2
    }
    
    return { ...defaultConfig, ...config }
  }

  const configuration = formatConfiguration(prediction.user_configuration)

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        {/* Team Matchup Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Home Team */}
            <div className="flex items-center space-x-2">
              <TeamLogo 
                logoUrl={prediction.home_team_logo} 
                teamAbbr={prediction.home_team_abbr}
                teamName={prediction.home_team_name}
              />
              <div className="hidden sm:block">
                <div className="font-semibold">{prediction.home_team_name}</div>
                <div className="text-xs text-muted-foreground">{prediction.home_team_abbr}</div>
              </div>
              <div className="sm:hidden font-semibold">{prediction.home_team_abbr}</div>
            </div>
            
            <div className="text-muted-foreground font-medium">vs</div>
            
            {/* Away Team */}
            <div className="flex items-center space-x-2">
              <TeamLogo 
                logoUrl={prediction.away_team_logo} 
                teamAbbr={prediction.away_team_abbr}
                teamName={prediction.away_team_name}
              />
              <div className="hidden sm:block">
                <div className="font-semibold">{prediction.away_team_name}</div>
                <div className="text-xs text-muted-foreground">{prediction.away_team_abbr}</div>
              </div>
              <div className="sm:hidden font-semibold">{prediction.away_team_abbr}</div>
            </div>
          </div>
          
          {/* Timestamp */}
          <div className="text-xs text-muted-foreground flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(prediction.created_at)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Predicted Score */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Predicted Score</span>
            <Badge variant="secondary" className="text-xs">Predicted</Badge>
          </div>
          <div className="font-mono text-lg font-bold">
            {prediction.predicted_home_score} - {prediction.predicted_away_score}
          </div>
        </div>

        {/* Actual Results (only for 2024 games with scores) */}
        {showActualResults && (
          <div className={cn(
            "space-y-3 p-3 border rounded-lg",
            prediction.was_accurate === true ? "bg-green-50 border-green-200" : "bg-muted/30"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Actual Result</span>
                <Badge variant="outline" className="text-xs">{prediction.week_name} - 2024 Season</Badge>
              </div>
              <div className="font-mono text-lg font-bold">
                {prediction.home_score} - {prediction.away_score}
              </div>
            </div>

            {/* Box Scores */}
            {(homeBoxScore || awayBoxScore) && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Quarter by Quarter</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 pr-2">Team</th>
                        <th className="text-center py-1 px-1">Q1</th>
                        <th className="text-center py-1 px-1">Q2</th>
                        <th className="text-center py-1 px-1">Q3</th>
                        <th className="text-center py-1 px-1">Q4</th>
                        {(homeBoxScore?.ot || awayBoxScore?.ot) && (
                          <th className="text-center py-1 px-1">OT</th>
                        )}
                        <th className="text-center py-1 pl-2 font-bold">Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1 pr-2 font-medium">{prediction.home_team_abbr}</td>
                        <td className="text-center py-1 px-1">{homeBoxScore?.q1 || 0}</td>
                        <td className="text-center py-1 px-1">{homeBoxScore?.q2 || 0}</td>
                        <td className="text-center py-1 px-1">{homeBoxScore?.q3 || 0}</td>
                        <td className="text-center py-1 px-1">{homeBoxScore?.q4 || 0}</td>
                        {(homeBoxScore?.ot || awayBoxScore?.ot) && (
                          <td className="text-center py-1 px-1">{homeBoxScore?.ot || 0}</td>
                        )}
                        <td className="text-center py-1 pl-2 font-bold">{prediction.home_score}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-2 font-medium">{prediction.away_team_abbr}</td>
                        <td className="text-center py-1 px-1">{awayBoxScore?.q1 || 0}</td>
                        <td className="text-center py-1 px-1">{awayBoxScore?.q2 || 0}</td>
                        <td className="text-center py-1 px-1">{awayBoxScore?.q3 || 0}</td>
                        <td className="text-center py-1 px-1">{awayBoxScore?.q4 || 0}</td>
                        {(homeBoxScore?.ot || awayBoxScore?.ot) && (
                          <td className="text-center py-1 px-1">{awayBoxScore?.ot || 0}</td>
                        )}
                        <td className="text-center py-1 pl-2 font-bold">{prediction.away_score}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

    {/* Outcome Details with Model Settings */}
    <div className="w-full">
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-2">
          {prediction.was_accurate !== null && (
            <Badge
              variant={prediction.was_accurate ? "default" : "destructive"}
              className="text-xs"
            >
              {prediction.was_accurate ? "Correct" : "Incorrect"}
            </Badge>
          )}
          {prediction.error_margin !== null && (
            <span
              className={cn(
                "text-sm",
                Math.abs(prediction.error_margin) === 0
                  ? "text-background"
                  : "text-muted-foreground"
              )}
            >
              Error: {Math.abs(prediction.error_margin)} pts
            </span>
          )}
        </div>
      </div>
    </div>
          </CardContent>
    </Card>
  )
}
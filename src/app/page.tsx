"use client"

import { useState, useCallback } from "react"
import { Sparkles, TrendingUp, Gauge, Shield, Home, Info, Award, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Container } from "@/components/layout/container"
import { TeamSelector } from "@/components/predictor/team-selector"
import { TeamComparison } from "@/components/predictor/team-comparison"
import { SettingsModal, type PredictionSettings } from "@/components/predictor/settings-modal"
import { CalculationModal } from "@/components/predictor/calculation-modal"
import { ActualGameResult } from "@/components/predictor/actual-game-result"
import { toast } from "sonner"
import type { TeamsRow } from "@/types/db"
import type { ContributionsItem } from "@/model/scoring"

interface MatchupState {
  awayTeam: string
  homeTeam: string
}

interface PredictionResponse {
  meta: {
    homeTeam: TeamsRow
    awayTeam: TeamsRow
    year: number
  }
  prediction: {
    homeScore: number
    awayScore: number
    total: number
    spread: number
    predictedWinner: "Home" | "Away"
    winProbabilityHome: number
    confidence: number
  }
  contributions: ContributionsItem[]
  inputs?: {
    home: any
    away: any
    league: {
      leagueAvgDefensiveYardsAllowed: number
      leagueAvgDefensivePointsAllowed: number
      leagueAvgYardsPerPoint: number
    }
  }
  calculationDetails?: {
    adjustedHomeYards: number
    adjustedAwayYards: number
  }
}

const contributionIcons = {
  offense: TrendingUp,
  efficiency: Gauge,
  defense: Shield,
  homeField: Home,
  recentForm: Repeat,
  fpiEdge: Award,
}

const contributionLabels = {
  offense: "Offensive Scoring",
  efficiency: "Efficiency / YPP",
  defense: "Defensive Strength",
  homeField: "Home Field Advantage",
  recentForm: "Recent Form",
  fpiEdge: "FPI Edge",
}

const contributionDescriptions = {
  offense: "Yards per game and offensive production",
  efficiency: "Yards per point differential",
  defense: "Points allowed and defensive strength",
  homeField: "Historical home team performance",
  recentForm: "Last 3 games weighted performance",
  fpiEdge: "ESPN Football Power Index advantage",
}

export default function HomePage() {
  const [matchup, setMatchup] = useState<MatchupState>({
    awayTeam: "",
    homeTeam: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [currentSettings, setCurrentSettings] = useState<PredictionSettings | null>(null)

  const canPredict = matchup.awayTeam && matchup.homeTeam && matchup.awayTeam !== matchup.homeTeam

  const generatePrediction = useCallback(async (settingsOverride?: PredictionSettings) => {
    if (!canPredict) return

    setIsLoading(true)
    setPrediction(null)

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeId: matchup.homeTeam,
          awayId: matchup.awayTeam,
          settings: settingsOverride || currentSettings,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prediction')
      }

      setPrediction(data)
      toast.success("Prediction generated successfully!")

    } catch (error) {
      console.error('Prediction error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to generate prediction")
    } finally {
      setIsLoading(false)
    }
  }, [canPredict, matchup.homeTeam, matchup.awayTeam, currentSettings])

  // Handle settings changes and re-run prediction if we have a current matchup
  const handleSettingsChange = useCallback((settings: PredictionSettings) => {
    setCurrentSettings(settings)
    
    // If we have a prediction already, re-run it with new settings
    if (prediction && canPredict) {
      generatePrediction(settings)
    }
  }, [prediction, canPredict, generatePrediction])

  // Button click handler that doesn't take settings parameter
  const handleButtonClick = useCallback(() => {
    generatePrediction()
  }, [generatePrediction])

  const formatSpread = (spread: number, favoredTeam: TeamsRow) => {
    const absSpread = Math.abs(spread)
    return `${favoredTeam.abbreviation} -${absSpread.toFixed(1)}`
  }

  return (
    <Container className="py-4 sm:py-8 space-y-4 sm:space-y-8">
      {/* Hero Section - Select Matchup */}
      <Card className="rounded-xl sm:rounded-2xl border-border shadow-md dark:shadow-none">
        <CardHeader className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Select Matchup</CardTitle>
              <CardDescription className="mt-1 sm:mt-2 text-sm sm:text-base">
                Choose two teams to generate a prediction
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <SettingsModal onSettingsChange={handleSettingsChange} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Away Team */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Away Team</label>
              <TeamSelector
                value={matchup.awayTeam}
                onValueChange={(value) => setMatchup(prev => ({ ...prev, awayTeam: value }))}
                placeholder="Select away team"
                ariaLabel="Select Away Team"
              />
            </div>

            {/* Home Team */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Home Team</label>
              <TeamSelector
                value={matchup.homeTeam}
                onValueChange={(value) => setMatchup(prev => ({ ...prev, homeTeam: value }))}
                placeholder="Select home team"
                ariaLabel="Select Home Team"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Button
              onClick={handleButtonClick}
              disabled={!canPredict || isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? "Generating..." : "Generate Prediction"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Predictions use advanced analytics including FPI, efficiency metrics, and recent form.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {(isLoading || prediction) && (
        <div className="space-y-4 sm:space-y-6">
          {/* Scoreboard */}
          <Card className="rounded-xl sm:rounded-2xl border-border shadow-md dark:shadow-none">
            <CardHeader className="p-4 sm:p-6 md:p-8 pb-2 sm:pb-4">
              <CardTitle className="text-center text-lg sm:text-xl">Prediction Results</CardTitle>
              {prediction && (
                <CardDescription className="text-center text-sm sm:text-base">
                  Based on {prediction.meta.year} season data
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-4 sm:p-6 md:p-8 pt-0">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : prediction ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Team Matchup */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {prediction.meta.awayTeam.logoUrl ? (
                        <img 
                          src={prediction.meta.awayTeam.logoUrl} 
                          alt={`${prediction.meta.awayTeam.name} logo`}
                          className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                        />
                      ) : (
                        <div 
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white"
                          style={{ backgroundColor: prediction.meta.awayTeam.primaryColor || '#6b7280' }}
                        >
                          {prediction.meta.awayTeam.abbreviation}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-sm sm:text-base">{prediction.meta.awayTeam.name}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Away</div>
                      </div>
                    </div>
                    <div className="text-center order-last sm:order-none">
                      <div className="text-2xl sm:text-3xl font-bold">
                        {prediction.prediction.awayScore} – {prediction.prediction.homeScore}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">PREDICTED</div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-right">
                        <div className="font-semibold text-sm sm:text-base">{prediction.meta.homeTeam.name}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Home</div>
                      </div>
                      {prediction.meta.homeTeam.logoUrl ? (
                        <img 
                          src={prediction.meta.homeTeam.logoUrl} 
                          alt={`${prediction.meta.homeTeam.name} logo`}
                          className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                        />
                      ) : (
                        <div 
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white"
                          style={{ backgroundColor: prediction.meta.homeTeam.primaryColor || '#6b7280' }}
                        >
                          {prediction.meta.homeTeam.abbreviation}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Betting Lines */}
                  <div className="flex justify-center gap-3 sm:gap-4">
                    <Card className="px-3 py-2 sm:px-4">
                      <div className="text-center">
                        <div className="text-xs sm:text-sm text-muted-foreground">Spread</div>
                        <div className="font-semibold text-sm sm:text-base">
                          {prediction.prediction.spread > 0 
                            ? formatSpread(prediction.prediction.spread, prediction.meta.homeTeam)
                            : formatSpread(prediction.prediction.spread, prediction.meta.awayTeam)
                          }
                        </div>
                      </div>
                    </Card>
                    <Card className="px-3 py-2 sm:px-4">
                      <div className="text-center">
                        <div className="text-xs sm:text-sm text-muted-foreground">Total (O/U)</div>
                        <div className="font-semibold text-sm sm:text-base">{prediction.prediction.total.toFixed(1)}</div>
                      </div>
                    </Card>
                  </div>

                  {/* Win Probability */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{prediction.meta.awayTeam.abbreviation} {((1 - prediction.prediction.winProbabilityHome) * 100).toFixed(1)}%</span>
                      <span>{prediction.meta.homeTeam.abbreviation} {(prediction.prediction.winProbabilityHome * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={prediction.prediction.winProbabilityHome * 100} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Away</span>
                      <span>Home</span>
                    </div>
                  </div>

                  {/* Model Confidence and Calculation Details */}
                  <div className="flex justify-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="gap-1">
                            <Info className="h-3 w-3" />
                            Model Confidence: {(prediction.prediction.confidence * 100).toFixed(0)}%
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Based on spread magnitude and data completeness</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {prediction.inputs && prediction.calculationDetails && currentSettings && (
                      <CalculationModal
                        homeTeam={prediction.meta.homeTeam}
                        awayTeam={prediction.meta.awayTeam}
                        homeStats={prediction.inputs.home}
                        awayStats={prediction.inputs.away}
                        leagueAvgs={prediction.inputs.league}
                        settings={currentSettings}
                        prediction={prediction.prediction}
                        adjustedHomeYards={prediction.calculationDetails.adjustedHomeYards}
                        adjustedAwayYards={prediction.calculationDetails.adjustedAwayYards}
                      />
                    )}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Actual Game Result (if game was already played) */}
          {prediction && (
            <ActualGameResult
              homeTeam={prediction.meta.homeTeam}
              awayTeam={prediction.meta.awayTeam}
              prediction={{
                homeScore: prediction.prediction.homeScore,
                awayScore: prediction.prediction.awayScore,
                predictedWinner: prediction.prediction.predictedWinner
              }}
            />
          )}

          {/* Team Stats Comparison */}
          {prediction && (
            <TeamComparison
              awayTeam={prediction.meta.awayTeam}
              homeTeam={prediction.meta.homeTeam}
              year={prediction.meta.year}
            />
          )}

          {/* Why These Predictions */}
          {(isLoading || prediction) && (
            <Card className="rounded-2xl border-border shadow-md dark:shadow-none">
              <CardHeader className="p-6 md:p-8">
                <CardTitle>Why These Predictions?</CardTitle>
                <CardDescription>
                  Key factors influencing the prediction model
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8 pt-0">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : prediction ? (
                  <div className="space-y-4">
                    {prediction.contributions.map((contribution, index) => {
                      const IconComponent = contributionIcons[contribution.key]
                      const isHome = contribution.direction === "home"
                      
                      return (
                        <div key={contribution.key}>
                          <div className="flex items-center gap-4">
                            <IconComponent className={`h-5 w-5 ${isHome ? 'text-green-600' : 'text-blue-600'}`} />
                            <div className="flex-1">
                              <div className="font-medium">{contributionLabels[contribution.key]}</div>
                              <div className="text-sm text-muted-foreground">
                                {contributionDescriptions[contribution.key]}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={isHome ? "default" : "secondary"}
                                className="font-mono"
                              >
                                {isHome ? "HOME" : "AWAY"}
                              </Badge>
                              <Badge variant="outline" className="font-mono">
                                {contribution.value.toFixed(2)}
                              </Badge>
                            </div>
                          </div>
                          {index < prediction.contributions.length - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </Container>
  )
}

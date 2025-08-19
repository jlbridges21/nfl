"use client"

import { useState, useEffect } from "react"
import { Calculator, TrendingUp, Gauge, Shield, Home, Repeat, Award, X, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TeamsRow } from "@/types/db"
import type { TeamStats } from "@/types/model"
import type { PredictionSettings } from "./settings-modal"

interface CalculationModalProps {
  homeTeam: TeamsRow
  awayTeam: TeamsRow
  homeStats: TeamStats
  awayStats: TeamStats
  leagueAvgs: {
    leagueAvgDefensiveYardsAllowed: number
    leagueAvgDefensivePointsAllowed: number
    leagueAvgYardsPerPoint: number
  }
  settings: PredictionSettings
  prediction: {
    homeScore: number
    awayScore: number
    total: number
    spread: number
    winProbabilityHome: number
    confidence: number
  }
  adjustedHomeYards: number
  adjustedAwayYards: number
}

const stepIcons = {
  yards: TrendingUp,
  defense: Shield,
  efficiency: Gauge,
  points: Award,
  fpi: Info,
  homeField: Home,
  final: Calculator,
}

export function CalculationModal({
  homeTeam,
  awayTeam,
  homeStats,
  awayStats,
  leagueAvgs,
  settings,
  prediction,
  adjustedHomeYards,
  adjustedAwayYards,
}: CalculationModalProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(true)
    if (typeof window !== 'undefined') {
      window.addEventListener('OPEN_CALCULATION_MODAL', handler)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('OPEN_CALCULATION_MODAL', handler)
      }
    }
  }, [])

  // Calculate intermediate values for display
  const calculateIntermediateValues = () => {
    // Step 1: Weight calculations
    const baseSeasonWeight = 0.50
    const adjustedLast3Weight = settings.recentForm
    const adjustedSeasonWeight = baseSeasonWeight + (0.30 - adjustedLast3Weight)
    const last1Weight = 0.10
    const homeAwayWeight = settings.homeFieldAdvantage

    const totalWeight = adjustedSeasonWeight + adjustedLast3Weight + last1Weight + homeAwayWeight
    const normalizedSeasonWeight = adjustedSeasonWeight / totalWeight
    const normalizedLast3Weight = adjustedLast3Weight / totalWeight
    const normalizedLast1Weight = last1Weight / totalWeight
    const normalizedHomeAwayWeight = homeAwayWeight / totalWeight

    // Step 2: Weighted yards
    const homeYardsWeighted = 
      homeStats.yardsPerGameSeason * normalizedSeasonWeight +
      homeStats.yardsPerGameLast3 * normalizedLast3Weight +
      homeStats.yardsPerGameLast1 * normalizedLast1Weight +
      homeStats.yardsPerGameHome * normalizedHomeAwayWeight

    const awayYardsWeighted = 
      awayStats.yardsPerGameSeason * normalizedSeasonWeight +
      awayStats.yardsPerGameLast3 * normalizedLast3Weight +
      awayStats.yardsPerGameLast1 * normalizedLast1Weight +
      awayStats.yardsPerGameAway * normalizedHomeAwayWeight

    // Step 3: Defensive factors
    const homeDefensiveYardFactor = Math.min(Math.max(
      awayStats.defensiveYardsAllowedSeason / leagueAvgs.leagueAvgDefensiveYardsAllowed,
      0.85
    ), 1.15)
    
    const awayDefensiveYardFactor = Math.min(Math.max(
      homeStats.defensiveYardsAllowedSeason / leagueAvgs.leagueAvgDefensiveYardsAllowed,
      0.85
    ), 1.15)

    // Step 4: Yards per point calculations
    const homeYppBlended = (
      homeStats.yardsPerPointSeason * 0.80 + 
      homeStats.yardsPerPointLast3 * 0.15 + 
      homeStats.yardsPerPointLast1 * 0.05
    ) * 0.80 + leagueAvgs.leagueAvgYardsPerPoint * 0.20

    const awayYppBlended = (
      awayStats.yardsPerPointSeason * 0.80 + 
      awayStats.yardsPerPointLast3 * 0.15 + 
      awayStats.yardsPerPointLast1 * 0.05
    ) * 0.80 + leagueAvgs.leagueAvgYardsPerPoint * 0.20

    const homeEffectiveYPP = Math.min(Math.max(homeYppBlended, 8), 50)
    const awayEffectiveYPP = Math.min(Math.max(awayYppBlended, 8), 50)

    return {
      weights: {
        season: normalizedSeasonWeight,
        last3: normalizedLast3Weight,
        last1: normalizedLast1Weight,
        homeAway: normalizedHomeAwayWeight,
      },
      weightedYards: {
        home: homeYardsWeighted,
        away: awayYardsWeighted,
      },
      defensiveFactors: {
        home: homeDefensiveYardFactor,
        away: awayDefensiveYardFactor,
      },
      yardsPerPoint: {
        home: homeEffectiveYPP,
        away: awayEffectiveYPP,
      },
    }
  }

  const intermediate = calculateIntermediateValues()

  const TeamLogo = ({ team }: { team: TeamsRow }) => (
    team.logoUrl ? (
      <img 
        src={team.logoUrl} 
        alt={`${team.name} logo`}
        className="h-8 w-8 object-contain"
      />
    ) : (
      <div 
        className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ backgroundColor: team.primaryColor || '#6b7280' }}
      >
        {team.abbreviation}
      </div>
    )
  )

  const StatRow = ({ 
    label, 
    homeValue, 
    awayValue, 
    format = (v: number) => v.toFixed(1),
    homeHighlight = false,
    awayHighlight = false 
  }: {
    label: string
    homeValue: number
    awayValue: number
    format?: (v: number) => string
    homeHighlight?: boolean
    awayHighlight?: boolean
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <TeamLogo team={homeTeam} />
        <span className={`font-mono text-sm ${homeHighlight ? 'font-bold text-green-600' : ''}`}>
          {format(homeValue)}
        </span>
      </div>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-mono text-sm ${awayHighlight ? 'font-bold text-blue-600' : ''}`}>
          {format(awayValue)}
        </span>
        <TeamLogo team={awayTeam} />
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Calculator className="h-4 w-4" />
          View Calculation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Prediction Calculation Breakdown
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="steps">Step by Step</TabsTrigger>
            <TabsTrigger value="stats">Raw Stats</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Final Prediction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TeamLogo team={awayTeam} />
                    <div>
                      <div className="font-semibold">{awayTeam.name}</div>
                      <div className="text-sm text-muted-foreground">Away</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {prediction.awayScore} – {prediction.homeScore}
                    </div>
                    <div className="text-sm text-muted-foreground">PREDICTED</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">{homeTeam.name}</div>
                      <div className="text-sm text-muted-foreground">Home</div>
                    </div>
                    <TeamLogo team={homeTeam} />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Spread</div>
                    <div className="font-semibold">
                      {prediction.spread > 0 
                        ? `${homeTeam.abbreviation} -${Math.abs(prediction.spread).toFixed(1)}`
                        : `${awayTeam.abbreviation} -${Math.abs(prediction.spread).toFixed(1)}`
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total (O/U)</div>
                    <div className="font-semibold">{prediction.total.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Home Win %</div>
                    <div className="font-semibold">{(prediction.winProbabilityHome * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Calculation Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <StatRow 
                  label="Adjusted Offensive Yards" 
                  homeValue={adjustedHomeYards} 
                  awayValue={adjustedAwayYards}
                  homeHighlight={adjustedHomeYards > adjustedAwayYards}
                  awayHighlight={adjustedAwayYards > adjustedHomeYards}
                />
                <StatRow 
                  label="Effective Yards Per Point" 
                  homeValue={intermediate.yardsPerPoint.home} 
                  awayValue={intermediate.yardsPerPoint.away}
                  homeHighlight={intermediate.yardsPerPoint.home < intermediate.yardsPerPoint.away}
                  awayHighlight={intermediate.yardsPerPoint.away < intermediate.yardsPerPoint.home}
                />
                <StatRow 
                  label="Defensive Yard Factor" 
                  homeValue={intermediate.defensiveFactors.home} 
                  awayValue={intermediate.defensiveFactors.away}
                  format={(v) => `${v.toFixed(3)}x`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="steps" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Step 1: Calculate Weighted Offensive Yards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Combines season, recent form, and home/away performance using weighted averages
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium text-sm mb-2 flex items-center gap-1">
                        <TeamLogo team={homeTeam} />
                        {homeTeam.abbreviation} (Home)
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div>Season: {homeStats.yardsPerGameSeason.toFixed(1)} × {intermediate.weights.season.toFixed(3)} = {(homeStats.yardsPerGameSeason * intermediate.weights.season).toFixed(1)}</div>
                        <div>Last 3: {homeStats.yardsPerGameLast3.toFixed(1)} × {intermediate.weights.last3.toFixed(3)} = {(homeStats.yardsPerGameLast3 * intermediate.weights.last3).toFixed(1)}</div>
                        <div>Last 1: {homeStats.yardsPerGameLast1.toFixed(1)} × {intermediate.weights.last1.toFixed(3)} = {(homeStats.yardsPerGameLast1 * intermediate.weights.last1).toFixed(1)}</div>
                        <div>Home: {homeStats.yardsPerGameHome.toFixed(1)} × {intermediate.weights.homeAway.toFixed(3)} = {(homeStats.yardsPerGameHome * intermediate.weights.homeAway).toFixed(1)}</div>
                        <Separator />
                        <div className="font-bold">Total: {intermediate.weightedYards.home.toFixed(1)} yards/game</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-sm mb-2 flex items-center gap-1">
                        <TeamLogo team={awayTeam} />
                        {awayTeam.abbreviation} (Away)
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div>Season: {awayStats.yardsPerGameSeason.toFixed(1)} × {intermediate.weights.season.toFixed(3)} = {(awayStats.yardsPerGameSeason * intermediate.weights.season).toFixed(1)}</div>
                        <div>Last 3: {awayStats.yardsPerGameLast3.toFixed(1)} × {intermediate.weights.last3.toFixed(3)} = {(awayStats.yardsPerGameLast3 * intermediate.weights.last3).toFixed(1)}</div>
                        <div>Last 1: {awayStats.yardsPerGameLast1.toFixed(1)} × {intermediate.weights.last1.toFixed(3)} = {(awayStats.yardsPerGameLast1 * intermediate.weights.last1).toFixed(1)}</div>
                        <div>Away: {awayStats.yardsPerGameAway.toFixed(1)} × {intermediate.weights.homeAway.toFixed(3)} = {(awayStats.yardsPerGameAway * intermediate.weights.homeAway).toFixed(1)}</div>
                        <Separator />
                        <div className="font-bold">Total: {intermediate.weightedYards.away.toFixed(1)} yards/game</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Step 2: Apply Defensive Adjustments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Adjusts offensive yards based on opponent's defensive strength relative to league average
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium text-sm mb-2 flex items-center gap-1">
                        <TeamLogo team={homeTeam} />
                        {homeTeam.abbreviation} vs {awayTeam.abbreviation} Defense
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div>Opponent allows: {awayStats.defensiveYardsAllowedSeason.toFixed(1)} yards/game</div>
                        <div>League average: {leagueAvgs.leagueAvgDefensiveYardsAllowed.toFixed(1)} yards/game</div>
                        <div>Factor: {awayStats.defensiveYardsAllowedSeason.toFixed(1)} ÷ {leagueAvgs.leagueAvgDefensiveYardsAllowed.toFixed(1)} = {intermediate.defensiveFactors.home.toFixed(3)}</div>
                        <div>Adjusted: {intermediate.weightedYards.home.toFixed(1)} × {intermediate.defensiveFactors.home.toFixed(3)} = <span className="font-bold">{adjustedHomeYards.toFixed(1)}</span></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-sm mb-2 flex items-center gap-1">
                        <TeamLogo team={awayTeam} />
                        {awayTeam.abbreviation} vs {homeTeam.abbreviation} Defense
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div>Opponent allows: {homeStats.defensiveYardsAllowedSeason.toFixed(1)} yards/game</div>
                        <div>League average: {leagueAvgs.leagueAvgDefensiveYardsAllowed.toFixed(1)} yards/game</div>
                        <div>Factor: {homeStats.defensiveYardsAllowedSeason.toFixed(1)} ÷ {leagueAvgs.leagueAvgDefensiveYardsAllowed.toFixed(1)} = {intermediate.defensiveFactors.away.toFixed(3)}</div>
                        <div>Adjusted: {intermediate.weightedYards.away.toFixed(1)} × {intermediate.defensiveFactors.away.toFixed(3)} = <span className="font-bold">{adjustedAwayYards.toFixed(1)}</span></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    Step 3: Calculate Effective Yards Per Point
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Determines how efficiently each team converts yards into points, blended with league average
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium text-sm mb-2 flex items-center gap-1">
                        <TeamLogo team={homeTeam} />
                        {homeTeam.abbreviation} Efficiency
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div>Season YPP: {homeStats.yardsPerPointSeason.toFixed(1)}</div>
                        <div>Last 3 YPP: {homeStats.yardsPerPointLast3.toFixed(1)}</div>
                        <div>Last 1 YPP: {homeStats.yardsPerPointLast1.toFixed(1)}</div>
                        <div>League Avg: {leagueAvgs.leagueAvgYardsPerPoint.toFixed(1)}</div>
                        <Separator />
                        <div className="font-bold">Effective YPP: {intermediate.yardsPerPoint.home.toFixed(1)}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-sm mb-2 flex items-center gap-1">
                        <TeamLogo team={awayTeam} />
                        {awayTeam.abbreviation} Efficiency
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div>Season YPP: {awayStats.yardsPerPointSeason.toFixed(1)}</div>
                        <div>Last 3 YPP: {awayStats.yardsPerPointLast3.toFixed(1)}</div>
                        <div>Last 1 YPP: {awayStats.yardsPerPointLast1.toFixed(1)}</div>
                        <div>League Avg: {leagueAvgs.leagueAvgYardsPerPoint.toFixed(1)}</div>
                        <Separator />
                        <div className="font-bold">Effective YPP: {intermediate.yardsPerPoint.away.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Step 4: Calculate Base Scores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Converts adjusted yards to predicted points using efficiency metrics
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium text-sm mb-2 flex items-center gap-1">
                        <TeamLogo team={homeTeam} />
                        {homeTeam.abbreviation} Base Score
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div>Adjusted Yards: {adjustedHomeYards.toFixed(1)}</div>
                        <div>Effective YPP: {intermediate.yardsPerPoint.home.toFixed(1)}</div>
                        <div>Base Score: {adjustedHomeYards.toFixed(1)} ÷ {intermediate.yardsPerPoint.home.toFixed(1)} = {(adjustedHomeYards / intermediate.yardsPerPoint.home).toFixed(1)}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-sm mb-2 flex items-center gap-1">
                        <TeamLogo team={awayTeam} />
                        {awayTeam.abbreviation} Base Score
                      </div>
                      <div className="space-y-1 text-xs font-mono">
                        <div>Adjusted Yards: {adjustedAwayYards.toFixed(1)}</div>
                        <div>Effective YPP: {intermediate.yardsPerPoint.away.toFixed(1)}</div>
                        <div>Base Score: {adjustedAwayYards.toFixed(1)} ÷ {intermediate.yardsPerPoint.away.toFixed(1)} = {(adjustedAwayYards / intermediate.yardsPerPoint.away).toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Step 5: Apply Additional Adjustments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-3">
                    Final adjustments for PPG calibration, defensive strength, FPI ratings, and home field advantage
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <Badge variant="outline">PPG Calibration (80% YPP + 20% actual PPG)</Badge>
                    <Badge variant="outline">Defensive Strength Factor (User Setting: {settings.defensiveStrength.toFixed(2)})</Badge>
                    <Badge variant="outline">FPI Edge Adjustments (User Setting: {settings.fpiEdge.toFixed(2)})</Badge>
                    <Badge variant="outline">Home Field Advantage (+{(settings.homeFieldAdvantage * 2.0).toFixed(1)} points)</Badge>
                    <Badge variant="outline">Random Variation (±2% for unpredictability)</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Raw Team Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm font-medium">Offensive Statistics</div>
                <div className="space-y-2">
                  <StatRow label="Yards/Game (Season)" homeValue={homeStats.yardsPerGameSeason} awayValue={awayStats.yardsPerGameSeason} />
                  <StatRow label="Yards/Game (Last 3)" homeValue={homeStats.yardsPerGameLast3} awayValue={awayStats.yardsPerGameLast3} />
                  <StatRow label="Yards/Game (Last 1)" homeValue={homeStats.yardsPerGameLast1} awayValue={awayStats.yardsPerGameLast1} />
                  <StatRow label="Yards/Game (Home)" homeValue={homeStats.yardsPerGameHome} awayValue={homeStats.yardsPerGameHome} />
                  <StatRow label="Yards/Game (Away)" homeValue={homeStats.yardsPerGameAway} awayValue={awayStats.yardsPerGameAway} />
                  <StatRow label="Points/Game (Season)" homeValue={homeStats.pointsPerGameSeason} awayValue={awayStats.pointsPerGameSeason} />
                  <StatRow label="Points/Game (Last 3)" homeValue={homeStats.pointsPerGameLast3} awayValue={awayStats.pointsPerGameLast3} />
                </div>

                <Separator />

                <div className="text-sm font-medium">Defensive Statistics</div>
                <div className="space-y-2">
                  <StatRow label="Yards Allowed/Game" homeValue={homeStats.defensiveYardsAllowedSeason} awayValue={awayStats.defensiveYardsAllowedSeason} />
                  <StatRow label="Points Allowed/Game" homeValue={homeStats.defensivePointsAllowedSeason} awayValue={awayStats.defensivePointsAllowedSeason} />
                </div>

                <Separator />

                <div className="text-sm font-medium">Efficiency Statistics</div>
                <div className="space-y-2">
                  <StatRow label="Yards/Point (Season)" homeValue={homeStats.yardsPerPointSeason} awayValue={awayStats.yardsPerPointSeason} />
                  <StatRow label="Yards/Point (Last 3)" homeValue={homeStats.yardsPerPointLast3} awayValue={awayStats.yardsPerPointLast3} />
                  <StatRow label="Yards/Point (Last 1)" homeValue={homeStats.yardsPerPointLast1} awayValue={awayStats.yardsPerPointLast1} />
                </div>

                <Separator />

                <div className="text-sm font-medium">FPI Ratings</div>
                <div className="space-y-2">
                  <StatRow label="FPI Overall" homeValue={homeStats.fpiOverall || 0} awayValue={awayStats.fpiOverall || 0} format={(v) => v.toFixed(2)} />
                  <StatRow label="FPI Offense" homeValue={homeStats.fpiOffense || 0} awayValue={awayStats.fpiOffense || 0} format={(v) => v.toFixed(2)} />
                  <StatRow label="FPI Defense" homeValue={homeStats.fpiDefense || 0} awayValue={awayStats.fpiDefense || 0} format={(v) => v.toFixed(2)} />
                </div>

                <Separator />

                <div className="text-sm font-medium">League Averages</div>
                <div className="space-y-2 text-xs">
                  <div>Defensive Yards Allowed: {leagueAvgs.leagueAvgDefensiveYardsAllowed.toFixed(1)} yards/game</div>
                  <div>Defensive Points Allowed: {leagueAvgs.leagueAvgDefensivePointsAllowed.toFixed(1)} points/game</div>
                  <div>Yards Per Point: {leagueAvgs.leagueAvgYardsPerPoint.toFixed(1)} yards/point</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Prediction Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Recent Form Weight</div>
                    <div className="text-2xl font-bold">{settings.recentForm.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">How much to weight last 3 games vs season average</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Home Field Advantage</div>
                    <div className="text-2xl font-bold">{settings.homeFieldAdvantage.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Weight for home/away splits and home field boost</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Defensive Strength</div>
                    <div className="text-2xl font-bold">{settings.defensiveStrength.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">How much defensive stats impact scoring</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">FPI Edge</div>
                    <div className="text-2xl font-bold">{settings.fpiEdge.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Weight for ESPN Football Power Index ratings</div>
                  </div>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground">
                  These settings control how different factors are weighted in the prediction algorithm. 
                  Higher values increase the impact of that factor on the final score prediction.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

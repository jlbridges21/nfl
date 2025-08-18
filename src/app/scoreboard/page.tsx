'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Scoreboard } from '@/components/nfl-stats/scoreboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, Trophy, TrendingUp } from 'lucide-react'

type SeasonType = 'preseason' | 'regular' | 'postseason'

export default function ScoreboardPage() {
  const [selectedSeason, setSelectedSeason] = useState<number>(2024)
  const [selectedSeasonType, setSelectedSeasonType] = useState<SeasonType>('regular')

  const availableSeasons = [2024, 2023, 2022, 2021, 2020]

  const getSeasonTypeNumber = (type: SeasonType): number => {
    switch (type) {
      case 'preseason': return 1
      case 'regular': return 2
      case 'postseason': return 3
      default: return 2
    }
  }

  const getSeasonTypeLabel = (type: SeasonType): string => {
    switch (type) {
      case 'preseason': return 'Preseason'
      case 'regular': return 'Regular Season'
      case 'postseason': return 'Postseason'
      default: return 'Regular Season'
    }
  }

  const getGamesCount = (type: SeasonType): number => {
    switch (type) {
      case 'preseason': return 65 // Approximate preseason games
      case 'regular': return 272
      case 'postseason': return 13 // Wild card + divisional + conference + super bowl
      default: return 272
    }
  }

  const getWeeksCount = (type: SeasonType): number => {
    switch (type) {
      case 'preseason': return 3
      case 'regular': return 18
      case 'postseason': return 4
      default: return 18
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {selectedSeason} NFL Scoreboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete schedule and results with detailed box scores and game information
            </p>
          </div>
          
          {/* Season and Type Selectors */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">Season:</span>
              <Select value={selectedSeason.toString()} onValueChange={(value) => setSelectedSeason(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableSeasons.map(season => (
                    <SelectItem key={season} value={season.toString()}>
                      {season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">Type:</span>
              <Select value={selectedSeasonType} onValueChange={(value) => setSelectedSeasonType(value as SeasonType)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preseason">Preseason</SelectItem>
                  <SelectItem value="regular">Regular Season</SelectItem>
                  <SelectItem value="postseason">Postseason</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">
                16 AFC • 16 NFC
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{getSeasonTypeLabel(selectedSeasonType)}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getWeeksCount(selectedSeasonType)}</div>
              <p className="text-xs text-muted-foreground">
                Weeks of games
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getGamesCount(selectedSeasonType)}</div>
              <p className="text-xs text-muted-foreground">
                {getSeasonTypeLabel(selectedSeasonType).toLowerCase()} games
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Source</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Live</div>
              <p className="text-xs text-muted-foreground">
                ESPN API
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Scoreboard Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{getSeasonTypeLabel(selectedSeasonType)} Scoreboard</span>
            </CardTitle>
            <CardDescription>
              Complete schedule and results for all {selectedSeason} NFL {getSeasonTypeLabel(selectedSeasonType).toLowerCase()} games, 
              organized by week with game status, scores, box scores, and scheduling information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Scoreboard 
              season={selectedSeason} 
              seasonType={getSeasonTypeNumber(selectedSeasonType)}
            />
          </CardContent>
        </Card>

        {/* Footer Info */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-semibold mb-2">About This Data</h3>
                <p className="text-sm text-muted-foreground">
                  All NFL data is sourced from ESPN&apos;s comprehensive API, providing real-time
                  statistics, game results, box scores, and scheduling information. Data is updated 
                  regularly throughout the season.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Real-time Data</Badge>
                <Badge variant="secondary">Official Stats</Badge>
                <Badge variant="secondary">Box Scores</Badge>
                <Badge variant="secondary">Complete Coverage</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}

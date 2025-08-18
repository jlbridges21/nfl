'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Scoreboard } from '@/components/nfl-stats/scoreboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Trophy, TrendingUp, ChevronDown } from 'lucide-react'

type SeasonType = 'preseason' | 'regular' | 'postseason'

export default function ScoreboardPage() {
  const [selectedSeason, setSelectedSeason] = useState<number>(2024)
  const [selectedSeasonType, setSelectedSeasonType] = useState<SeasonType>('regular')
  const [showStats, setShowStats] = useState(false)

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
      <div className="space-y-4">
        {/* Mobile-Optimized Header */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
            {selectedSeason} NFL Scoreboard
          </h1>
          
          {/* Compact Season and Type Selectors */}
          <div className="flex justify-center items-center space-x-3">
            <Select value={selectedSeason.toString()} onValueChange={(value) => setSelectedSeason(parseInt(value))}>
              <SelectTrigger className="w-20 h-8 text-sm">
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
            
            <Select value={selectedSeasonType} onValueChange={(value) => setSelectedSeasonType(value as SeasonType)}>
              <SelectTrigger className="w-28 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preseason">Preseason</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="postseason">Postseason</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Collapsible Stats Overview - Mobile Optimized */}
        <Card className="md:hidden">
          <CardHeader className="pb-2">
            <Button
              variant="ghost"
              onClick={() => setShowStats(!showStats)}
              className="w-full justify-between p-0 h-auto"
            >
              <CardTitle className="text-sm font-medium">Season Stats</CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${showStats ? 'rotate-180' : ''}`} />
            </Button>
          </CardHeader>
          {showStats && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="space-y-1">
                  <div className="text-lg font-bold">32</div>
                  <div className="text-xs text-muted-foreground">Teams</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold">{getWeeksCount(selectedSeasonType)}</div>
                  <div className="text-xs text-muted-foreground">Weeks</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold">{getGamesCount(selectedSeasonType)}</div>
                  <div className="text-xs text-muted-foreground">Games</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold">Live</div>
                  <div className="text-xs text-muted-foreground">Data</div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Desktop Stats Overview Cards - Hidden on Mobile */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
              <Calendar className="h-4 w-4 md:h-5 md:w-5" />
              <span>{getSeasonTypeLabel(selectedSeasonType)} Scoreboard</span>
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Complete schedule and results for all {selectedSeason} NFL {getSeasonTypeLabel(selectedSeasonType).toLowerCase()} games
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <Scoreboard 
              season={selectedSeason} 
              seasonType={getSeasonTypeNumber(selectedSeasonType)}
            />
          </CardContent>
        </Card>

        {/* Footer Info - Simplified for Mobile */}
        <Card className="bg-muted/30 md:block">
          <CardContent className="pt-4 md:pt-6">
            <div className="text-center md:flex md:justify-between md:items-center md:text-left">
              <div className="mb-3 md:mb-0">
                <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">About This Data</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  All NFL data is sourced from ESPN&apos;s comprehensive API with real-time updates.
                </p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-1 md:gap-2">
                <Badge variant="secondary" className="text-xs">Real-time</Badge>
                <Badge variant="secondary" className="text-xs">Official</Badge>
                <Badge variant="secondary" className="text-xs">Box Scores</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}

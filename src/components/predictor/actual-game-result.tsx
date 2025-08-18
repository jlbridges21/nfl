'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, XCircle, Calendar, Trophy } from 'lucide-react'
import { sportsDataAPI, NFLGame } from '@/lib/sportsdata-api'
import type { TeamsRow } from '@/types/db'
import Image from 'next/image'

interface ActualGameResultProps {
  homeTeam: TeamsRow
  awayTeam: TeamsRow
  prediction: {
    homeScore: number
    awayScore: number
    predictedWinner: "Home" | "Away"
  }
}

interface ActualGameResultData {
  game: NFLGame
  accuracy: {
    winnerCorrect: boolean
    homeScoreDiff: number
    awayScoreDiff: number
    totalScoreDiff: number
  }
}

export function ActualGameResult({ homeTeam, awayTeam, prediction }: ActualGameResultProps) {
  const [actualResult, setActualResult] = useState<ActualGameResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const findActualGame = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get all games for the 2024 season
        const allWeeksData = await sportsDataAPI.getAllScoresForSeason(2024)
        
        // Find the game between these two teams
        let foundGame: NFLGame | null = null
        
        for (const weekData of allWeeksData) {
          const game = weekData.games.find(g => 
            (g.HomeTeam === homeTeam.abbreviation && g.AwayTeam === awayTeam.abbreviation) ||
            (g.HomeTeam === awayTeam.abbreviation && g.AwayTeam === homeTeam.abbreviation)
          )
          
          if (game && game.IsOver && game.HomeScore !== null && game.AwayScore !== null) {
            foundGame = game
            break
          }
        }

        if (foundGame) {
          // Calculate accuracy metrics
          const actualHomeScore = foundGame.HomeTeam === homeTeam.abbreviation 
            ? foundGame.HomeScore! 
            : foundGame.AwayScore!
          const actualAwayScore = foundGame.AwayTeam === awayTeam.abbreviation 
            ? foundGame.AwayScore! 
            : foundGame.HomeScore!

          const actualWinner = actualHomeScore > actualAwayScore ? "Home" : "Away"
          const winnerCorrect = prediction.predictedWinner === actualWinner

          const accuracy = {
            winnerCorrect,
            homeScoreDiff: Math.round(Math.abs(prediction.homeScore - actualHomeScore)),
            awayScoreDiff: Math.round(Math.abs(prediction.awayScore - actualAwayScore)),
            totalScoreDiff: Math.round(Math.abs((prediction.homeScore + prediction.awayScore) - (actualHomeScore + actualAwayScore)))
          }

          setActualResult({
            game: foundGame,
            accuracy
          })
        } else {
          // Game not found or not completed
          setActualResult(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch actual game result')
      } finally {
        setLoading(false)
      }
    }

    findActualGame()
  }, [homeTeam.abbreviation, awayTeam.abbreviation, prediction])

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown Date'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return 'Unknown Date'
    }
  }

  const getAccuracyColor = (diff: number, type: 'score' | 'total') => {
    const threshold = type === 'score' ? 7 : 14
    if (diff <= threshold / 2) return 'text-green-600'
    if (diff <= threshold) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <Card className="rounded-2xl border-border shadow-md dark:shadow-none">
        <CardHeader className="p-6 md:p-8 pb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0">
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !actualResult) {
    return null // Don't show anything if there's an error or no game found
  }

  const { game, accuracy } = actualResult

  // Determine which team scores to show based on the game data
  const actualHomeScore = game.HomeTeam === homeTeam.abbreviation 
    ? game.HomeScore! 
    : game.AwayScore!
  const actualAwayScore = game.AwayTeam === awayTeam.abbreviation 
    ? game.AwayScore! 
    : game.HomeScore!

  return (
    <Card className="rounded-2xl border-border shadow-md dark:shadow-none">
      <CardHeader className="p-6 md:p-8 pb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[var(--nfl-accent)]" />
          <CardTitle>Actual Game Result</CardTitle>
        </div>
        <CardDescription>
          This game was already played on {formatDate(game.Date)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-8 pt-0">
        <div className="space-y-6">
          {/* Actual Game Result */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {awayTeam.logoUrl ? (
                <Image 
                  src={awayTeam.logoUrl} 
                  alt={`${awayTeam.name} logo`}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <div 
                  className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: awayTeam.primaryColor || '#6b7280' }}
                >
                  {awayTeam.abbreviation}
                </div>
              )}
              <div>
                <div className="font-semibold">{awayTeam.name}</div>
                <div className="text-sm text-muted-foreground">Away</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {actualAwayScore} – {actualHomeScore}
              </div>
              <div className="text-sm text-muted-foreground">ACTUAL RESULT</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-semibold">{homeTeam.name}</div>
                <div className="text-sm text-muted-foreground">Home</div>
              </div>
              {homeTeam.logoUrl ? (
                <Image 
                  src={homeTeam.logoUrl} 
                  alt={`${homeTeam.name} logo`}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <div 
                  className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: homeTeam.primaryColor || '#6b7280' }}
                >
                  {homeTeam.abbreviation}
                </div>
              )}
            </div>
          </div>

          {/* Prediction Accuracy */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <h4 className="font-semibold">Prediction Accuracy</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Winner Prediction */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Winner Prediction</div>
                    <div className="font-medium">
                      {accuracy.winnerCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  </div>
                  {accuracy.winnerCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
              </Card>

              {/* Score Accuracy */}
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-2">Score Accuracy</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{homeTeam.abbreviation} Score:</span>
                    <span className={getAccuracyColor(accuracy.homeScoreDiff, 'score')}>
                      ±{accuracy.homeScoreDiff}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{awayTeam.abbreviation} Score:</span>
                    <span className={getAccuracyColor(accuracy.awayScoreDiff, 'score')}>
                      ±{accuracy.awayScoreDiff}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-1 border-t">
                    <span>Total Points:</span>
                    <span className={getAccuracyColor(accuracy.totalScoreDiff, 'total')}>
                      ±{accuracy.totalScoreDiff}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Game Details */}
            <div className="flex justify-center">
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                Week {game.Week} • {formatDate(game.Date)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

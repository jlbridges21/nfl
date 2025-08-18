'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, XCircle, Calendar, Trophy } from 'lucide-react'
import type { TeamsRow } from '@/types/db'
import Image from 'next/image'

interface NFLGame {
  GameKey?: string
  Date?: string
  Week?: number
  Season?: number
  AwayTeam?: string
  HomeTeam?: string
  AwayScore?: number | null
  HomeScore?: number | null
  Quarter?: string | null
  Channel?: string | null
  IsOver?: boolean
  IsInProgress?: boolean
  HasStarted?: boolean
  // Additional ESPN data
  WeekName?: string
  AwayDisplayName?: string
  HomeDisplayName?: string
  GameStatus?: string
  DisplayClock?: string
  Situation?: string
  TotalPoints?: number | null
  OverUnder?: number | null
  Spread?: number | null
  FavoredTeam?: string | null
  // Box score data
  BoxHome?: string | null
  BoxAway?: string | null
}

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
  actualHomeScore: number
  actualAwayScore: number
}

async function fetchActualFromSupabase(homeAbbr: string, awayAbbr: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!baseUrl || !anonKey) return null

  // Query PostgREST directly. Assumes columns: season, season_type, week, date, home_team_abbr, away_team_abbr, home_score, away_score, is_over
  const url = new URL(`${baseUrl}/rest/v1/espn_games`)
  url.searchParams.set('select', 'season,season_type,week,date,home_team_abbr,away_team_abbr,home_score,away_score,is_over')
  url.searchParams.set('season', 'eq.2024')
  url.searchParams.set('season_type', 'eq.2') // 2 = regular season
  // match either orientation of the same matchup
  url.searchParams.set('or', `and(home_team_abbr.eq.${homeAbbr},away_team_abbr.eq.${awayAbbr}),and(home_team_abbr.eq.${awayAbbr},away_team_abbr.eq.${homeAbbr})`)
  url.searchParams.set('is_over', 'eq.true')
  url.searchParams.set('order', 'date.desc')
  url.searchParams.set('limit', '1')

  const res = await fetch(url.toString(), {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const rows = await res.json()
  if (!rows || !rows.length) return null
  const r = rows[0]
  if (r.home_score == null || r.away_score == null) return null

  return {
    Date: r.date,
    Week: r.week,
    HomeTeam: r.home_team_abbr,
    AwayTeam: r.away_team_abbr,
    HomeScore: r.home_score as number,
    AwayScore: r.away_score as number,
    IsOver: true,
  } as NFLGame
}

async function fetchActualFromApi(homeAbbr: string, awayAbbr: string) {
  const gamesResponse = await fetch('/api/games?season=2024&seasonType=2', { cache: 'no-store' })
  if (!gamesResponse.ok) throw new Error('Failed to fetch games data')
  const allWeeksData = await gamesResponse.json()

  // collect all matching completed games, then pick the latest by Date
  const candidates: NFLGame[] = []
  for (const weekData of allWeeksData) {
    for (const g of weekData.games as NFLGame[]) {
      const matchup = (
        (g.HomeTeam === homeAbbr && g.AwayTeam === awayAbbr) ||
        (g.HomeTeam === awayAbbr && g.AwayTeam === homeAbbr)
      )
      if (matchup && g.IsOver && g.HomeScore != null && g.AwayScore != null) {
        candidates.push(g)
      }
    }
  }
  if (!candidates.length) return null
  candidates.sort((a, b) => new Date(b.Date ?? 0).getTime() - new Date(a.Date ?? 0).getTime())
  return candidates[0]
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

        const homeAbbr = homeTeam.abbreviation
        const awayAbbr = awayTeam.abbreviation

        // 1) Try Supabase espn_games first
        let foundGame: NFLGame | null = await fetchActualFromSupabase(homeAbbr, awayAbbr)

        // 2) Fallback to existing API source
        if (!foundGame) {
          foundGame = await fetchActualFromApi(homeAbbr, awayAbbr)
        }

        if (!foundGame) {
          setActualResult(null)
          return
        }

        // Map scores to the UI’s home/away props to avoid swaps
        let actualHomeScore: number
        let actualAwayScore: number
        if (foundGame.HomeTeam === homeAbbr) {
          actualHomeScore = foundGame.HomeScore as number
          actualAwayScore = foundGame.AwayScore as number
        } else if (foundGame.AwayTeam === homeAbbr) {
          // UI home team was away in the real game
          actualHomeScore = foundGame.AwayScore as number
          actualAwayScore = foundGame.HomeScore as number
        } else {
          // Safety: if neither matches (shouldn’t happen), abort
          setActualResult(null)
          return
        }

        // Final guards: ensure valid numbers
        if (
          actualHomeScore == null ||
          actualAwayScore == null ||
          Number.isNaN(actualHomeScore) ||
          Number.isNaN(actualAwayScore)
        ) {
          setActualResult(null)
          return
        }

        const actualWinner = actualHomeScore > actualAwayScore ? 'Home' : 'Away'
        const winnerCorrect = prediction.predictedWinner === actualWinner

        const accuracy = {
          winnerCorrect,
          homeScoreDiff: Math.round(Math.abs(prediction.homeScore - actualHomeScore)),
          awayScoreDiff: Math.round(Math.abs(prediction.awayScore - actualAwayScore)),
          totalScoreDiff: Math.round(
            Math.abs(
              prediction.homeScore + prediction.awayScore - (actualHomeScore + actualAwayScore)
            )
          ),
        }

        setActualResult({
          game: foundGame,
          accuracy,
          actualHomeScore,
          actualAwayScore,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch actual game result')
        setActualResult(null)
      } finally {
        setLoading(false)
      }
    }

    findActualGame()
  }, [homeTeam.abbreviation, awayTeam.abbreviation, prediction])

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown Date'
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return 'Unknown Date'
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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

  const { game, accuracy, actualHomeScore, actualAwayScore } = actualResult

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

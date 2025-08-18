'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/layout/container'
import { TeamStatsTable } from '@/components/team-stats/team-stats-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

type TeamWithStats = {
  id: string
  team_id: string
  Year: number | null
  Yards_per_Game: number | null
  Points_Per_Game: number | null
  Touchdowns_per_Game: number | null
  Passing_Yards_Per_Game: number | null
  Rushing_Yards_Per_Game_: number | null
  Red_Zone_Scores_Per_Game_TD_only: number | null
  Opponent_Yards_per_Game: number | null
  Opponent_Points_per_Game: number | null
  Opponent_Passing_Yards_per_Game: number | null
  Opponent_Rushing_Yards_per_Game: number | null
  Opponent_Red_Zone_Scores_per_Game_TDs_only: number | null
  Average_Scoring_Margin: number | null
  Yards_Per_Point: number | null
  fpi: number | null
  fpi_off: number | null
  fpi_def: number | null
  teams: {
    id: string
    name: string
    abbreviation: string
    conference: 'AFC' | 'NFC'
    division: 'East' | 'North' | 'South' | 'West'
    logo_url: string | null
    primary_color: string | null
    secondary_color: string | null
  }
}

type ApiResponse = {
  data: TeamWithStats[]
  availableYears: number[]
  selectedYear: number
}

export default function TeamStatsPage() {
  const [data, setData] = useState<TeamWithStats[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeamStats = async (year?: number) => {
    try {
      setLoading(true)
      const url = year ? `/api/team-stats?year=${year}` : '/api/team-stats'
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch team stats')
      }
      const result: ApiResponse = await response.json()
      setData(result.data)
      setAvailableYears(result.availableYears)
      setSelectedYear(result.selectedYear)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamStats()
  }, [])

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year)
    setSelectedYear(yearNum)
    fetchTeamStats(yearNum)
  }

  if (loading) {
    return (
      <Container>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <Skeleton key={j} className="h-4 w-12" />
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Statistics</h1>
          <p className="text-muted-foreground">
            Comprehensive NFL team statistics for all 32 teams. Click on any column header to sort.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Season Statistics</CardTitle>
                <CardDescription>
                  Performance metrics including offensive and defensive statistics, 
                  efficiency ratings, and FPI power rankings.
                </CardDescription>
              </div>
              {availableYears.length > 0 && selectedYear && (
                <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <TeamStatsTable data={data} />
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronDown, ChevronUp, Calendar, Clock, Trophy, BarChart3 } from 'lucide-react'
import Image from 'next/image'

interface DatabaseTeam {
  id: string
  name: string
  abbreviation: string
  conference: string
  division: string
  logoUrl: string
  primaryColor: string
  secondaryColor: string
}

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

interface WeekData {
  week: number
  games: NFLGame[]
}

interface ScoreboardProps {
  season?: number
  seasonType?: number
}

export function Scoreboard({ season = 2024, seasonType = 2 }: ScoreboardProps) {
  const [weekData, setWeekData] = useState<WeekData[]>([])
  const [teams, setTeams] = useState<DatabaseTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1, 2, 3]))
  const [selectedWeek, setSelectedWeek] = useState<string>('all')
  const [expandedBoxScores, setExpandedBoxScores] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch games data from Supabase
        const gamesResponse = await fetch(`/api/games?season=${season}&seasonType=${seasonType}`)
        if (!gamesResponse.ok) {
          throw new Error('Failed to fetch games data')
        }
        const gamesData = await gamesResponse.json()
        setWeekData(gamesData)
        
        // Try to fetch teams data, but don't fail if it doesn't work
        try {
          const teamsResponse = await fetch('/api/teams')
          if (teamsResponse.ok) {
            const teamsData = await teamsResponse.json()
            setTeams(teamsData.teams || teamsData || [])
          } else {
            console.warn('Failed to fetch teams data')
            setTeams([])
          }
        } catch (teamsError) {
          console.warn('Teams API failed:', teamsError)
          setTeams([])
        }
      } catch (err) {
        console.error('Error fetching scoreboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [season, seasonType])

  const getTeamLogo = (teamAbbreviation: string | undefined) => {
    if (!teamAbbreviation) return null
    const team = teams.find(t => t.abbreviation === teamAbbreviation)
    return team?.logoUrl || null
  }

  const toggleWeek = (week: number) => {
    const newExpanded = new Set(expandedWeeks)
    if (newExpanded.has(week)) {
      newExpanded.delete(week)
    } else {
      newExpanded.add(week)
    }
    setExpandedWeeks(newExpanded)
  }

  const expandAll = () => {
    setExpandedWeeks(new Set(weekData.map(w => w.week)))
  }

  const collapseAll = () => {
    setExpandedWeeks(new Set())
  }

  const toggleBoxScore = (gameKey: string) => {
    const newExpanded = new Set(expandedBoxScores)
    if (newExpanded.has(gameKey)) {
      newExpanded.delete(gameKey)
    } else {
      newExpanded.add(gameKey)
    }
    setExpandedBoxScores(newExpanded)
  }

  const parseBoxScore = (boxScoreString: string | null | undefined) => {
    if (!boxScoreString || boxScoreString.trim() === '') return null
    
    // Parse comma-separated values like "3,28,0,14"
    const quarters = boxScoreString.split(',').map(q => parseInt(q.trim(), 10))
    
    // Ensure we have valid numbers
    if (quarters.some(isNaN) || quarters.length === 0) return null
    
    return quarters
  }

  const renderBoxScore = (game: NFLGame) => {
    const homeBox = parseBoxScore(game.BoxHome)
    const awayBox = parseBoxScore(game.BoxAway)
    
    if (!homeBox && !awayBox) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Box score not available</p>
        </div>
      )
    }

    const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'OT2', 'OT3']

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-semibold">Team</th>
                {quarterLabels.slice(0, Math.max(homeBox?.length || 0, awayBox?.length || 0)).map((label, index) => (
                  <th key={index} className="text-center p-2 font-semibold min-w-[40px]">{label}</th>
                ))}
                <th className="text-center p-2 font-semibold bg-muted/30">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Away Team Row */}
              {awayBox && (
                <tr className="border-b hover:bg-muted/20">
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 flex-shrink-0 relative">
                        {getTeamLogo(game.AwayTeam) ? (
                          <Image
                            src={getTeamLogo(game.AwayTeam)!}
                            alt={`${game.AwayTeam} logo`}
                            fill
                            className="object-contain"
                            sizes="24px"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">{game.AwayTeam}</span>
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{game.AwayTeam}</span>
                    </div>
                  </td>
                  {awayBox.map((score, index) => (
                    <td key={index} className="text-center p-2 font-mono">{score}</td>
                  ))}
                  {/* Fill empty quarters if needed */}
                  {Array.from({ length: Math.max(homeBox?.length || 0, awayBox?.length || 0) - awayBox.length }).map((_, index) => (
                    <td key={`empty-away-${index}`} className="text-center p-2 font-mono">-</td>
                  ))}
                  <td className="text-center p-2 font-bold bg-muted/30">{game.AwayScore}</td>
                </tr>
              )}

              {/* Home Team Row */}
              {homeBox && (
                <tr className="hover:bg-muted/20">
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 flex-shrink-0 relative">
                        {getTeamLogo(game.HomeTeam) ? (
                          <Image
                            src={getTeamLogo(game.HomeTeam)!}
                            alt={`${game.HomeTeam} logo`}
                            fill
                            className="object-contain"
                            sizes="24px"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">{game.HomeTeam}</span>
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{game.HomeTeam}</span>
                    </div>
                  </td>
                  {homeBox.map((score, index) => (
                    <td key={index} className="text-center p-2 font-mono">{score}</td>
                  ))}
                  {/* Fill empty quarters if needed */}
                  {Array.from({ length: Math.max(homeBox?.length || 0, awayBox?.length || 0) - homeBox.length }).map((_, index) => (
                    <td key={`empty-home-${index}`} className="text-center p-2 font-mono">-</td>
                  ))}
                  <td className="text-center p-2 font-bold bg-muted/30">{game.HomeScore}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'TBD'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return 'TBD'
    }
  }

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZoneName: 'short'
      })
    } catch {
      return ''
    }
  }

  const getGameStatus = (game: NFLGame) => {
    if (game.IsOver) return 'Final'
    if (game.IsInProgress) return 'Live'
    if (game.HasStarted) return 'In Progress'
    return 'Scheduled'
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Final': return 'secondary'
      case 'Live': case 'In Progress': return 'destructive'
      default: return 'outline'
    }
  }

  const filteredWeekData = selectedWeek === 'all' 
    ? weekData 
    : weekData.filter(w => w.week === parseInt(selectedWeek))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Scoreboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">2024 NFL Season Scoreboard</h2>
          <p className="text-muted-foreground">Complete schedule and results with accurate ESPN data</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Weeks</SelectItem>
              {weekData.map(w => (
                <SelectItem key={w.week} value={w.week.toString()}>
                  Week {w.week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Week Cards */}
      <div className="space-y-4">
        {filteredWeekData.map((week) => (
          <Card key={week.week}>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleWeek(week.week)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Trophy className="h-5 w-5 text-[var(--nfl-accent)]" />
                  <CardTitle className="text-lg">
                    {week.games[0]?.WeekName || `Week ${week.week}`}
                  </CardTitle>
                  <Badge variant="secondary">
                    {week.games.length} games
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {week.games.filter(g => g.IsOver).length} completed
                  </Badge>
                  {expandedWeeks.has(week.week) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            {expandedWeeks.has(week.week) && (
              <CardContent>
                <div className="space-y-3">
                  {week.games.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No games scheduled for this week</p>
                    </div>
                  ) : (
                    week.games.map((game, index) => (
                      <div key={game.GameKey || index} className="space-y-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center space-x-4 flex-1">
                            {/* Away Team */}
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <div className="w-8 h-8 flex-shrink-0 relative">
                                {getTeamLogo(game.AwayTeam) ? (
                                  <Image
                                    src={getTeamLogo(game.AwayTeam)!}
                                    alt={`${game.AwayTeam} logo`}
                                    fill
                                    className="object-contain"
                                    sizes="32px"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold">{game.AwayTeam}</span>
                                  </div>
                                )}
                              </div>
                              <span className="font-medium truncate">{game.AwayTeam}</span>
                              <span className="font-bold text-lg min-w-[2rem] text-center">
                                {game.AwayScore ?? '-'}
                              </span>
                            </div>

                            {/* VS */}
                            <div className="text-muted-foreground font-medium px-2">@</div>

                            {/* Home Team */}
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <span className="font-bold text-lg min-w-[2rem] text-center">
                                {game.HomeScore ?? '-'}
                              </span>
                              <span className="font-medium truncate">{game.HomeTeam}</span>
                              <div className="w-8 h-8 flex-shrink-0 relative">
                                {getTeamLogo(game.HomeTeam) ? (
                                  <Image
                                    src={getTeamLogo(game.HomeTeam)!}
                                    alt={`${game.HomeTeam} logo`}
                                    fill
                                    className="object-contain"
                                    sizes="32px"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold">{game.HomeTeam}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Game Info and Box Score Button */}
                          <div className="text-right ml-4 flex-shrink-0">
                            <div className="flex items-center justify-end space-x-2 mb-1">
                              <Badge variant={getStatusBadgeVariant(getGameStatus(game))} className="text-xs">
                                {getGameStatus(game)}
                              </Badge>
                              {game.IsOver && (game.BoxHome || game.BoxAway) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleBoxScore(game.GameKey || `${game.AwayTeam}-${game.HomeTeam}-${game.Week}`)
                                  }}
                                  className="h-6 px-2 text-xs"
                                >
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  Box Score
                                </Button>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <div className="flex items-center justify-end space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(game.Date)}</span>
                              </div>
                              {game.Date && (
                                <div className="flex items-center justify-end space-x-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(game.Date)}</span>
                                </div>
                              )}
                              {game.Channel && (
                                <div className="text-xs mt-1">
                                  {game.Channel}
                                </div>
                              )}
                              {game.Spread && (
                                <div className="text-xs mt-1">
                                  Spread: {game.Spread > 0 ? '+' : ''}{game.Spread}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Box Score Display */}
                        {expandedBoxScores.has(game.GameKey || `${game.AwayTeam}-${game.HomeTeam}-${game.Week}`) && (
                          <div className="ml-4 mr-4 mb-2">
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center space-x-2">
                                  <BarChart3 className="h-4 w-4" />
                                  <span>Box Score</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {renderBoxScore(game)}
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredWeekData.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No games found for the selected criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

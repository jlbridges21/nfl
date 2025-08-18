'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronDown, ChevronUp, Calendar, Clock, Trophy, BarChart3, Minus } from 'lucide-react'
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

  const renderMobileBoxScore = (game: NFLGame) => {
    const homeBox = parseBoxScore(game.BoxHome)
    const awayBox = parseBoxScore(game.BoxAway)
    
    if (!homeBox && !awayBox) {
      return (
        <div className="text-center py-3 text-muted-foreground">
          <BarChart3 className="h-6 w-6 mx-auto mb-1 opacity-50" />
          <p className="text-xs">Box score not available</p>
        </div>
      )
    }

    const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4', 'OT']
    const maxQuarters = Math.max(homeBox?.length || 0, awayBox?.length || 0)

    return (
      <div className="space-y-2">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left p-1 font-medium w-12">Team</th>
                {quarterLabels.slice(0, maxQuarters).map((label, index) => (
                  <th key={index} className="text-center p-1 font-medium min-w-[28px]">{label}</th>
                ))}
                <th className="text-center p-1 font-medium bg-muted/30 min-w-[32px]">T</th>
              </tr>
            </thead>
            <tbody>
              {/* Away Team Row */}
              {awayBox && (
                <tr className="border-b">
                  <td className="p-1">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 flex-shrink-0 relative">
                        {getTeamLogo(game.AwayTeam) ? (
                          <Image
                            src={getTeamLogo(game.AwayTeam)!}
                            alt={`${game.AwayTeam} logo`}
                            fill
                            className="object-contain"
                            sizes="16px"
                          />
                        ) : (
                          <div className="w-4 h-4 bg-muted rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-bold">{game.AwayTeam?.slice(0, 2)}</span>
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-xs">{game.AwayTeam}</span>
                    </div>
                  </td>
                  {awayBox.map((score, index) => (
                    <td key={index} className="text-center p-1 font-mono text-xs">{score}</td>
                  ))}
                  {/* Fill empty quarters if needed */}
                  {Array.from({ length: maxQuarters - awayBox.length }).map((_, index) => (
                    <td key={`empty-away-${index}`} className="text-center p-1 font-mono text-xs">-</td>
                  ))}
                  <td className="text-center p-1 font-bold bg-muted/30 text-xs">{game.AwayScore}</td>
                </tr>
              )}

              {/* Home Team Row */}
              {homeBox && (
                <tr>
                  <td className="p-1">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 flex-shrink-0 relative">
                        {getTeamLogo(game.HomeTeam) ? (
                          <Image
                            src={getTeamLogo(game.HomeTeam)!}
                            alt={`${game.HomeTeam} logo`}
                            fill
                            className="object-contain"
                            sizes="16px"
                          />
                        ) : (
                          <div className="w-4 h-4 bg-muted rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-bold">{game.HomeTeam?.slice(0, 2)}</span>
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-xs">{game.HomeTeam}</span>
                    </div>
                  </td>
                  {homeBox.map((score, index) => (
                    <td key={index} className="text-center p-1 font-mono text-xs">{score}</td>
                  ))}
                  {/* Fill empty quarters if needed */}
                  {Array.from({ length: maxQuarters - homeBox.length }).map((_, index) => (
                    <td key={`empty-home-${index}`} className="text-center p-1 font-mono text-xs">-</td>
                  ))}
                  <td className="text-center p-1 font-bold bg-muted/30 text-xs">{game.HomeScore}</td>
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
        minute: '2-digit'
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
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
          <CardTitle className="text-destructive text-sm">Error Loading Scoreboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile-Optimized Header Controls */}
      <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div className="hidden md:block">
          <h2 className="text-xl font-bold">2024 NFL Season Scoreboard</h2>
          <p className="text-sm text-muted-foreground">Complete schedule and results with accurate ESPN data</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center md:justify-end">
          <Button variant="outline" size="sm" onClick={expandAll} className="text-xs h-7">
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll} className="text-xs h-7">
            Collapse All
          </Button>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-24 h-7 text-xs">
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

      {/* Mobile-Optimized Week Cards */}
      <div className="space-y-3">
        {filteredWeekData.map((week) => (
          <Card key={week.week}>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors pb-2 md:pb-4"
              onClick={() => toggleWeek(week.week)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-[var(--nfl-accent)]" />
                  <CardTitle className="text-sm md:text-lg">
                    {week.games[0]?.WeekName || `Week ${week.week}`}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {week.games.length}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs hidden md:inline-flex">
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
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {week.games.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No games scheduled for this week</p>
                    </div>
                  ) : (
                    week.games.map((game, index) => (
                      <div key={game.GameKey || index} className="space-y-2">
                        {/* Mobile-Optimized Game Card */}
                        <div className="border rounded-lg p-3 hover:bg-muted/20 transition-colors">
                          {/* Game Header - Teams and Scores */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3 flex-1">
                              {/* Away Team */}
                              <div className="flex items-center space-x-2 min-w-0">
                                <div className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 relative">
                                  {getTeamLogo(game.AwayTeam) ? (
                                    <Image
                                      src={getTeamLogo(game.AwayTeam)!}
                                      alt={`${game.AwayTeam} logo`}
                                      fill
                                      className="object-contain"
                                      sizes="32px"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-muted rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold">{game.AwayTeam}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-sm md:text-base truncate">{game.AwayTeam}</div>
                                  <div className="font-bold text-lg md:text-xl">
                                    {game.AwayScore ?? '-'}
                                  </div>
                                </div>
                              </div>

                              {/* VS Separator */}
                              <div className="text-muted-foreground font-medium text-sm">@</div>

                              {/* Home Team */}
                              <div className="flex items-center space-x-2 min-w-0">
                                <div className="min-w-0">
                                  <div className="font-medium text-sm md:text-base truncate">{game.HomeTeam}</div>
                                  <div className="font-bold text-lg md:text-xl">
                                    {game.HomeScore ?? '-'}
                                  </div>
                                </div>
                                <div className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 relative">
                                  {getTeamLogo(game.HomeTeam) ? (
                                    <Image
                                      src={getTeamLogo(game.HomeTeam)!}
                                      alt={`${game.HomeTeam} logo`}
                                      fill
                                      className="object-contain"
                                      sizes="32px"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-muted rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold">{game.HomeTeam}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Game Status */}
                            <Badge variant={getStatusBadgeVariant(getGameStatus(game))} className="text-xs ml-2">
                              {getGameStatus(game)}
                            </Badge>
                          </div>

                          {/* Game Info Row */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(game.Date)}</span>
                              </div>
                              {game.Date && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(game.Date)}</span>
                                </div>
                              )}
                              {game.Channel && (
                                <span className="hidden md:inline">{game.Channel}</span>
                              )}
                            </div>
                            
                            {/* Box Score Button */}
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
                                Box
                              </Button>
                            )}
                          </div>

                          {/* Additional Info for Mobile */}
                          <div className="md:hidden mt-2 flex items-center justify-between text-xs text-muted-foreground">
                            {game.Channel && <span>{game.Channel}</span>}
                            {game.Spread && (
                              <span>Spread: {game.Spread > 0 ? '+' : ''}{game.Spread}</span>
                            )}
                          </div>
                        </div>

                        {/* Mobile Box Score Display */}
                        {expandedBoxScores.has(game.GameKey || `${game.AwayTeam}-${game.HomeTeam}-${game.Week}`) && (
                          <div className="ml-2 mr-2">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-xs flex items-center space-x-1">
                                  <BarChart3 className="h-3 w-3" />
                                  <span>Box Score</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-0">
                                {renderMobileBoxScore(game)}
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
          <CardContent className="text-center py-6">
            <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No games found for the selected criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

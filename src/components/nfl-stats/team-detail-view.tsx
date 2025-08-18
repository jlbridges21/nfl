'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Search, User, BarChart3, Trophy, Target } from 'lucide-react'
import { sportsDataAPI, NFLTeam, NFLPlayer, NFLPlayerSeasonStats } from '@/lib/sportsdata-api'
import { Database } from '@/types/database'
import Image from 'next/image'

interface TeamDetailViewProps {
  team: NFLTeam
  onBack: () => void
}

type PlayerHeadshot = Database['public']['Tables']['headshots']['Row']

export function TeamDetailView({ team, onBack }: TeamDetailViewProps) {
  const [players, setPlayers] = useState<NFLPlayer[]>([])
  const [playerStats, setPlayerStats] = useState<NFLPlayerSeasonStats[]>([])
  const [headshots, setHeadshots] = useState<PlayerHeadshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [activeTab, setActiveTab] = useState('roster')

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true)
        const [playersData, statsData, headshotsResponse] = await Promise.all([
          sportsDataAPI.getPlayersByTeam(team.Key),
          sportsDataAPI.getPlayerSeasonStatsByTeam(2024, team.Key),
          fetch('/api/headshots').then(res => res.json()).catch(() => []) // Don't fail if headshots fail
        ])
        setPlayers(playersData)
        setPlayerStats(statsData)
        setHeadshots(headshotsResponse)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch team data')
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [team.Key])

  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'OL', 'DL', 'LB', 'DB']
  
  const getPlayerHeadshot = (player: NFLPlayer) => {
    // First try to match by player ID
    let headshot = headshots.find(h => h.player_id === player.PlayerID)
    
    // If no match by ID, try to match by name (case-insensitive)
    if (!headshot && player.Name) {
      headshot = headshots.find(h => 
        h.name && h.name.toLowerCase() === player.Name.toLowerCase()
      )
    }
    
    // If still no match, try partial name matching (last name)
    if (!headshot && player.Name) {
      const playerLastName = player.Name.split(' ').pop()?.toLowerCase()
      if (playerLastName) {
        headshot = headshots.find(h => 
          h.name && h.name.toLowerCase().includes(playerLastName)
        )
      }
    }
    
    return headshot
  }

  const getPlayerImageUrl = (player: NFLPlayer) => {
    const headshot = getPlayerHeadshot(player)
    
    // Use the preferred_hosted_headshot_url from the headshots API
    if (headshot?.preferred_hosted_headshot_url) {
      return headshot.preferred_hosted_headshot_url
    }
    
    // Return null if no headshot URL is available
    return null
  }

  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const handleImageError = (imageUrl: string, playerId: number) => {
    setFailedImages(prev => new Set([...prev, imageUrl]))
  }

  const getWorkingImageUrl = (player: NFLPlayer) => {
    const imageUrl = getPlayerImageUrl(player)
    if (!imageUrl || failedImages.has(imageUrl)) return null
    return imageUrl
  }

  const sortPlayers = (playersToSort: NFLPlayer[]) => {
    return [...playersToSort].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'number':
          aValue = a.Number || 999
          bValue = b.Number || 999
          break
        case 'name':
          aValue = a.Name.toLowerCase()
          bValue = b.Name.toLowerCase()
          break
        case 'position':
          aValue = a.Position
          bValue = b.Position
          break
        case 'experience':
          aValue = a.Experience || 0
          bValue = b.Experience || 0
          break
        case 'height':
          // Convert height to inches for sorting
          const parseHeight = (height: string | undefined) => {
            if (!height) return 0
            const match = height.match(/(\d+)'(\d+)"?/)
            if (match) {
              return parseInt(match[1]) * 12 + parseInt(match[2])
            }
            return 0
          }
          aValue = parseHeight(a.Height)
          bValue = parseHeight(b.Height)
          break
        case 'weight':
          aValue = a.Weight || 0
          bValue = b.Weight || 0
          break
        case 'college':
          aValue = (a.College || '').toLowerCase()
          bValue = (b.College || '').toLowerCase()
          break
        default:
          aValue = a.Name.toLowerCase()
          bValue = b.Name.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  const filteredAndSortedPlayers = sortPlayers(
    players.filter(player => {
      const matchesSearch = player.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           player.Position.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPosition = selectedPosition === 'all' || player.Position === selectedPosition
      return matchesSearch && matchesPosition && player.Active
    })
  )

  const getPlayerStats = (playerId: number) => {
    return playerStats.find(stat => stat.PlayerID === playerId)
  }

  const formatStat = (value: number | undefined | null, suffix = '') => {
    if (value === undefined || value === null) return '-'
    return `${value}${suffix}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Team Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>
        <div className="flex items-center space-x-4">
          <div className="relative h-16 w-16 flex-shrink-0">
            {team.WikipediaLogoUrl ? (
              <Image
                src={team.WikipediaLogoUrl}
                alt={`${team.FullName} logo`}
                fill
                className="object-contain"
                sizes="64px"
              />
            ) : (
              <div 
                className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: team.PrimaryColor || '#1f2937' }}
              >
                {team.Key}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{team.FullName}</h1>
            <p className="text-muted-foreground">
              {team.Conference} {team.Division} • {team.HeadCoach && `Head Coach: ${team.HeadCoach}`}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roster" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Roster ({players.filter(p => p.Active).length})</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Season Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="space-y-4">
          {/* Filters and Sorting */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map(pos => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="number">Player #</SelectItem>
                  <SelectItem value="position">Position</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="height">Height</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedPlayers.map((player) => (
              <Card key={player.PlayerID} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative h-12 w-12 flex-shrink-0">
                      {getWorkingImageUrl(player) ? (
                        <Image
                          src={getWorkingImageUrl(player) || ''}
                          alt={`${player.Name} headshot`}
                          fill
                          className="object-cover rounded-full"
                          sizes="48px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            const currentSrc = target.src
                            handleImageError(currentSrc, player.PlayerID)
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm font-semibold truncate">
                        {player.Name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        #{player.Number} • {player.Position}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Height/Weight:</span>
                      <span>{player.Height || 'N/A'} / {player.Weight ? `${player.Weight} lbs` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience:</span>
                      <span>{player.Experience ? `${player.Experience} years` : 'Rookie'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">College:</span>
                      <span className="truncate">{player.College || 'N/A'}</span>
                    </div>
                    {player.InjuryStatus && player.InjuryStatus !== 'Healthy' && (
                      <Badge variant="destructive" className="text-xs">
                        {player.InjuryStatus}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAndSortedPlayers.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No players found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {/* Position Filter for Stats */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">2024 Season Statistics</h3>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map(pos => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedPlayers
              .map((player: NFLPlayer) => ({ player, stats: getPlayerStats(player.PlayerID) }))
              .filter(({ stats }: { stats: any }) => stats && (stats.PassingYards || stats.RushingYards || stats.ReceivingYards || stats.Tackles))
              .map(({ player, stats }: { player: NFLPlayer; stats: any }) => (
                <Card key={player.PlayerID} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative h-10 w-10 flex-shrink-0">
                        {getWorkingImageUrl(player) ? (
                          <Image
                            src={getWorkingImageUrl(player) || ''}
                            alt={`${player.Name} headshot`}
                            fill
                            className="object-cover rounded-full"
                            sizes="40px"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              const currentSrc = target.src
                              handleImageError(currentSrc, player.PlayerID)
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-semibold truncate">
                          {player.Name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {player.Position}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      {/* Passing Stats */}
                      {stats?.PassingYards && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Passing Yards:</span>
                            <span className="font-medium">{formatStat(stats.PassingYards)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">TD/INT:</span>
                            <span>{formatStat(stats.PassingTouchdowns)}/{formatStat(stats.PassingInterceptions)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rating:</span>
                            <span>{formatStat(stats.PassingRating, '')}</span>
                          </div>
                        </div>
                      )}

                      {/* Rushing Stats */}
                      {stats?.RushingYards && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rushing Yards:</span>
                            <span className="font-medium">{formatStat(stats.RushingYards)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rush TDs:</span>
                            <span>{formatStat(stats.RushingTouchdowns)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">YPC:</span>
                            <span>{formatStat(stats.RushingYardsPerAttempt)}</span>
                          </div>
                        </div>
                      )}

                      {/* Receiving Stats */}
                      {stats?.ReceivingYards && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Receiving Yards:</span>
                            <span className="font-medium">{formatStat(stats.ReceivingYards)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Receptions:</span>
                            <span>{formatStat(stats.Receptions)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rec TDs:</span>
                            <span>{formatStat(stats.ReceivingTouchdowns)}</span>
                          </div>
                        </div>
                      )}

                      {/* Defensive Stats */}
                      {stats?.Tackles && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tackles:</span>
                            <span className="font-medium">{formatStat(stats.Tackles)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sacks:</span>
                            <span>{formatStat(stats.Sacks)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Interceptions:</span>
                            <span>{formatStat(stats.Interceptions)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {filteredAndSortedPlayers.filter((player: NFLPlayer) => {
            const stats = getPlayerStats(player.PlayerID)
            return stats && (stats.PassingYards || stats.RushingYards || stats.ReceivingYards || stats.Tackles)
          }).length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No player statistics available for the selected criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

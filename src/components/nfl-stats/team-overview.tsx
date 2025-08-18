'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Users, Trophy, TrendingUp } from 'lucide-react'
import { sportsDataAPI, NFLTeam } from '@/lib/sportsdata-api'
import Image from 'next/image'

interface TeamOverviewProps {
  onTeamSelect: (team: NFLTeam) => void
}

export function TeamOverview({ onTeamSelect }: TeamOverviewProps) {
  const [teams, setTeams] = useState<NFLTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConference, setSelectedConference] = useState<string>('all')
  const [selectedDivision, setSelectedDivision] = useState<string>('all')

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true)
        const teamsData = await sportsDataAPI.getTeams()
        setTeams(teamsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch teams')
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.City.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.Name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesConference = selectedConference === 'all' || team.Conference === selectedConference
    const matchesDivision = selectedDivision === 'all' || team.Division === selectedDivision

    return matchesSearch && matchesConference && matchesDivision
  })

  const conferences = ['AFC', 'NFC']
  const divisions = ['East', 'North', 'South', 'West']

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 32 }).map((_, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedConference} onValueChange={setSelectedConference}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Conference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conferences</SelectItem>
            {conferences.map(conf => (
              <SelectItem key={conf} value={conf}>{conf}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedDivision} onValueChange={setSelectedDivision}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Division" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {divisions.map(div => (
              <SelectItem key={div} value={div}>{div}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTeams.map((team) => (
          <Card 
            key={team.Key} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 group"
            onClick={() => onTeamSelect(team)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="relative h-12 w-12 flex-shrink-0">
                  {team.WikipediaLogoUrl ? (
                    <Image
                      src={team.WikipediaLogoUrl}
                      alt={`${team.FullName} logo`}
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  ) : (
                    <div 
                      className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: team.PrimaryColor || '#1f2937' }}
                    >
                      {team.Key}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm font-semibold truncate group-hover:text-[var(--nfl-accent)] transition-colors">
                    {team.City}
                  </CardTitle>
                  <CardDescription className="text-xs truncate">
                    {team.Name}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="text-xs">
                  {team.Conference}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {team.Division}
                </Badge>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Roster</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Stats</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No teams found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { TeamOverview } from '@/components/nfl-stats/team-overview'
import { TeamDetailView } from '@/components/nfl-stats/team-detail-view'
import { Scoreboard } from '@/components/nfl-stats/scoreboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Users, Calendar, Trophy, TrendingUp } from 'lucide-react'
import { NFLTeam } from '@/lib/sportsdata-api'

type ViewMode = 'overview' | 'team-detail'

export default function NFLStatsPage() {
  const [selectedTeam, setSelectedTeam] = useState<NFLTeam | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedSeason, setSelectedSeason] = useState<number>(2024)
  const [activeTab, setActiveTab] = useState('teams')

  const handleTeamSelect = (team: NFLTeam) => {
    setSelectedTeam(team)
    setViewMode('team-detail')
  }

  const handleBackToOverview = () => {
    setSelectedTeam(null)
    setViewMode('overview')
  }

  const availableSeasons = [2024, 2023, 2022, 2021, 2020]

  return (
    <Container>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {selectedTeam && viewMode === 'team-detail' 
                ? `${selectedTeam.FullName} - ${selectedSeason}` 
                : `${selectedSeason} NFL Season Stats`
              }
            </h1>
            <p className="text-muted-foreground mt-2">
              {selectedTeam && viewMode === 'team-detail'
                ? `Complete roster, player statistics, and team information`
                : `Comprehensive team information, player rosters, season statistics, and full scoreboard`
              }
            </p>
          </div>
          
          {/* Season Selector */}
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
        </div>

        {/* Stats Overview Cards */}
        {viewMode === 'overview' && (
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
                <CardTitle className="text-sm font-medium">Regular Season</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
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
                <div className="text-2xl font-bold">272</div>
                <p className="text-xs text-muted-foreground">
                  Regular season games
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
                  SportsDataIO API
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        {viewMode === 'team-detail' && selectedTeam ? (
          <TeamDetailView 
            team={selectedTeam} 
            onBack={handleBackToOverview}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teams" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Teams & Players</span>
              </TabsTrigger>
              <TabsTrigger value="scoreboard" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Full Season Scoreboard</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>NFL Teams</span>
                  </CardTitle>
                  <CardDescription>
                    Select any team to view detailed roster information, player statistics, and team performance data.
                    Each team card shows conference and division information with official team logos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TeamOverview onTeamSelect={handleTeamSelect} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scoreboard" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Season Scoreboard</span>
                  </CardTitle>
                  <CardDescription>
                    Complete schedule and results for all {selectedSeason} NFL regular season games, 
                    organized by week with game status, scores, and scheduling information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Scoreboard season={selectedSeason} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Footer Info */}
        {viewMode === 'overview' && (
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-semibold mb-2">About This Data</h3>
                  <p className="text-sm text-muted-foreground">
                    All NFL data is sourced from SportsDataIO's comprehensive API, providing real-time 
                    statistics, player information, team rosters, and game results. Data is updated 
                    regularly throughout the season.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Real-time Data</Badge>
                  <Badge variant="secondary">Official Stats</Badge>
                  <Badge variant="secondary">Complete Coverage</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  )
}

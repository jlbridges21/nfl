'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { ChevronUp, ChevronDown, Lock } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { TeamDetailModal } from './team-detail-modal'

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

type StatCategory = 'offense' | 'defense'
type SortField = keyof Omit<TeamWithStats, 'teams' | 'id' | 'team_id' | 'Year'> | 'team_name'
type SortDirection = 'asc' | 'desc'

interface TeamStatsTableProps {
  data: TeamWithStats[]
}

// Define which stats belong to which category (RZ TDs/Game columns removed)
const offensiveStats = [
  'fpi',
  'Yards_per_Game',
  'Points_Per_Game',
  'Touchdowns_per_Game',
  'Passing_Yards_Per_Game',
  'Rushing_Yards_Per_Game_',
  'Average_Scoring_Margin',
  'Yards_Per_Point',
  'fpi_off'
] as const

const defensiveStats = [
  'fpi_def',
  'Opponent_Yards_per_Game',
  'Opponent_Points_per_Game',
  'Opponent_Passing_Yards_per_Game',
  'Opponent_Rushing_Yards_per_Game'
] as const

// Column display names
const columnNames: Record<string, string> = {
  'fpi': 'FPI',
  'fpi_off': 'FPI Offense',
  'fpi_def': 'FPI Defense',
  'Yards_per_Game': 'Yards/Game',
  'Points_Per_Game': 'Points/Game',
  'Touchdowns_per_Game': 'TDs/Game',
  'Passing_Yards_Per_Game': 'Pass Yds/Game',
  'Rushing_Yards_Per_Game_': 'Rush Yds/Game',
  'Red_Zone_Scores_Per_Game_TD_only': 'RZ TDs/Game',
  'Average_Scoring_Margin': 'Scoring Margin',
  'Yards_Per_Point': 'Yards/Point',
  'Opponent_Yards_per_Game': 'Opp Yards/Game',
  'Opponent_Points_per_Game': 'Opp Points/Game',
  'Opponent_Passing_Yards_per_Game': 'Opp Pass Yds/Game',
  'Opponent_Rushing_Yards_per_Game': 'Opp Rush Yds/Game',
  'Opponent_Red_Zone_Scores_per_Game_TDs_only': 'Opp RZ TDs/Game'
}

interface TeamStatsTableProps {
  data: TeamWithStats[]
}

const formatStatValue = (value: number | null): React.ReactNode => {
  if (value === null || value === undefined) {
    return (
      <div title="This statistic is stored in our database but not available for viewing">
        <Lock className="h-4 w-4 text-muted-foreground mx-auto" />
      </div>
    )
  }
  return value.toFixed(1)
}

export function TeamStatsTable({ data }: TeamStatsTableProps) {
  const [sortField, setSortField] = useState<SortField>('team_name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [statCategory, setStatCategory] = useState<StatCategory>('offense')
  const [selectedTeam, setSelectedTeam] = useState<TeamWithStats | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue: string | number | null
      let bValue: string | number | null

      if (sortField === 'team_name') {
        aValue = a.teams.name
        bValue = b.teams.name
      } else {
        aValue = a[sortField]
        bValue = b[sortField]
      }

      // Handle null values
      if (aValue === null && bValue === null) return 0
      if (aValue === null) return 1
      if (bValue === null) return -1

      // Compare values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return sortDirection === 'asc' ? comparison : -comparison
      }

      // For numeric comparison, ensure both values are numbers
      const numA = typeof aValue === 'number' ? aValue : 0
      const numB = typeof bValue === 'number' ? bValue : 0
      const comparison = numA - numB
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleTeamClick = (team: TeamWithStats) => {
    setSelectedTeam(team)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTeam(null)
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </span>
    </Button>
  )

  // Get the stats to display based on selected category
  const statsToShow = statCategory === 'offense' ? offensiveStats : defensiveStats

  return (
    <div className="space-y-4">
      {/* Offensive/Defensive Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border bg-muted p-1">
          <button
            onClick={() => setStatCategory('offense')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              statCategory === 'offense'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Offense
          </button>
          <button
            onClick={() => setStatCategory('defense')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              statCategory === 'defense'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Defense
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <SortButton field="team_name">Team</SortButton>
              </TableHead>
              {statsToShow.map((stat) => (
                <TableHead key={stat} className="text-center">
                  <SortButton field={stat}>{columnNames[stat]}</SortButton>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((team) => (
              <TableRow 
                key={team.id}
                className="cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group"
                onClick={() => handleTeamClick(team)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {team.teams.logo_url && (
                      <div className="relative h-8 w-8 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                        <Image
                          src={team.teams.logo_url}
                          alt={`${team.teams.name} logo`}
                          fill
                          className="object-contain"
                          sizes="32px"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold transition-colors duration-200 group-hover:text-primary">
                        {team.teams.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {team.teams.conference} {team.teams.division}
                      </div>
                    </div>
                  </div>
                </TableCell>
                {statsToShow.map((stat) => (
                  <TableCell key={stat} className="text-center">
                    {formatStatValue(team[stat])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Team Detail Modal */}
      <TeamDetailModal
        team={selectedTeam}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

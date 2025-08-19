'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Lock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

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

interface TeamDetailModalProps {
  team: TeamWithStats | null
  isOpen: boolean
  onClose: () => void
}

const formatStatValue = (value: number | null): React.ReactNode => {
  if (value === null || value === undefined) {
    return (
      <div title="This statistic is stored in our database but not available for viewing">
        <Lock className="h-4 w-4 text-white/60" />
      </div>
    )
  }
  return value.toFixed(1)
}

const StatItem = ({ label, value, isGood }: { label: string; value: React.ReactNode; isGood?: boolean }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
    <span className="text-white/80 text-sm">{label}</span>
    <span className={`font-semibold ${isGood ? 'text-green-300' : 'text-white'}`}>
      {value}
    </span>
  </div>
)

export function TeamDetailModal({ team, isOpen, onClose }: TeamDetailModalProps) {
  if (!team) return null

  const primaryColor = team.teams.primary_color || '#1f2937'
  const secondaryColor = team.teams.secondary_color || '#374151'

  // Create gradient background
  const gradientStyle = {
    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
  }

  const offensiveStats = [
    { label: 'FPI Offense', value: formatStatValue(team.fpi_off) },
    { label: 'Yards per Game', value: formatStatValue(team.Yards_per_Game) },
    { label: 'Points per Game', value: formatStatValue(team.Points_Per_Game) },
    { label: 'Touchdowns per Game', value: formatStatValue(team.Touchdowns_per_Game) },
    { label: 'Passing Yards per Game', value: formatStatValue(team.Passing_Yards_Per_Game) },
    { label: 'Rushing Yards per Game', value: formatStatValue(team.Rushing_Yards_Per_Game_) },
    { label: 'Yards per Point', value: formatStatValue(team.Yards_Per_Point) },
  ]

  const defensiveStats = [
    { label: 'FPI Defense', value: formatStatValue(team.fpi_def) },
    { label: 'Opponent Yards per Game', value: formatStatValue(team.Opponent_Yards_per_Game) },
    { label: 'Opponent Points per Game', value: formatStatValue(team.Opponent_Points_per_Game) },
    { label: 'Opponent Passing Yards per Game', value: formatStatValue(team.Opponent_Passing_Yards_per_Game) },
    { label: 'Opponent Rushing Yards per Game', value: formatStatValue(team.Opponent_Rushing_Yards_per_Game) },
  ]

  const scoringMargin = team.Average_Scoring_Margin
  const isPositiveMargin = scoringMargin !== null && scoringMargin > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden border-0">
        <div style={gradientStyle} className="relative max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {team.teams.logo_url && (
                  <div className="relative h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                    <Image
                      src={team.teams.logo_url}
                      alt={`${team.teams.name} logo`}
                      fill
                      className="object-contain drop-shadow-lg"
                      sizes="(max-width: 640px) 48px, 64px"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-lg sm:text-2xl font-bold text-white mb-1 truncate">
                    {team.teams.name}
                  </DialogTitle>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                      {team.teams.conference} {team.teams.division}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                      {team.teams.abbreviation}
                    </Badge>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="p-4 sm:p-6 pt-2">
            {/* FPI and Scoring Margin Highlights */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* FPI Highlight */}
              <div className="p-3 sm:p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-white/80 text-xs sm:text-sm mb-1">Football Power Index (FPI)</div>
                  <div className={`text-2xl sm:text-3xl font-bold ${team.fpi !== null && team.fpi > 0 ? 'text-green-300' : team.fpi === 0 ? 'text-yellow-300' : 'text-red-300'}`}>
                    {team.fpi !== null ? (team.fpi > 0 ? '+' : '') + team.fpi.toFixed(1) : (
                      <div title="This statistic is stored in our database but not available for viewing" className="flex justify-center">
                        <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white/60" />
                      </div>
                    )}
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    {team.fpi !== null ? (team.fpi > 0 ? 'Above average team' : team.fpi === 0 ? 'Average team' : 'Below average team') : 'Data not available for viewing'}
                  </div>
                </div>
              </div>

              {/* Scoring Margin Highlight */}
              <div className="p-3 sm:p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-white/80 text-xs sm:text-sm mb-1">Average Scoring Margin</div>
                  <div className={`text-2xl sm:text-3xl font-bold ${isPositiveMargin ? 'text-green-300' : scoringMargin === 0 ? 'text-yellow-300' : 'text-red-300'}`}>
                    {scoringMargin !== null ? (scoringMargin > 0 ? '+' : '') + scoringMargin.toFixed(1) : (
                      <div title="This statistic is stored in our database but not available for viewing" className="flex justify-center">
                        <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white/60" />
                      </div>
                    )}
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    {scoringMargin !== null ? (isPositiveMargin ? 'Outscoring opponents' : scoringMargin === 0 ? 'Even with opponents' : 'Being outscored') : 'Data not available for viewing'}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Offensive Stats */}
              <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <h3 className="text-white font-semibold mb-2 sm:mb-3 text-center text-sm sm:text-base">Offensive Stats</h3>
                <div className="space-y-1">
                  {offensiveStats.map((stat, index) => (
                    <StatItem key={index} label={stat.label} value={stat.value} />
                  ))}
                </div>
              </div>

              {/* Defensive Stats */}
              <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <h3 className="text-white font-semibold mb-2 sm:mb-3 text-center text-sm sm:text-base">Defensive Stats</h3>
                <div className="space-y-1">
                  {defensiveStats.map((stat, index) => (
                    <StatItem key={index} label={stat.label} value={stat.value} />
                  ))}
                </div>
              </div>
            </div>

            {/* Season Info */}
            {team.Year && (
              <div className="mt-6 text-center">
                <div className="text-white/60 text-sm">
                  {team.Year} Season Statistics
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import type { Database } from '@/types/database'

type SeasonStatsRow = Database['public']['Tables']['season_stats']['Row']
type TeamsRow = Database['public']['Tables']['teams']['Row']

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')

    // If no year specified, get the most recent year
    if (!year) {
      const { data: yearsData, error: yearsError } = await supabaseServer
        .from('season_stats')
        .select('"Year"')
        .order('"Year"', { ascending: false })
        .limit(1)

      if (yearsError) {
        console.error('Years error:', yearsError)
        return NextResponse.json(
          { error: 'Failed to fetch years', details: yearsError },
          { status: 500 }
        )
      }

      const mostRecentYear = yearsData?.[0]?.Year
      if (!mostRecentYear) {
        return NextResponse.json({ data: [], availableYears: [] })
      }

      // Redirect to the most recent year
      return NextResponse.redirect(new URL(`/api/team-stats?year=${mostRecentYear}`, request.url))
    }

    // Get available years for the dropdown
    const { data: yearsData, error: yearsError } = await supabaseServer
      .from('season_stats')
      .select('"Year"')
      .order('"Year"', { ascending: false })

    if (yearsError) {
      console.error('Years error:', yearsError)
      return NextResponse.json(
        { error: 'Failed to fetch years', details: yearsError },
        { status: 500 }
      )
    }

    const availableYears = [...new Set(yearsData?.map(d => d.Year) || [])]

    // Fetch season stats for the specified year
    const { data: statsData, error: statsError } = await supabaseServer
      .from('season_stats')
      .select('*')
      .eq('"Year"', parseInt(year))

    if (statsError) {
      console.error('Season stats error:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch season stats', details: statsError },
        { status: 500 }
      )
    }

    // Fetch teams data
    const { data: teamsData, error: teamsError } = await supabaseServer
      .from('teams')
      .select('*')

    if (teamsError) {
      console.error('Teams error:', teamsError)
      return NextResponse.json(
        { error: 'Failed to fetch teams', details: teamsError },
        { status: 500 }
      )
    }

    // Join the data
    const joinedData = statsData?.map((stat: SeasonStatsRow) => {
      const team = teamsData?.find((t: TeamsRow) => t.id === stat.team_id)
      return {
        ...stat,
        teams: team || {
          id: stat.team_id,
          name: `Team ${stat.team_id}`,
          abbreviation: 'UNK',
          conference: 'AFC' as const,
          division: 'East' as const,
          logo_url: null,
          primary_color: null,
          secondary_color: null
        }
      }
    }) || []

    // Deduplicate by team_id, keeping the first occurrence
    const deduplicatedData = joinedData.filter((item, index, array) => 
      array.findIndex(other => other.team_id === item.team_id) === index
    )

    return NextResponse.json({
      data: deduplicatedData,
      availableYears,
      selectedYear: parseInt(year)
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}

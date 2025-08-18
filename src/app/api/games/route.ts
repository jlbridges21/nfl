import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season') || '2024'
    const week = searchParams.get('week')

    let query = supabase
      .from('espn_games')
      .select('*')
      .eq('season_year', parseInt(season))
      .order('week_num', { ascending: true })
      .order('datetime_utc', { ascending: true })

    if (week) {
      query = query.eq('week_num', parseInt(week))
    }

    const { data: games, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch games from database' },
        { status: 500 }
      )
    }

    // Group games by week for easier consumption
    const gamesByWeek: { [week: number]: any[] } = {}
    
    games?.forEach(game => {
      if (!gamesByWeek[game.week_num]) {
        gamesByWeek[game.week_num] = []
      }
      
      // Determine game status based on ESPN data
      const isOver = game.game_status === 'post' || game.period === 'F'
      const isInProgress = game.game_status === 'in' || (game.period && game.period !== 'F' && game.display_clock !== '0:00')
      const hasStarted = game.away_score !== null || game.home_score !== null || isInProgress || isOver
      
      gamesByWeek[game.week_num].push({
        GameKey: game.game_id,
        Date: game.datetime_utc,
        Week: game.week_num,
        Season: game.season_year,
        AwayTeam: game.away_abbr,
        HomeTeam: game.home_abbr,
        AwayScore: game.away_score,
        HomeScore: game.home_score,
        Quarter: game.period,
        Channel: game.broadcasts,
        IsOver: isOver,
        IsInProgress: isInProgress,
        HasStarted: hasStarted,
        // Additional ESPN data
        WeekName: game.week_name,
        AwayDisplayName: game.away_display_name,
        HomeDisplayName: game.home_display_name,
        GameStatus: game.game_status,
        DisplayClock: game.display_clock,
        Situation: game.situation,
        TotalPoints: game.total_points,
        OverUnder: game.over_under,
        Spread: game.spread,
        FavoredTeam: game.favored_team
      })
    })

    // Convert to array format expected by the frontend
    const weekDataArray = Object.keys(gamesByWeek)
      .map(week => ({
        week: parseInt(week),
        games: gamesByWeek[parseInt(week)]
      }))
      .sort((a, b) => a.week - b.week)

    return NextResponse.json(weekDataArray, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    })

  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

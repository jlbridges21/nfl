import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer
    
    const { data: headshots, error } = await supabase
      .from('headshots')
      .select('player_id, name, team_id, team, position, preferred_hosted_headshot_url')
    
    if (error) {
      console.error('Error fetching headshots:', error)
      return NextResponse.json(
        { error: 'Failed to fetch headshots' },
        { status: 500 }
      )
    }

    return NextResponse.json(headshots)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

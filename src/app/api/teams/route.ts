import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('teams')
      .select('*')
      .order('name');

    if (error) {
      console.error('Teams API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch teams', details: error },
        { status: 500 }
      );
    }

    // Convert snake_case to camelCase for consistency with our types
    const teams = data?.map(team => ({
      id: team.id,
      name: team.name,
      abbreviation: team.abbreviation,
      conference: team.conference,
      division: team.division,
      logoUrl: team.logo_url,
      primaryColor: team.primary_color,
      secondaryColor: team.secondary_color,
    })) || [];

    return NextResponse.json({ teams });

  } catch (error) {
    console.error('Teams API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/leaderboards - Get leaderboard for a club
export async function GET(req: NextRequest) {
  try {
    const clubId = req.nextUrl.searchParams.get('club_id');
    const skillLevel = req.nextUrl.searchParams.get('skill_level');
    
    if (!clubId) {
      return NextResponse.json({ 
        error: 'Missing required query param: club_id' 
      }, { status: 400 });
    }

    let query = supabase
      .from('leaderboards')
      .select('*')
      .eq('club_id', clubId)
      .order('rank', { ascending: true });
    
    if (skillLevel) {
      query = query.eq('skill_level', skillLevel);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/leaderboards - Record game result and update leaderboard
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { game_id, club_id, team_a_players, team_b_players, winning_team } = body;

    if (!game_id || !club_id || !team_a_players || !team_b_players || !winning_team) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Record game result
    const { error: resultError } = await supabase
      .from('game_results')
      .insert([
        {
          game_id,
          team_a_players,
          team_b_players,
          winning_team
        }
      ]);

    if (resultError) {
      return NextResponse.json({ error: resultError.message }, { status: 400 });
    }

    // Update leaderboard for winners
    const winningPlayers = winning_team === 'a' ? team_a_players : team_b_players;
    for (const playerId of winningPlayers) {
      // Get current record
      const { data: currentData } = await supabase
        .from('leaderboards')
        .select('wins, losses')
        .eq('club_id', club_id)
        .eq('player_id', playerId)
        .maybeSingle();
      
      if (currentData) {
        // Update existing record
        const newWins = (currentData.wins || 0) + 1;
        const newLosses = currentData.losses || 0;
        const newWinRate = (newWins / (newWins + newLosses)) * 100;
        
        await supabase
          .from('leaderboards')
          .update({ 
            wins: newWins,
            win_rate: Math.round(newWinRate * 100) / 100
          })
          .eq('club_id', club_id)
          .eq('player_id', playerId);
      }
    }

    // Update leaderboard for losers
    const losingPlayers = winning_team === 'a' ? team_b_players : team_a_players;
    for (const playerId of losingPlayers) {
      // Get current record
      const { data: currentData } = await supabase
        .from('leaderboards')
        .select('wins, losses')
        .eq('club_id', club_id)
        .eq('player_id', playerId)
        .maybeSingle();
      
      if (currentData) {
        // Update existing record
        const newWins = currentData.wins || 0;
        const newLosses = (currentData.losses || 0) + 1;
        const newWinRate = newWins > 0 ? (newWins / (newWins + newLosses)) * 100 : 0;
        
        await supabase
          .from('leaderboards')
          .update({ 
            losses: newLosses,
            win_rate: Math.round(newWinRate * 100) / 100
          })
          .eq('club_id', club_id)
          .eq('player_id', playerId);
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

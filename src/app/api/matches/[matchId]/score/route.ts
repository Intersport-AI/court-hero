import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { createClient } from '@supabase/supabase-js';
import { broadcastScoreUpdate, broadcastBracketUpdate } from '@/lib/socket';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/matches/[matchId]/score
 * Submit a score for a match (referee or organizer)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  const auth = await requireAuth(request);
  if (!auth.valid) return auth.response;

  try {
    const body = await request.json();
    const {
      team1_score_game1,
      team2_score_game1,
      team1_score_game2,
      team2_score_game2,
      team1_score_game3,
      team2_score_game3,
    } = body;

    if (
      team1_score_game1 === undefined ||
      team2_score_game1 === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: team1_score_game1, team2_score_game1' },
        { status: 400 }
      );
    }

    // Get match details
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Determine winner
    const game1Winner =
      team1_score_game1 > team2_score_game1
        ? match.team1_player_ids
        : match.team2_player_ids;
    const game2Winner =
      team1_score_game2 > team2_score_game2
        ? match.team1_player_ids
        : match.team2_player_ids;
    const game3Winner =
      team1_score_game3 > team2_score_game3
        ? match.team1_player_ids
        : match.team2_player_ids;

    // Best of 3 logic
    let matchWinner = null;
    let gamesWon1 = 0;
    let gamesWon2 = 0;

    if (JSON.stringify(game1Winner) === JSON.stringify(match.team1_player_ids))
      gamesWon1++;
    else gamesWon2++;

    if (team1_score_game2 !== undefined && team2_score_game2 !== undefined) {
      if (JSON.stringify(game2Winner) === JSON.stringify(match.team1_player_ids))
        gamesWon1++;
      else gamesWon2++;
    }

    if (gamesWon1 >= 2) {
      matchWinner = match.team1_player_ids;
    } else if (gamesWon2 >= 2) {
      matchWinner = match.team2_player_ids;
    } else if (
      team1_score_game3 !== undefined &&
      team2_score_game3 !== undefined
    ) {
      if (JSON.stringify(game3Winner) === JSON.stringify(match.team1_player_ids))
        gamesWon1++;
      else gamesWon2++;

      if (gamesWon1 >= 2) {
        matchWinner = match.team1_player_ids;
      } else if (gamesWon2 >= 2) {
        matchWinner = match.team2_player_ids;
      }
    }

    // Update match in database
    const { data: updatedMatch, error: updateError } = await supabase
      .from('matches')
      .update({
        team1_score_game1,
        team2_score_game1,
        team1_score_game2,
        team2_score_game2,
        team1_score_game3,
        team2_score_game3,
        winner_player_ids: matchWinner,
        status: matchWinner ? 'completed' : 'in-progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update player statistics
    if (matchWinner) {
      // Update winners
      for (const playerId of matchWinner) {
        await supabase
          .from('players')
          .update({
            wins: supabase.rpc('increment_wins', { player_id: playerId }),
          })
          .eq('id', playerId);
      }

      // Update losers
      const losingTeam = JSON.stringify(matchWinner) === JSON.stringify(match.team1_player_ids)
        ? match.team2_player_ids
        : match.team1_player_ids;

      for (const playerId of losingTeam) {
        await supabase
          .from('players')
          .update({
            losses: supabase.rpc('increment_losses', { player_id: playerId }),
          })
          .eq('id', playerId);
      }
    }

    // Broadcast updates via Socket.IO
    const eventId = match.event_id;
    const divisionId = match.bracket_id; // Using bracket_id as division identifier

    broadcastScoreUpdate(matchId, divisionId, eventId, {
      team1_score_game1,
      team2_score_game1,
      team1_score_game2,
      team2_score_game2,
      team1_score_game3,
      team2_score_game3,
      winner_player_ids: matchWinner,
    });

    broadcastBracketUpdate(divisionId, {
      matchId,
      completed: matchWinner ? true : false,
    });

    return NextResponse.json(
      {
        success: true,
        match: updatedMatch,
        winner: matchWinner,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

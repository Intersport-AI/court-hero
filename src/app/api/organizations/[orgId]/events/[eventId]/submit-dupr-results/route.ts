import { NextRequest, NextResponse } from 'next/server';
import { requireAuthorization } from '@/lib/middleware';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/organizations/[orgId]/events/[eventId]/submit-dupr-results
 * Generate and submit results to DUPR API
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; eventId: string }> }
) {
  const { orgId, eventId } = await params;

  const auth = await requireAuthorization(request, {
    roles: ['org_owner', 'event_director'],
    orgId,
  });

  if (!auth.valid) return auth.response;

  try {
    // Get event
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    // Get all completed matches
    const { data: matches } = await supabase
      .from('matches')
      .select(`
        *,
        round:rounds(id, round_number),
        division:divisions(id, name)
      `)
      .eq('event_id', eventId)
      .eq('status', 'completed');

    if (!matches || matches.length === 0) {
      return NextResponse.json(
        { message: 'No completed matches to submit' },
        { status: 200 }
      );
    }

    // Build DUPR-format results
    const duprResults = matches.map((match: any) => {
      const team1Name = match.team1_player_ids?.join(', ') || 'Team 1';
      const team2Name = match.team2_player_ids?.join(', ') || 'Team 2';

      const score1 = match.team1_score_game1 || 0;
      const score2 = match.team2_score_game1 || 0;

      return {
        team1: {
          players: match.team1_player_ids || [],
          score: score1,
        },
        team2: {
          players: match.team2_player_ids || [],
          score: score2,
        },
        winner: match.winner_player_ids || [],
        division: match.division?.name || 'Uncategorized',
        round: match.round?.round_number || 1,
      };
    });

    // Format for DUPR submission
    const duprPayload = {
      event_name: event.name,
      event_date: event.start_date,
      location: event.org_id, // Placeholder - would need venue info in prod
      results: duprResults,
    };

    // In production, would call DUPR API here:
    // const duprResponse = await submitToDUPRAPI(duprPayload);

    // For now, just return the formatted data
    return NextResponse.json(
      {
        success: true,
        message: 'Results ready for DUPR submission',
        resultsCount: duprResults.length,
        payload: duprPayload,
        duprApiUrl: 'https://api.duprtennis.com/v1/events/results', // Would call this in prod
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Helper function to submit results to actual DUPR API
 * Would be called from the endpoint above
 */
async function submitToDUPRAPI(payload: any) {
  try {
    const response = await fetch('https://api.duprtennis.com/v1/events/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DUPR_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`DUPR API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('DUPR submission error:', error.message);
    throw error;
  }
}

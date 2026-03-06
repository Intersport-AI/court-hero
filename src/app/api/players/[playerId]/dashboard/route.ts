import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/players/[playerId]/dashboard
 * Get player's dashboard: upcoming matches, recent results, profile
 * Public endpoint (no auth) - can view own or others' public info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  const { playerId } = await params;

  try {
    // Get player profile
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Get player's registrations
    const { data: registrations } = await supabase
      .from('registrations')
      .select('*, division:divisions(id, name, format)')
      .eq('player_id', playerId)
      .eq('status', 'confirmed');

    if (!registrations) {
      return NextResponse.json({
        success: true,
        player,
        upcomingMatches: [],
        recentResults: [],
        stats: {},
      });
    }

    // Get upcoming and past matches
    const now = new Date().toISOString();
    const divisionIds = registrations.map(r => r.division.id);

    const { data: allMatches } = await supabase
      .from('matches')
      .select('*')
      .in('bracket_id', divisionIds) // Using bracket_id as division ref
      .or(
        `team1_player_ids.cs.{${playerId}},team2_player_ids.cs.{${playerId}}`
      );

    const upcomingMatches = (allMatches || [])
      .filter(m => !m.scheduled_time || m.scheduled_time > now)
      .filter(m => m.status === 'scheduled')
      .sort((a, b) => {
        const aTime = a.scheduled_time ? new Date(a.scheduled_time).getTime() : Infinity;
        const bTime = b.scheduled_time ? new Date(b.scheduled_time).getTime() : Infinity;
        return aTime - bTime;
      })
      .slice(0, 5); // Next 5 matches

    const recentResults = (allMatches || [])
      .filter(m => m.status === 'completed')
      .sort((a, b) => {
        const aTime = new Date(a.updated_at).getTime();
        const bTime = new Date(b.updated_at).getTime();
        return bTime - aTime;
      })
      .slice(0, 10); // Last 10 results

    // Calculate stats
    const totalMatches = recentResults.length;
    const wins = recentResults.filter(m =>
      m.winner_player_ids?.includes(playerId)
    ).length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : '0.0';

    const stats = {
      totalMatches,
      wins,
      losses,
      winRate: `${winRate}%`,
      duprRating: player.dupr_rating,
      selfReportedRating: player.self_reported_rating,
    };

    return NextResponse.json(
      {
        success: true,
        player: {
          id: player.id,
          first_name: player.first_name,
          last_name: player.last_name,
          dupr_rating: player.dupr_rating,
          home_club: player.home_club,
        },
        upcomingMatches,
        recentResults,
        stats,
        registrations: registrations.map(r => ({
          eventId: r.event_id,
          divisionId: r.division.id,
          divisionName: r.division.name,
          format: r.division.format,
        })),
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

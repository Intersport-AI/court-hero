import { NextRequest, NextResponse } from 'next/server';
import { requireAuthorization } from '@/lib/middleware';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';
import {
  generateSingleElimination,
  generateDoubleElimination,
  generateRoundRobin,
  generatePoolPlay,
} from '@/lib/bracket-algorithms';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/organizations/[orgId]/events/[eventId]/generate-brackets
 * Generate brackets for all divisions in an event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; eventId: string }> }
) {
  const { orgId, eventId } = await params;

  const auth = await requireAuthorization(request, {
    roles: ['event_director', 'org_owner'],
    orgId,
  });

  if (!auth.valid) return auth.response;

  try {
    // Get all divisions for this event
    const { data: divisions, error: divError } = await supabase
      .from('divisions')
      .select('*')
      .eq('event_id', eventId);

    if (divError || !divisions) {
      return NextResponse.json({ error: 'No divisions found' }, { status: 404 });
    }

    const brackets = [];

    // For each division, generate bracket
    for (const division of divisions) {
      // Get all players registered in this division
      const { data: registrations } = await supabase
        .from('registrations')
        .select('player_id')
        .eq('division_id', division.id)
        .eq('status', 'confirmed');

      if (!registrations || registrations.length === 0) {
        continue;
      }

      const playerIds = registrations.map(r => r.player_id);

      // Generate bracket based on format
      let bracketStructure;
      switch (division.format) {
        case 'single-elim':
          bracketStructure = generateSingleElimination(playerIds);
          break;
        case 'double-elim':
          bracketStructure = generateDoubleElimination(playerIds);
          break;
        case 'round-robin':
          bracketStructure = generateRoundRobin(playerIds);
          break;
        case 'pool-play':
          bracketStructure = generatePoolPlay(playerIds);
          break;
        case 'pool-play-elim':
          // Pool play followed by elim (simplified)
          bracketStructure = generatePoolPlay(playerIds, Math.ceil(Math.sqrt(playerIds.length)));
          break;
        default:
          return NextResponse.json(
            { error: `Unknown format: ${division.format}` },
            { status: 400 }
          );
      }

      // Save bracket to database
      const bracketId = bracketStructure.bracket_id;
      const { error: bracketError } = await supabase.from('brackets').insert({
        id: bracketId,
        division_id: division.id,
        event_id: eventId,
        org_id: orgId,
        bracket_type: 'main',
        seeding: bracketStructure.seeding,
      });

      if (bracketError) {
        return NextResponse.json({ error: bracketError.message }, { status: 500 });
      }

      // Save all rounds and matches
      for (const round of bracketStructure.rounds) {
        const { error: roundError } = await supabase.from('rounds').insert({
          id: round.id,
          bracket_id: bracketId,
          event_id: eventId,
          org_id: orgId,
          round_number: round.round_number,
        });

        if (roundError) {
          return NextResponse.json({ error: roundError.message }, { status: 500 });
        }

        // Save matches
        for (const match of round.matches) {
          const { error: matchError } = await supabase.from('matches').insert({
            id: match.id,
            round_id: round.id,
            bracket_id: bracketId,
            event_id: eventId,
            org_id: orgId,
            team1_player_ids: match.team1_player_ids,
            team2_player_ids: match.team2_player_ids,
            status: 'scheduled',
          });

          if (matchError) {
            return NextResponse.json({ error: matchError.message }, { status: 500 });
          }
        }
      }

      brackets.push({
        divisionId: division.id,
        divisionName: division.name,
        bracketId,
        totalMatches: bracketStructure.rounds.reduce((sum, r) => sum + r.matches.length, 0),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Generated ${brackets.length} brackets`,
        brackets,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

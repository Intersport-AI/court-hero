import { NextRequest, NextResponse } from 'next/server';

// POST /api/games/[gameId]/pairings - Generate fair skill-balanced team pairings
export async function POST(req: NextRequest, { params }: { params: { gameId: string } }) {
  try {
    const body = await req.json();
    const { players } = body; // Array of { id, skill_level }

    if (!Array.isArray(players) || players.length < 4) {
      return NextResponse.json({ 
        error: 'Need at least 4 players to generate pairings' 
      }, { status: 400 });
    }

    // Sort players by skill level
    const sorted = [...players].sort((a, b) => 
      parseFloat(b.skill_level) - parseFloat(a.skill_level)
    );

    // Generate balanced teams using snake draft
    const team_a = [];
    const team_b = [];
    
    sorted.forEach((player, index) => {
      if (Math.floor(index / 2) % 2 === 0) {
        if (index % 2 === 0) {
          team_a.push(player.id);
        } else {
          team_b.push(player.id);
        }
      } else {
        if (index % 2 === 0) {
          team_b.push(player.id);
        } else {
          team_a.push(player.id);
        }
      }
    });

    // Calculate average skill for verification
    const avgA = team_a.reduce((sum, pid) => {
      const p = players.find(pl => pl.id === pid);
      return sum + (p ? parseFloat(p.skill_level) : 0);
    }, 0) / team_a.length;

    const avgB = team_b.reduce((sum, pid) => {
      const p = players.find(pl => pl.id === pid);
      return sum + (p ? parseFloat(p.skill_level) : 0);
    }, 0) / team_b.length;

    const skillDifference = Math.abs(avgA - avgB);
    const balanced = skillDifference < 0.3; // Within 0.3 skill points

    return NextResponse.json({
      pairings: {
        team_a: team_a.map(id => players.find(p => p.id === id)),
        team_b: team_b.map(id => players.find(p => p.id === id))
      },
      average_skill: {
        team_a: avgA.toFixed(2),
        team_b: avgB.toFixed(2),
        difference: skillDifference.toFixed(2)
      },
      balanced
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

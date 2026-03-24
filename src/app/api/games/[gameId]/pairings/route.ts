import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const body = await req.json();
    const { players } = body as { players: Array<{id: string, skill_level: string}> };

    if (!Array.isArray(players) || players.length < 4) {
      return NextResponse.json({ 
        error: 'Need at least 4 players to generate pairings' 
      }, { status: 400 });
    }

    const sorted = [...players].sort((a, b) => 
      parseFloat(b.skill_level) - parseFloat(a.skill_level)
    );

    const team_a: string[] = [];
    const team_b: string[] = [];
    
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

    const avgA = team_a.reduce((sum, pid) => {
      const p = players.find(pl => pl.id === pid);
      return sum + (p ? parseFloat(p.skill_level) : 0);
    }, 0) / team_a.length;

    const avgB = team_b.reduce((sum, pid) => {
      const p = players.find(pl => pl.id === pid);
      return sum + (p ? parseFloat(p.skill_level) : 0);
    }, 0) / team_b.length;

    const skillDifference = Math.abs(avgA - avgB);
    const balanced = skillDifference < 0.3;

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

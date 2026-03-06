'use client';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';

export default function EventBoardPage() {
  const params = useParams();
  const eventId = params.id as string;

  // Mock leaderboard data for now
  const standings = [
    { rank: 1, name: 'Smith / Jones', wins: 3, losses: 0, pointsFor: 33, pointsAgainst: 18 },
    { rank: 2, name: 'Chen / Lee', wins: 3, losses: 0, pointsFor: 31, pointsAgainst: 20 },
    { rank: 3, name: 'Davis / Brown', wins: 2, losses: 1, pointsFor: 28, pointsAgainst: 22 },
    { rank: 4, name: 'Wilson / Taylor', wins: 1, losses: 2, pointsFor: 24, pointsAgainst: 26 },
    { rank: 5, name: 'Garcia / Martinez', wins: 0, losses: 3, pointsFor: 19, pointsAgainst: 31 },
  ];

  return (
    <div className="min-h-screen bg-[#0C0F14] flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-3xl">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-white text-[56px] font-bold">Tournament Leaderboard</h1>
            <p className="text-[#8B9DB8] text-[18px] mt-2">Live standings – updates in real-time</p>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-8 py-6 bg-[#0A0D12]/50 border-b border-white/[0.06]">
              <div className="col-span-1 text-[#8B9DB8] font-medium text-[13px]">Rank</div>
              <div className="col-span-5 text-[#8B9DB8] font-medium text-[13px]">Team</div>
              <div className="col-span-2 text-[#8B9DB8] font-medium text-[13px] text-right">Record</div>
              <div className="col-span-2 text-[#8B9DB8] font-medium text-[13px] text-right">PF</div>
              <div className="col-span-2 text-[#8B9DB8] font-medium text-[13px] text-right">PA</div>
            </div>

            {standings.map((player, idx) => (
              <div key={idx}
                className={`grid grid-cols-12 gap-4 px-8 py-6 border-b border-white/[0.06] ${
                  idx < 3 ? 'bg-[#0A0D12]/30' : 'hover:bg-[#0A0D12]/20'
                } transition-colors`}>
                <div className="col-span-1">
                  <span className={`text-[20px] font-bold ${
                    idx === 0 ? 'text-[#FFB800]' :
                    idx === 1 ? 'text-[#C0C0C0]' :
                    idx === 2 ? 'text-[#CD7F32]' :
                    'text-[#8B9DB8]'
                  }`}>
                    {player.rank}
                  </span>
                </div>
                <div className="col-span-5">
                  <p className="text-white font-medium text-[16px]">{player.name}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-[#00F260] font-bold text-[16px]">{player.wins}–{player.losses}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-[#8B9DB8] text-[16px]">{player.pointsFor}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-[#8B9DB8] text-[16px]">{player.pointsAgainst}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Auto-refresh note */}
          <p className="text-[#64748B] text-[14px] text-center mt-8">
            ✓ Updates automatically every 10 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

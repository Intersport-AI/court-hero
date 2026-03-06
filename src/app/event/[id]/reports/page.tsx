'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';

export default function ReportsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [reportType, setReportType] = useState('financial');
  const [exportFormat, setExportFormat] = useState('csv');

  const financialData = {
    revenue: 2850,
    playerFees: 2400,
    platformFees: 450,
    expenses: 500,
    netProfit: 1900,
  };

  const playerData = [
    { rank: 1, name: 'Smith / Jones', paid: true, amount: '$38.00', date: 'Feb 26' },
    { rank: 2, name: 'Chen / Lee', paid: true, amount: '$38.00', date: 'Feb 26' },
    { rank: 3, name: 'Davis / Brown', paid: true, amount: '$38.00', date: 'Feb 25' },
  ];

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-4xl mx-auto pt-8 px-6 pb-12">
        <h1 className="text-white text-[40px] font-bold mb-8">Reports & Analytics</h1>

        {/* Report Type Selector */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setReportType('financial')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              reportType === 'financial'
                ? 'bg-[#00F260] text-black'
                : 'bg-[#111827] text-white border border-white/[0.06]'
            }`}>
            Financial
          </button>
          <button onClick={() => setReportType('players')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              reportType === 'players'
                ? 'bg-[#00F260] text-black'
                : 'bg-[#111827] text-white border border-white/[0.06]'
            }`}>
            Player Report
          </button>
          <button onClick={() => setReportType('matches')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              reportType === 'matches'
                ? 'bg-[#00F260] text-black'
                : 'bg-[#111827] text-white border border-white/[0.06]'
            }`}>
            Match Results
          </button>
        </div>

        {/* Export Controls */}
        <div className="flex gap-3 mb-8">
          <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}
            className="bg-[#111827] border border-white/[0.06] text-white px-4 py-2 rounded-lg outline-none">
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
            <option value="xlsx">Excel</option>
          </select>
          <button className="bg-[#00F260] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#00D954] transition-all">
            📥 Export {exportFormat.toUpperCase()}
          </button>
        </div>

        {/* Financial Report */}
        {reportType === 'financial' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
                <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">TOTAL REVENUE</p>
                <p className="text-[#00F260] text-[32px] font-bold">${financialData.revenue}</p>
              </div>
              <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
                <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">PLAYER FEES</p>
                <p className="text-[#FFB800] text-[32px] font-bold">${financialData.playerFees}</p>
              </div>
              <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
                <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">PLATFORM FEE</p>
                <p className="text-[#0AE87F] text-[32px] font-bold">${financialData.platformFees}</p>
              </div>
              <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
                <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">EXPENSES</p>
                <p className="text-red-400 text-[32px] font-bold">${financialData.expenses}</p>
              </div>
              <div className="bg-[#00F260]/10 border border-[#00F260]/20 rounded-2xl p-6">
                <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">NET PROFIT</p>
                <p className="text-[#00F260] text-[32px] font-bold">${financialData.netProfit}</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8">
              <h2 className="text-white text-[18px] font-bold mb-6">Revenue Breakdown</h2>
              <div className="space-y-4">
                {[
                  { label: 'Player Registration Fees', amount: '$2,400', percent: 84 },
                  { label: 'Platform Revenue', amount: '$450', percent: 16 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <p className="text-[#B8C4D4]">{item.label}</p>
                      <p className="text-white font-bold">{item.amount}</p>
                    </div>
                    <div className="w-full bg-[#0A0D12] rounded-full h-2">
                      <div
                        className="bg-[#00F260] h-2 rounded-full"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Player Report */}
        {reportType === 'players' && (
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-8 py-6 bg-[#0A0D12]/50 border-b border-white/[0.06] font-bold text-[13px] text-[#8B9DB8]">
              <div className="col-span-2">Player</div>
              <div>Payment</div>
              <div>Date</div>
            </div>
            {playerData.map((player, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-4 px-8 py-6 border-b border-white/[0.06]">
                <div className="col-span-2">
                  <p className="text-white font-bold">{player.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00F260]"></span>
                  <p className="text-[#00F260] font-medium">{player.amount}</p>
                </div>
                <div>
                  <p className="text-[#8B9DB8] text-[13px]">{player.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Match Results */}
        {reportType === 'matches' && (
          <div className="text-center py-12 bg-[#111827]/40 border border-white/[0.06] rounded-2xl">
            <p className="text-[#8B9DB8]">Match results will appear after the tournament.</p>
          </div>
        )}
      </div>
    </div>
  );
}

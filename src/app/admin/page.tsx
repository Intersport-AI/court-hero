'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 142,
    activeEvents: 23,
    totalPlayers: 5834,
    totalRevenue: 142850,
    monthlyGrowth: 23.5,
  });

  useEffect(() => {
    if (!user || user.role !== 'platform_admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const recentEvents = [
    { id: '1', name: 'Summer Championship 2026', org: 'Chicago Pickleball', players: 64, revenue: '$2,850', status: 'Active' },
    { id: '2', name: 'Downtown Open Cup', org: 'Oak Park Sports', players: 32, revenue: '$1,400', status: 'Completed' },
    { id: '3', name: 'Midwest Championship', org: 'Illinois Pickleball', players: 128, revenue: '$5,600', status: 'Active' },
  ];

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-7xl mx-auto pt-8 px-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-[40px] font-bold">Platform Admin</h1>
            <p className="text-[#8B9DB8] mt-1">System-wide overview and controls</p>
          </div>
          <div className="px-4 py-2 bg-[#00F260]/10 text-[#00F260] rounded-full text-[12px] font-bold">
            ADMIN ACCESS
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">TOTAL EVENTS</p>
            <p className="text-[#00F260] text-[32px] font-bold">{stats.totalEvents}</p>
            <p className="text-[#00F260] text-[11px] mt-1">+12 this month</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">ACTIVE NOW</p>
            <p className="text-[#FFB800] text-[32px] font-bold">{stats.activeEvents}</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">TOTAL PLAYERS</p>
            <p className="text-[#0AE87F] text-[32px] font-bold">{stats.totalPlayers.toLocaleString()}</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">REVENUE</p>
            <p className="text-white text-[32px] font-bold">${(stats.totalRevenue / 1000).toFixed(0)}k</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">GROWTH</p>
            <p className="text-[#00F260] text-[32px] font-bold">{stats.monthlyGrowth}%</p>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 mb-8">
          <h2 className="text-white text-[20px] font-bold mb-6">Recent Events</h2>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-[#0A0D12]/50 rounded-xl">
                <div className="flex-1">
                  <p className="text-white font-bold text-[15px]">{event.name}</p>
                  <p className="text-[#8B9DB8] text-[12px] mt-1">{event.org} • {event.players} players</p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-[#00F260] font-bold">{event.revenue}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                  event.status === 'Active' ? 'bg-[#00F260]/10 text-[#00F260]' : 'bg-[#8B9DB8]/10 text-[#8B9DB8]'
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Database</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00F260] animate-pulse"></span>
              <span className="text-[#00F260] font-bold text-[13px]">HEALTHY</span>
            </div>
            <p className="text-[#8B9DB8] text-[12px]">12.4K queries/min • 120ms avg</p>
          </div>

          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">WebSocket</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00F260] animate-pulse"></span>
              <span className="text-[#00F260] font-bold text-[13px]">CONNECTED</span>
            </div>
            <p className="text-[#8B9DB8] text-[12px]">342 active connections</p>
          </div>

          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Uptime</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00F260]"></span>
              <span className="text-[#00F260] font-bold text-[13px]">99.98%</span>
            </div>
            <p className="text-[#8B9DB8] text-[12px]">23 days, 4 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}

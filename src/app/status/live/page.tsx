'use client';
import { useState, useEffect } from 'react';

interface SprintStatus {
  timestamp: string;
  orchestrator_status: string;
  sprint: {
    name: string;
    progress_percent: number;
    total_tickets: number;
    completed: number;
    in_progress: number;
  };
  active_tickets: Array<{
    id: string;
    title: string;
    status: string;
    owner: string;
    percent_complete: number;
    eta_hours: number;
    tests_passing: number;
    tests_total: number;
    notes: string;
  }>;
  deployment: {
    pages_live: number;
    api_endpoints: number;
  };
  recent_events: Array<{
    timestamp: string;
    event: string;
    owner: string;
    status: string;
  }>;
  risks: Array<{
    severity: string;
    issue: string;
    mitigation: string;
  }>;
}

export default function LiveStatusPage() {
  const [status, setStatus] = useState<SprintStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/sprint-status.json');
        const data = await response.json();
        setStatus(data);
        setLastUpdate(new Date());
      } catch (err) {
        console.error('Error fetching status:', err);
      }
    };

    fetchStatus();
    
    // Auto-refresh every 5 seconds for live feel
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !status) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F260] mb-4"></div>
          <p className="text-white">Loading live status...</p>
        </div>
      </div>
    );
  }

  const statusColor = status.orchestrator_status === 'EXECUTING_PHASE_2' ? 'text-[#00F260]' : 'text-[#FFB800]';

  return (
    <div className="min-h-screen bg-[#0C0F14] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-white text-[48px] font-bold">🚀 Court Hero Build Status</h1>
            <div className="text-right">
              <div className={`text-[24px] font-bold ${statusColor}`}>
                {status.orchestrator_status}
              </div>
              <p className="text-[#8B9DB8] text-[13px]">
                Updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <p className="text-[#8B9DB8] text-[12px] font-bold mb-2">SPRINT PROGRESS</p>
            <p className="text-[#00F260] text-[40px] font-bold">{status.sprint.progress_percent}%</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <p className="text-[#8B9DB8] text-[12px] font-bold mb-2">TICKETS COMPLETE</p>
            <p className="text-white text-[40px] font-bold">{status.sprint.completed}/{status.sprint.total_tickets}</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <p className="text-[#8B9DB8] text-[12px] font-bold mb-2">IN PROGRESS</p>
            <p className="text-[#FFB800] text-[40px] font-bold">{status.sprint.in_progress}</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <p className="text-[#8B9DB8] text-[12px] font-bold mb-2">PAGES LIVE</p>
            <p className="text-white text-[40px] font-bold">{status.deployment.pages_live}</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <p className="text-[#8B9DB8] text-[12px] font-bold mb-2">API ENDPOINTS</p>
            <p className="text-white text-[40px] font-bold">{status.deployment.api_endpoints}</p>
          </div>
        </div>

        {/* Active Tickets */}
        <div className="mb-12">
          <h2 className="text-white text-[24px] font-bold mb-6">Active Tickets</h2>
          <div className="space-y-4">
            {status.active_tickets.map((ticket) => (
              <div key={ticket.id} className="bg-[#111827]/40 border border-white/[0.06] rounded-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-bold text-[16px]">{ticket.id}: {ticket.title}</p>
                    <p className="text-[#8B9DB8] text-[13px] mt-1">{ticket.owner} • ETA {ticket.eta_hours}h</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                    ticket.status === 'IN_PROGRESS' ? 'bg-[#FFB800]/10 text-[#FFB800]' :
                    ticket.status === 'BLOCKED_WAITING_BACKEND' ? 'bg-blue-500/10 text-blue-400' :
                    ticket.status === 'QUEUED' ? 'bg-[#8B9DB8]/10 text-[#8B9DB8]' :
                    'bg-[#00F260]/10 text-[#00F260]'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8B9DB8] text-[12px]">Progress</span>
                    <span className="text-white font-bold text-[12px]">{ticket.percent_complete}%</span>
                  </div>
                  <div className="w-full bg-[#0A0D12] rounded-full h-2">
                    <div
                      className="bg-[#00F260] h-2 rounded-full transition-all"
                      style={{ width: `${ticket.percent_complete}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tests */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#8B9DB8] text-[12px]">Tests:</span>
                  <span className="text-[#00F260] font-bold text-[12px]">{ticket.tests_passing}/{ticket.tests_total} passing</span>
                </div>

                {/* Notes */}
                <p className="text-[#8B9DB8] text-[12px]">{ticket.notes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-white text-[18px] font-bold mb-4">Recent Events</h2>
            <div className="space-y-3">
              {status.recent_events.slice(0, 5).map((event, idx) => (
                <div key={idx} className="bg-[#111827]/40 border border-white/[0.06] rounded-lg p-4">
                  <p className="text-white text-[13px] font-bold">{event.event}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[#8B9DB8] text-[11px]">{event.owner}</span>
                    <span className="text-[#64748B] text-[11px]">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risks */}
          <div>
            <h2 className="text-white text-[18px] font-bold mb-4">Risks & Blockers</h2>
            <div className="space-y-3">
              {status.risks.length === 0 ? (
                <div className="bg-[#00F260]/10 border border-[#00F260]/20 rounded-lg p-4">
                  <p className="text-[#00F260] font-bold">✓ No blockers</p>
                </div>
              ) : (
                status.risks.map((risk, idx) => (
                  <div key={idx} className="bg-[#111827]/40 border border-white/[0.06] rounded-lg p-4">
                    <p className="text-white text-[13px] font-bold">{risk.severity}: {risk.issue}</p>
                    <p className="text-[#8B9DB8] text-[12px] mt-2">Mitigation: {risk.mitigation}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Auto-refresh notice */}
        <div className="text-center">
          <p className="text-[#64748B] text-[12px]">
            ✓ Updates every 5 minutes • Last sync: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

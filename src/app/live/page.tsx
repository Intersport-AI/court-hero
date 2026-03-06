'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';

interface Activity {
  timestamp: string;
  task: string;
  type: 'feature' | 'build' | 'deploy' | 'error' | 'milestone';
  status: 'complete' | 'in-progress' | 'failed';
}

const TYPE_COLORS = {
  feature: { bg: 'bg-[#00F260]/10', text: 'text-[#00F260]', icon: '✨' },
  build: { bg: 'bg-[#0AE87F]/10', text: 'text-[#0AE87F]', icon: '🔨' },
  deploy: { bg: 'bg-[#FFB800]/10', text: 'text-[#FFB800]', icon: '🚀' },
  error: { bg: 'bg-red-500/10', text: 'text-red-400', icon: '⚠️' },
  milestone: { bg: 'bg-[#00F260]/10', text: 'text-[#00F260]', icon: '🎯' },
};

export default function LivePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/activity.jsonl');
        const text = await response.text();
        const lines = text.trim().split('\n').filter(l => l);
        const parsed = lines.map(line => JSON.parse(line)) as Activity[];
        setActivities(parsed.reverse()); // Most recent first
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Poll for new activities every 10 seconds
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0F14]">
        <Header />
        <div className="max-w-4xl mx-auto pt-32 px-6 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F260]"></div>
          <p className="text-[#8B9DB8] mt-4">Loading live activity feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-4xl mx-auto pt-8 px-6 pb-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-white text-[40px] font-bold">Live Activity</h1>
            <p className="text-[#8B9DB8] mt-1">Real-time build progress</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#00F260] animate-pulse"></span>
            <span className="text-[#00F260] font-bold text-[13px]">LIVE</span>
          </div>
        </div>

        {/* Auto-scroll toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              autoScroll
                ? 'bg-[#00F260]/20 text-[#00F260] border border-[#00F260]/30'
                : 'bg-white/[0.05] text-[#8B9DB8] border border-white/[0.06]'
            }`}>
            {autoScroll ? '📌 Auto-scroll ON' : '📌 Auto-scroll OFF'}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-[13px] font-medium bg-white/[0.05] text-[#8B9DB8] border border-white/[0.06] hover:bg-white/[0.08] transition-all">
            🔄 Refresh
          </button>
        </div>

        {/* Activity Feed */}
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-12 text-center">
              <p className="text-[#8B9DB8]">No activity yet. Check back soon!</p>
            </div>
          ) : (
            activities.map((activity, idx) => {
              const colors = TYPE_COLORS[activity.type];
              const time = new Date(activity.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={idx}
                  className={`rounded-xl p-4 border transition-all ${
                    activity.status === 'in-progress'
                      ? `${colors.bg} border-current animate-pulse`
                      : `bg-[#111827]/40 border-white/[0.06]`
                  }`}>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`text-[20px] mt-0.5 flex-shrink-0 ${colors.text}`}>
                      {activity.status === 'in-progress' ? (
                        <span className="inline-block animate-spin">⚙️</span>
                      ) : activity.status === 'failed' ? (
                        '❌'
                      ) : (
                        colors.icon
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-bold text-[15px]">{activity.task}</p>
                        <span
                          className={`text-[11px] font-bold px-2 py-1 rounded whitespace-nowrap ${colors.bg} ${colors.text}`}>
                          {activity.type}
                        </span>
                        {activity.status === 'in-progress' && (
                          <span className="text-[11px] font-bold px-2 py-1 rounded bg-[#FFB800]/10 text-[#FFB800]">
                            WORKING...
                          </span>
                        )}
                        {activity.status === 'complete' && (
                          <span className="text-[11px] font-bold px-2 py-1 rounded bg-[#00F260]/10 text-[#00F260]">
                            ✓ DONE
                          </span>
                        )}
                      </div>
                      <p className="text-[#64748B] text-[12px]">{time}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-[#111827]/40 border border-white/[0.06] rounded-xl p-4">
          <p className="text-[#8B9DB8] text-[13px]">
            📊 <strong>Live Activity:</strong> This feed updates as I work. Refresh or keep it open - new activities appear every few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

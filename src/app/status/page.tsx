'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';

interface StatusData {
  lastUpdate: string;
  sessionStart: string;
  elapsed: string;
  status: string;
  currentTask: string;
  progress: {
    phase: string;
    percentComplete: number;
    items: string[];
  };
  metrics: {
    apiEndpoints: number;
    databaseTables: number;
    frontendPages: number;
    componentsBuilt: number;
    linesOfCode: number;
    deployments: number;
    buildErrorsFixed: number;
  };
  recentCommits: Array<{ time: string; message: string }>;
  pages: Array<{ route: string; status: string; wired: string; timestamp: string }>;
  deploymentHistory: Array<{ time: string; pages: number; status: string }>;
  nextTasks: string[];
  uptime: string;
  buildHealth: string;
  deployment: {
    url: string;
    status: string;
    lastDeploy: string;
  };
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/status.json');
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#0C0F14]">
        <Header />
        <div className="max-w-7xl mx-auto pt-32 px-6 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F260]"></div>
          <p className="text-[#8B9DB8] mt-4">Loading live status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-7xl mx-auto pt-8 px-6 pb-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-white text-[40px] font-bold">Build Status</h1>
            <p className="text-[#8B9DB8] mt-1">Real-time progress monitoring</p>
          </div>
          <div className="text-right">
            <div className="inline-block bg-[#00F260]/10 text-[#00F260] px-4 py-2 rounded-full font-bold text-[14px] mb-2">
              {data.status}
            </div>
            <p className="text-[#8B9DB8] text-[13px]">
              Last update: {new Date(data.lastUpdate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'API Endpoints', value: data.metrics.apiEndpoints },
            { label: 'Frontend Pages', value: data.metrics.frontendPages },
            { label: 'Lines of Code', value: data.metrics.linesOfCode.toLocaleString() },
            { label: 'Deployments', value: data.metrics.deployments },
          ].map((metric, idx) => (
            <div key={idx} className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-4">
              <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">{metric.label}</p>
              <p className="text-[#00F260] text-[28px] font-bold">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Current Task */}
        <div className="bg-[#111827]/40 border border-[#00F260]/20 rounded-2xl p-6 mb-8">
          <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">CURRENT TASK</p>
          <p className="text-white text-[18px] font-bold">{data.currentTask}</p>
          <p className="text-[#8B9DB8] text-[13px] mt-3">⏱️ {data.elapsed} elapsed • {data.progress.percentComplete}% complete</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Commits */}
          <div className="lg:col-span-2">
            <h2 className="text-white text-[18px] font-bold mb-4">Recent Commits</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {data.recentCommits.map((commit, idx) => (
                <div key={idx} className="bg-[#111827]/40 border border-white/[0.06] rounded-xl p-4 flex items-start gap-4">
                  <span className="text-[#00F260] font-bold text-[12px] whitespace-nowrap">{commit.time}</span>
                  <span className="text-[#B8C4D4] text-[14px]">{commit.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment Status */}
          <div>
            <h2 className="text-white text-[18px] font-bold mb-4">Deployment</h2>
            <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-[#00F260] animate-pulse"></span>
                <span className="text-white font-bold">LIVE</span>
              </div>
              <p className="text-[#8B9DB8] text-[12px] mb-3">URL</p>
              <a href={data.deployment.url} target="_blank" rel="noopener noreferrer"
                className="text-[#00F260] text-[13px] font-medium hover:underline block mb-6">
                {data.deployment.url}
              </a>
              <p className="text-[#8B9DB8] text-[12px] mb-1">Last Deploy</p>
              <p className="text-white font-bold">{data.deployment.lastDeploy}</p>
            </div>

            <h3 className="text-white text-[14px] font-bold mb-2">Health</h3>
            <div className="bg-[#00F260]/10 border border-[#00F260]/20 rounded-xl p-4">
              <p className="text-[#00F260] font-bold">{data.buildHealth}</p>
              <p className="text-[#8B9DB8] text-[12px] mt-2">Uptime: {data.uptime}</p>
            </div>
          </div>
        </div>

        {/* Pages Built */}
        <div className="mt-8">
          <h2 className="text-white text-[18px] font-bold mb-4">Pages Built</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.pages.map((page, idx) => (
              <div key={idx} className="bg-[#111827]/40 border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <code className="text-[#00F260] text-[13px] font-medium">{page.route}</code>
                  <span className="text-[11px] text-[#8B9DB8]">{page.timestamp}</span>
                </div>
                <div className="flex gap-2">
                  <span className={`text-[11px] font-bold px-2 py-1 rounded ${
                    page.status.includes('LIVE') 
                      ? 'bg-[#00F260]/10 text-[#00F260]' 
                      : 'bg-[#FFB800]/10 text-[#FFB800]'
                  }`}>
                    {page.status}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded ${
                    page.wired.includes('✅') 
                      ? 'bg-[#0AE87F]/10 text-[#0AE87F]' 
                      : 'bg-[#FFB800]/10 text-[#FFB800]'
                  }`}>
                    API {page.wired}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Items */}
        <div className="mt-8">
          <h2 className="text-white text-[18px] font-bold mb-4">Progress</h2>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[#8B9DB8] font-medium">{data.progress.phase}</p>
                <p className="text-[#00F260] font-bold">{data.progress.percentComplete}%</p>
              </div>
              <div className="w-full bg-[#0A0D12] rounded-full h-2">
                <div
                  className="bg-[#00F260] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data.progress.percentComplete}%` }}
                />
              </div>
            </div>

            <ul className="space-y-2">
              {data.progress.items.map((item, idx) => (
                <li key={idx} className="text-[#B8C4D4] text-[13px] flex items-start gap-3">
                  <span className="font-bold mt-0.5 whitespace-nowrap">
                    {item.startsWith('✅') ? '✅' : item.startsWith('🔄') ? '🔄' : '⏳'}
                  </span>
                  {item.substring(3)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Next Tasks */}
        <div className="mt-8">
          <h2 className="text-white text-[18px] font-bold mb-4">Next Tasks (Queued)</h2>
          <div className="space-y-2">
            {data.nextTasks.map((task, idx) => (
              <div key={idx} className="bg-[#111827]/40 border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
                <span className="text-[#FFB800] font-bold">⏳</span>
                <span className="text-[#B8C4D4]">{task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-refresh notice */}
        <div className="mt-8 text-center">
          <p className="text-[#64748B] text-[12px]">
            ✓ Auto-refreshes every 30 seconds • Built with real-time monitoring
          </p>
        </div>
      </div>
    </div>
  );
}

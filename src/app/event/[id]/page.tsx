'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { getEvent, updateEvent, generateBrackets, scheduleMatches } from '@/lib/api-client';

export default function EventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { orgId } = useAuth();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!orgId) return;
    
    const load = async () => {
      try {
        const data = await getEvent(orgId, eventId);
        if (data.success) {
          setEvent(data.event);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orgId, eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0F14]">
        <Header />
        <div className="max-w-7xl mx-auto pt-32 px-6 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F260]"></div>
          <p className="text-[#8B9DB8] mt-4">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0C0F14]">
        <Header />
        <div className="max-w-7xl mx-auto pt-32 px-6 text-center">
          <h2 className="text-white text-[24px] font-bold mb-4">Event not found</h2>
          <button onClick={() => router.push('/dashboard')}
            className="text-[#00F260] hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-7xl mx-auto pt-12 px-6 pb-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-white text-[40px] font-bold">{event.name}</h1>
          <p className="text-[#8B9DB8] text-[16px] mt-2">
            {new Date(event.start_date).toLocaleDateString()} • Status: <span className="text-[#00F260] font-medium">{event.status}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-8">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/[0.06] mb-8">
          {['overview', 'divisions', 'schedule', 'results'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-4 font-medium transition-all ${
                activeTab === tab
                  ? 'text-[#00F260] border-b-2 border-[#00F260]'
                  : 'text-[#8B9DB8] hover:text-white'
              }`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8">
                <h3 className="text-white text-[20px] font-bold mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={async () => {
                    setLoading(true);
                    try {
                      await generateBrackets(orgId!, eventId);
                      const data = await getEvent(orgId!, eventId);
                      if (data.success) setEvent(data.event);
                    } catch (err) {
                      setError('Failed to generate brackets');
                    }
                    setLoading(false);
                  }}
                    className="bg-[#00F260]/10 text-[#00F260] px-6 py-4 rounded-xl font-bold hover:bg-[#00F260]/20 transition-all">
                    Generate Brackets
                  </button>
                  <button onClick={async () => {
                    setLoading(true);
                    try {
                      await scheduleMatches(orgId!, eventId, {
                        start_time: event.start_date,
                        end_time: event.end_date,
                      });
                      const data = await getEvent(orgId!, eventId);
                      if (data.success) setEvent(data.event);
                    } catch (err) {
                      setError('Failed to schedule matches');
                    }
                    setLoading(false);
                  }}
                    className="bg-[#00F260]/10 text-[#00F260] px-6 py-4 rounded-xl font-bold hover:bg-[#00F260]/20 transition-all">
                    Schedule Matches
                  </button>
                  <button
                    className="bg-[#FFB800]/10 text-[#FFB800] px-6 py-4 rounded-xl font-bold hover:bg-[#FFB800]/20 transition-all">
                    Manage Players
                  </button>
                  <button onClick={() => router.push(`/event/${eventId}/play`)}
                    className="bg-[#0AE87F]/10 text-[#0AE87F] px-6 py-4 rounded-xl font-bold hover:bg-[#0AE87F]/20 transition-all">
                    Live Scoring
                  </button>
                </div>
              </div>

              <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8">
                <h3 className="text-white text-[20px] font-bold mb-4">Event Info</h3>
                <div className="space-y-3 text-[#8B9DB8]">
                  <p><strong className="text-white">Format:</strong> {event.format}</p>
                  <p><strong className="text-white">Courts:</strong> {event.courts}</p>
                  <p><strong className="text-white">Start:</strong> {new Date(event.start_date).toLocaleString()}</p>
                  <p><strong className="text-white">End:</strong> {new Date(event.end_date).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 h-fit">
              <h3 className="text-white text-[18px] font-bold mb-6">Stats</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-[#00F260] text-[32px] font-bold">0</div>
                  <p className="text-[#8B9DB8] text-[14px]">Players Registered</p>
                </div>
                <div className="text-center">
                  <div className="text-[#FFB800] text-[32px] font-bold">0</div>
                  <p className="text-[#8B9DB8] text-[14px]">Matches Scheduled</p>
                </div>
                <div className="text-center">
                  <div className="text-[#0AE87F] text-[32px] font-bold">0</div>
                  <p className="text-[#8B9DB8] text-[14px]">Completed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Divisions Tab */}
        {activeTab === 'divisions' && (
          <div className="text-[#8B9DB8] text-center py-12">
            <p>Division management coming soon</p>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="text-[#8B9DB8] text-center py-12">
            <p>Match schedule coming soon</p>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="text-[#8B9DB8] text-center py-12">
            <p>Results and leaderboard coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}

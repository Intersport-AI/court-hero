'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { listEvents } from '@/lib/api-client';

interface Event {
  id: string;
  name: string;
  start_date: string;
  status: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, orgId, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !orgId) {
      router.push('/login');
      return;
    }

    const loadEvents = async () => {
      try {
        const data = await listEvents(orgId);
        if (data.success) {
          setEvents(data.events || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [authLoading, user, orgId, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0C0F14]">
        <Header />
        <div className="max-w-7xl mx-auto pt-32 px-6 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F260]"></div>
          <p className="text-[#8B9DB8] mt-4">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-7xl mx-auto pt-12 px-6 pb-12">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1 className="text-white text-[48px] font-bold tracking-tight">
              Events
            </h1>
            <p className="text-[#8B9DB8] text-[16px] mt-2">
              {user?.org_id ? `Manage tournaments for ${user?.first_name || 'your organization'}` : 'Create and manage your tournaments'}
            </p>
          </div>
          <Link href="/create"
            className="bg-[#00F260] text-black px-8 py-4 rounded-2xl font-bold text-[16px] hover:bg-[#00D954] transition-all duration-200 shadow-[0_0_40px_rgba(0,242,96,0.15)]">
            + New Event
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-3xl p-16 text-center">
            <div className="text-[64px] mb-4">🏓</div>
            <h2 className="text-white text-[24px] font-bold mb-2">No events yet</h2>
            <p className="text-[#8B9DB8] mb-8 max-w-md mx-auto">
              Create your first tournament to get started. It takes less than 2 minutes.
            </p>
            <Link href="/create"
              className="inline-block bg-[#00F260] text-black px-8 py-4 rounded-2xl font-bold hover:bg-[#00D954] transition-all">
              Create First Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.id} href={`/event/${event.id}`}
                className="group bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6 hover:border-[#00F260]/20 hover:bg-[#111827]/60 transition-all duration-200 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white text-[18px] font-bold group-hover:text-[#00F260] transition-colors">
                      {event.name}
                    </h3>
                    <p className="text-[#8B9DB8] text-[14px] mt-1">
                      {new Date(event.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[12px] font-semibold ${
                    event.status === 'active' ? 'bg-[#00F260]/10 text-[#00F260]' :
                    event.status === 'completed' ? 'bg-[#8B9DB8]/10 text-[#8B9DB8]' :
                    'bg-white/[0.05] text-[#B8C4D4]'
                  }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center text-[#00F260] text-[14px] font-medium group-hover:translate-x-1 transition-transform">
                  View Event → 
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface Event {
  id: string;
  name: string;
  city: string;
  startDate: string;
  distance: number;
  playerCount: number;
  format: string;
  price: number;
}

export default function SearchPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [format, setFormat] = useState('');
  const [distance, setDistance] = useState('50');
  const [skillLevel, setSkillLevel] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      const mockEvents: Event[] = [
        { id: '1', name: 'Summer Championship 2026', city: 'Chicago, IL', startDate: 'Mar 1', distance: 3.2, playerCount: 64, format: 'Double Elimination', price: 45 },
        { id: '2', name: 'Downtown Open Cup', city: 'Chicago, IL', startDate: 'Mar 2', distance: 5.1, playerCount: 32, format: 'Round Robin', price: 35 },
        { id: '3', name: 'Midwest Championship', city: 'Evanston, IL', startDate: 'Mar 8', distance: 15.4, playerCount: 128, format: 'Single Elimination', price: 55 },
        { id: '4', name: 'Ladies Open', city: 'Oak Park, IL', startDate: 'Mar 5', distance: 12.8, playerCount: 24, format: 'Round Robin', price: 30 },
      ];
      
      setTimeout(() => {
        setEvents(mockEvents);
        setLoading(false);
      }, 300);
    };

    loadEvents();
  }, [location, format, distance, skillLevel]);

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-6xl mx-auto pt-8 px-6 pb-12">
        <h1 className="text-white text-[40px] font-bold mb-2">Find Tournaments</h1>
        <p className="text-[#8B9DB8] mb-8">Discover pickleball events happening near you</p>

        {/* Filters */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[#B8C4D4] text-[12px] font-medium block mb-2">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="Chicago, IL"
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-lg px-3 py-2 text-white outline-none focus:border-[#00F260]/40 text-[13px]" />
            </div>

            <div>
              <label className="text-[#B8C4D4] text-[12px] font-medium block mb-2">Distance</label>
              <select value={distance} onChange={(e) => setDistance(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-lg px-3 py-2 text-white outline-none text-[13px]">
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
                <option value="100">Within 100 miles</option>
              </select>
            </div>

            <div>
              <label className="text-[#B8C4D4] text-[12px] font-medium block mb-2">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-lg px-3 py-2 text-white outline-none text-[13px]">
                <option value="">All Formats</option>
                <option value="round-robin">Round Robin</option>
                <option value="single-elim">Single Elimination</option>
                <option value="double-elim">Double Elimination</option>
              </select>
            </div>

            <div>
              <label className="text-[#B8C4D4] text-[12px] font-medium block mb-2">Skill Level</label>
              <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-lg px-3 py-2 text-white outline-none text-[13px]">
                <option value="">All Levels</option>
                <option value="beginner">Beginner (1-2)</option>
                <option value="intermediate">Intermediate (3-4)</option>
                <option value="advanced">Advanced (5+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F260]"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-16 text-center">
            <p className="text-[#8B9DB8]">No tournaments found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Link key={event.id} href={`/event/${event.id}/play`}
                className="block p-6 bg-[#111827]/40 border border-white/[0.06] rounded-2xl hover:border-[#00F260]/20 hover:bg-[#111827]/60 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white text-[18px] font-bold mb-2">{event.name}</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-[#8B9DB8] text-[13px]">📍 {event.city}</span>
                      <span className="text-[#8B9DB8] text-[13px]">📏 {event.distance} miles</span>
                      <span className="text-[#8B9DB8] text-[13px]">👥 {event.playerCount} players</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-[#00F260]/10 text-[#00F260] text-[12px] font-bold">
                        {event.format}
                      </span>
                      <span className="text-[#FFB800] text-[13px] font-bold">${event.price}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-white font-bold mb-2">{event.startDate}</p>
                    <button className="bg-[#00F260] text-black px-6 py-2 rounded-lg font-bold text-[13px] hover:bg-[#00D954] transition-all">
                      Register
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  venue: string;
  location: { lat: number; lng: number };
  date: string;
  registrations: number;
  capacity: number;
  skillLevel: string;
  format: string;
  image?: string;
}

export default function DiscoverEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState({
    skillLevel: 'all',
    format: 'all',
    dateRange: 'upcoming',
    search: '',
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'date' | 'availability'>('date');

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch('/api/public/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    loadEvents();
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  // Calculate distance
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Apply filters
  useEffect(() => {
    let results = events;

    // Skill level filter
    if (filters.skillLevel !== 'all') {
      results = results.filter((e) => e.skillLevel === filters.skillLevel);
    }

    // Format filter
    if (filters.format !== 'all') {
      results = results.filter((e) => e.format === filters.format);
    }

    // Date range filter
    const today = new Date();
    if (filters.dateRange === 'upcoming') {
      results = results.filter((e) => new Date(e.date) >= today);
    } else if (filters.dateRange === 'this-week') {
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      results = results.filter((e) => {
        const eDate = new Date(e.date);
        return eDate >= today && eDate <= nextWeek;
      });
    }

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      results = results.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.venue.toLowerCase().includes(query) ||
          e.location.toString().includes(query)
      );
    }

    // Sort
    if (sortBy === 'distance' && userLocation) {
      results.sort((a, b) => {
        const distA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.location.lat,
          a.location.lng
        );
        const distB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.location.lat,
          b.location.lng
        );
        return distA - distB;
      });
    } else if (sortBy === 'date') {
      results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'availability') {
      results.sort((a, b) => (b.capacity - b.registrations) - (a.capacity - a.registrations));
    }

    setFilteredEvents(results);
  }, [events, filters, sortBy, userLocation, calculateDistance]);

  return (
    <div className="bg-[#0C0F14] text-white min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#FFB800] mb-2">Discover Events</h1>
          <p className="text-[#B8C4D4]">Find and join pickleball tournaments near you</p>
        </div>

        {/* Filters */}
        <div className="bg-[#1A1F2E] p-6 rounded-lg border border-[#00F260]/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search events, venues..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 bg-[#0C0F14] border border-[#00F260]/20 rounded text-white placeholder-[#B8C4D4] focus:border-[#00F260] focus:outline-none"
            />

            {/* Skill Level */}
            <select
              value={filters.skillLevel}
              onChange={(e) => setFilters({ ...filters, skillLevel: e.target.value })}
              className="px-4 py-2 bg-[#0C0F14] border border-[#00F260]/20 rounded text-white focus:border-[#00F260] focus:outline-none"
            >
              <option value="all">All Skill Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="pro">Pro</option>
            </select>

            {/* Format */}
            <select
              value={filters.format}
              onChange={(e) => setFilters({ ...filters, format: e.target.value })}
              className="px-4 py-2 bg-[#0C0F14] border border-[#00F260]/20 rounded text-white focus:border-[#00F260] focus:outline-none"
            >
              <option value="all">All Formats</option>
              <option value="round-robin">Round Robin</option>
              <option value="single-elim">Single Elimination</option>
              <option value="double-elim">Double Elimination</option>
              <option value="mixer">Mixer/Social</option>
            </select>

            {/* Date Range */}
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="px-4 py-2 bg-[#0C0F14] border border-[#00F260]/20 rounded text-white focus:border-[#00F260] focus:outline-none"
            >
              <option value="upcoming">Upcoming</option>
              <option value="this-week">This Week</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex gap-4 items-center">
            <span className="text-sm text-[#B8C4D4]">Sort by:</span>
            {userLocation && (
              <button
                onClick={() => setSortBy('distance')}
                className={`px-3 py-1 rounded text-sm transition ${
                  sortBy === 'distance'
                    ? 'bg-[#00F260] text-[#0C0F14]'
                    : 'bg-[#0C0F14] border border-[#00F260]/20 text-white hover:border-[#00F260]'
                }`}
              >
                📍 Distance
              </button>
            )}
            <button
              onClick={() => setSortBy('date')}
              className={`px-3 py-1 rounded text-sm transition ${
                sortBy === 'date'
                  ? 'bg-[#00F260] text-[#0C0F14]'
                  : 'bg-[#0C0F14] border border-[#00F260]/20 text-white hover:border-[#00F260]'
              }`}
            >
              📅 Date
            </button>
            <button
              onClick={() => setSortBy('availability')}
              className={`px-3 py-1 rounded text-sm transition ${
                sortBy === 'availability'
                  ? 'bg-[#00F260] text-[#0C0F14]'
                  : 'bg-[#0C0F14] border border-[#00F260]/20 text-white hover:border-[#00F260]'
              }`}
            >
              📊 Availability
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const distance = userLocation
                ? calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    event.location.lat,
                    event.location.lng
                  )
                : null;
              const spotsLeft = event.capacity - event.registrations;
              const eventDate = new Date(event.date);

              return (
                <Link key={event.id} href={`/event/${event.id}`}>
                  <div className="bg-[#1A1F2E] rounded-lg overflow-hidden border border-[#00F260]/10 hover:border-[#00F260]/50 transition cursor-pointer h-full flex flex-col">
                    {/* Image */}
                    {event.image && (
                      <div className="h-40 bg-gradient-to-br from-[#00F260] to-[#FFB800] flex items-center justify-center">
                        <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold mb-2">{event.name}</h3>
                      <p className="text-sm text-[#B8C4D4] mb-3">{event.venue}</p>

                      {/* Details */}
                      <div className="space-y-2 mb-4 text-sm text-[#B8C4D4]">
                        <div>📅 {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div>🎯 {event.skillLevel} • {event.format}</div>
                        {distance && <div>📍 {distance.toFixed(1)} miles away</div>}
                      </div>

                      {/* Availability */}
                      <div className="mt-auto pt-4 border-t border-[#00F260]/10">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#B8C4D4]">
                            {spotsLeft} / {event.capacity} spots
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              spotsLeft > 0
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {spotsLeft > 0 ? 'Available' : 'Full'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-xl text-[#B8C4D4] mb-2">No events found</div>
            <p className="text-[#B8C4D4]">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/public/events/search
 * Search for public events (no auth required)
 * Query params: location, latitude, longitude, radius_miles, date_from, date_to, skill_level, format
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radiusMiles = parseFloat(searchParams.get('radius_miles') || '50');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const skillLevel = searchParams.get('skill_level');
    const format = searchParams.get('format');

    // Validate Supabase connection
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Database configuration error', events: [] },
        { status: 200 }
      );
    }

    let query = supabase
      .from('events')
      .select(
        `*,
        divisions(id, name, format, skill_min, skill_max),
        venues(id, name, address, city, state, latitude, longitude)`
      )
      .eq('status', 'setup')
      .order('start_date', { ascending: true });

    // Date filtering
    if (dateFrom) {
      query = query.gte('start_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('end_date', dateTo);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Event search error:', error);
      // Return empty array instead of error for graceful degradation
      return NextResponse.json({ success: true, events: [] }, { status: 200 });
    }

    if (!events) {
      return NextResponse.json({ success: true, events: [] });
    }

    // Client-side filtering for complex queries
    let filtered = events;

    // Location-based filtering (Haversine distance)
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);

      filtered = filtered.filter((event: any) => {
        if (!event.venues || event.venues.length === 0) return false;

        return event.venues.some((venue: any) => {
          if (!venue.latitude || !venue.longitude) return false;

          const distance = haversineDistance(
            userLat,
            userLon,
            parseFloat(venue.latitude),
            parseFloat(venue.longitude)
          );

          return distance <= radiusMiles;
        });
      });
    }

    // Format filtering
    if (format) {
      filtered = filtered.filter((event: any) =>
        event.divisions.some((d: any) => d.format === format)
      );
    }

    // Skill level filtering
    if (skillLevel) {
      const skillNum = parseFloat(skillLevel);
      filtered = filtered.filter((event: any) =>
        event.divisions.some(
          (d: any) =>
            (!d.skill_min || skillNum >= d.skill_min) &&
            (!d.skill_max || skillNum <= d.skill_max)
        )
      );
    }

    return NextResponse.json(
      { success: true, events: filtered },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

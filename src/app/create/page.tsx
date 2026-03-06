'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { createEvent, createVenue, createCourt, createDivision } from '@/lib/api-client';

const FORMATS = [
  { id: 'round-robin', name: 'Round Robin', desc: 'Everyone plays everyone' },
  { id: 'single-elim', name: 'Single Elimination', desc: 'One loss and you\'re out' },
  { id: 'double-elim', name: 'Double Elimination', desc: 'Two chances to win' },
  { id: 'pool-play', name: 'Pool Play', desc: 'Pools → Finals' },
];

interface Division {
  name: string;
  format: string;
}

interface Court {
  name: string;
  venueId: string;
}

interface Venue {
  name: string;
  city: string;
}

export default function Create() {
  const router = useRouter();
  const { user, orgId } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Event Info
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timezone, setTimezone] = useState('America/Chicago');

  // Step 2: Venues & Courts
  const [venues, setVenues] = useState<Venue[]>([{ name: '', city: '' }]);
  const [courts, setCourts] = useState<Court[]>([{ name: 'Court 1', venueId: '0' }]);

  // Step 3: Divisions
  const [divisions, setDivisions] = useState<Division[]>([{ name: 'Open', format: 'round-robin' }]);

  const handleCreateEvent = async () => {
    if (!user || !orgId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Create event
      const eventData = await createEvent(orgId, {
        name: eventName,
        start_date: startDate,
        end_date: endDate,
        timezone,
      });

      if (!eventData.success) {
        setError(eventData.error || 'Failed to create event');
        setLoading(false);
        return;
      }

      const eventId = eventData.event.id;

      // Create venues and courts
      const venueMap: Record<number, string> = {};
      for (let i = 0; i < venues.length; i++) {
        const v = venues[i];
        const venueData = await createVenue(orgId, eventId, {
          name: v.name,
          city: v.city,
          country: 'USA',
        });
        if (venueData.success) {
          venueMap[i] = venueData.venue.id;
        }
      }

      for (const court of courts) {
        const venueId = venueMap[parseInt(court.venueId)];
        if (venueId) {
          await createCourt(orgId, eventId, venueId, {
            name: court.name,
            surface_type: 'outdoor',
          });
        }
      }

      // Create divisions
      for (const div of divisions) {
        await createDivision(orgId, eventId, {
          name: div.name,
          format: div.format,
          pricing_base_cents: 1900,
        });
      }

      router.push(`/event/${eventId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-2xl mx-auto pt-12 px-6 pb-12">
        <h1 className="text-white text-[40px] font-bold mb-2">Create New Event</h1>
        <p className="text-[#8B9DB8] mb-12">Step {step} of 3</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Event Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="text-[#B8C4D4] text-[14px] font-medium block mb-2">Event Name</label>
              <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white focus:border-[#00F260]/40 outline-none transition-all text-[15px]"
                placeholder="Summer Pickleball Tournament 2026" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#B8C4D4] text-[14px] font-medium block mb-2">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white focus:border-[#00F260]/40 outline-none transition-all text-[15px]" />
              </div>
              <div>
                <label className="text-[#B8C4D4] text-[14px] font-medium block mb-2">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white focus:border-[#00F260]/40 outline-none transition-all text-[15px]" />
              </div>
            </div>
            <div>
              <label className="text-[#B8C4D4] text-[14px] font-medium block mb-2">Timezone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white focus:border-[#00F260]/40 outline-none transition-all text-[15px]">
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="America/New_York">Eastern Time</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Venues */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="text-[#B8C4D4] text-[14px] font-medium block mb-4">Venues</label>
              {venues.map((v, i) => (
                <div key={i} className="flex gap-3 mb-3">
                  <input type="text" value={v.name} onChange={(e) => {
                    const newVenues = [...venues];
                    newVenues[i].name = e.target.value;
                    setVenues(newVenues);
                  }}
                    className="flex-1 bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none text-[14px]"
                    placeholder="Venue name (e.g., 'Downtown Courts')" />
                  <input type="text" value={v.city} onChange={(e) => {
                    const newVenues = [...venues];
                    newVenues[i].city = e.target.value;
                    setVenues(newVenues);
                  }}
                    className="w-32 bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none text-[14px]"
                    placeholder="City" />
                </div>
              ))}
              <button onClick={() => setVenues([...venues, { name: '', city: '' }])}
                className="text-[#00F260] text-[14px] font-medium mt-3 hover:underline">
                + Add Venue
              </button>
            </div>

            <div>
              <label className="text-[#B8C4D4] text-[14px] font-medium block mb-4">Courts</label>
              {courts.map((c, i) => (
                <div key={i} className="flex gap-3 mb-3">
                  <input type="text" value={c.name} onChange={(e) => {
                    const newCourts = [...courts];
                    newCourts[i].name = e.target.value;
                    setCourts(newCourts);
                  }}
                    className="flex-1 bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none text-[14px]"
                    placeholder="Court name (e.g., 'Court 1')" />
                  <select value={c.venueId} onChange={(e) => {
                    const newCourts = [...courts];
                    newCourts[i].venueId = e.target.value;
                    setCourts(newCourts);
                  }}
                    className="w-32 bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none text-[14px]">
                    {venues.map((v, idx) => (
                      <option key={idx} value={idx}>{v.name || `Venue ${idx + 1}`}</option>
                    ))}
                  </select>
                </div>
              ))}
              <button onClick={() => setCourts([...courts, { name: `Court ${courts.length + 1}`, venueId: '0' }])}
                className="text-[#00F260] text-[14px] font-medium mt-3 hover:underline">
                + Add Court
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Divisions */}
        {step === 3 && (
          <div className="space-y-6">
            <label className="text-[#B8C4D4] text-[14px] font-medium block">Divisions</label>
            {divisions.map((d, i) => (
              <div key={i} className="flex gap-3 mb-3">
                <input type="text" value={d.name} onChange={(e) => {
                  const newDivs = [...divisions];
                  newDivs[i].name = e.target.value;
                  setDivisions(newDivs);
                }}
                  className="flex-1 bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none text-[14px]"
                  placeholder="Division name (e.g., 'Open', 'Women 35+')" />
                <select value={d.format} onChange={(e) => {
                  const newDivs = [...divisions];
                  newDivs[i].format = e.target.value;
                  setDivisions(newDivs);
                }}
                  className="w-40 bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none text-[14px]">
                  {FORMATS.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            ))}
            <button onClick={() => setDivisions([...divisions, { name: '', format: 'round-robin' }])}
              className="text-[#00F260] text-[14px] font-medium mt-3 hover:underline">
              + Add Division
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-12">
          <button onClick={() => setStep(step - 1)} disabled={step === 1}
            className="flex-1 bg-[#111827] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#1a1f2e] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            Back
          </button>
          <button onClick={() => step === 3 ? handleCreateEvent() : setStep(step + 1)} disabled={loading}
            className="flex-1 bg-[#00F260] text-black px-6 py-4 rounded-2xl font-bold hover:bg-[#00D954] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {loading ? 'Creating...' : step === 3 ? 'Create Event' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

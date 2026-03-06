'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { updateEvent, deleteEvent } from '@/lib/api-client';

export default function EventSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { user, orgId } = useAuth();

  const [eventName, setEventName] = useState('Summer Championship 2026');
  const [eventStatus, setEventStatus] = useState('draft');
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [scoringFormat, setScoringFormat] = useState('first-to-11');
  const [maxPlayersPerEvent, setMaxPlayersPerEvent] = useState('512');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      await updateEvent(orgId, eventId, {
        name: eventName,
        status: eventStatus,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!orgId || !window.confirm('Are you sure? This cannot be undone.')) return;
    setLoading(true);
    try {
      await deleteEvent(orgId, eventId);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-3xl mx-auto pt-8 px-6 pb-12">
        <h1 className="text-white text-[40px] font-bold mb-8">Event Settings</h1>

        {saved && (
          <div className="bg-[#00F260]/10 border border-[#00F260]/20 text-[#00F260] rounded-xl p-4 mb-6">
            ✓ Settings saved successfully
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 mb-6">
          <h2 className="text-white text-[18px] font-bold mb-6">Basic Information</h2>
          <div className="space-y-6">
            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Event Name</label>
              <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none focus:border-[#00F260]/40" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Status</label>
                <select value={eventStatus} onChange={(e) => setEventStatus(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Scoring Format</label>
                <select value={scoringFormat} onChange={(e) => setScoringFormat(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none">
                  <option value="first-to-11">First to 11</option>
                  <option value="first-to-15">First to 15</option>
                  <option value="first-to-21">First to 21</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Max Players Per Event</label>
              <input type="number" value={maxPlayersPerEvent} onChange={(e) => setMaxPlayersPerEvent(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none focus:border-[#00F260]/40" />
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#0A0D12]/50 rounded-xl">
              <input type="checkbox" checked={registrationClosed} onChange={(e) => setRegistrationClosed(e.target.checked)}
                className="w-4 h-4" />
              <label className="text-[#B8C4D4] cursor-pointer">Close registration (players cannot join)</label>
            </div>
          </div>

          <button onClick={handleSave} disabled={loading}
            className="mt-6 w-full bg-[#00F260] text-black py-4 rounded-xl font-bold hover:bg-[#00D954] disabled:opacity-50 transition-all">
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Divisions */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 mb-6">
          <h2 className="text-white text-[18px] font-bold mb-6">Divisions</h2>
          <div className="space-y-3 mb-6">
            {['Open', 'Women 35+', 'Mixed'].map((div, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#0A0D12]/50 rounded-xl">
                <p className="text-white font-medium">{div}</p>
                <button className="text-[#00F260] text-[13px] font-bold hover:text-[#00D954]">Edit</button>
              </div>
            ))}
          </div>
          <button className="w-full border border-[#00F260]/30 text-[#00F260] py-3 rounded-xl font-bold hover:bg-[#00F260]/5 transition-all">
            + Add Division
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
          <h2 className="text-red-400 text-[18px] font-bold mb-4">Danger Zone</h2>
          <p className="text-[#8B9DB8] text-[14px] mb-6">Deleting an event is permanent and cannot be undone.</p>
          <button onClick={handleDelete} disabled={loading}
            className="w-full bg-red-500/10 border border-red-500/30 text-red-400 py-4 rounded-xl font-bold hover:bg-red-500/20 disabled:opacity-50 transition-all">
            Delete Event
          </button>
        </div>
      </div>
    </div>
  );
}

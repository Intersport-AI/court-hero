'use client';
import { useState } from 'react';

interface PlayerFormProps {
  onAdd: (name: string, email: string, rating: number) => void;
  submitLabel?: string;
  showEmail?: boolean;
}

const RATINGS = [2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

export default function PlayerForm({ onAdd, submitLabel = 'Add Player', showEmail = true }: PlayerFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(3.5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), email.trim(), rating);
    setName('');
    setEmail('');
    setRating(3.5);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-[11px] text-[#64748B] mb-2 uppercase tracking-[0.1em] font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Player name"
          className="w-full bg-[#0C0F14] border border-white/[0.08] rounded-xl px-5 py-3.5 text-[15px] text-white placeholder-[#4B5563] focus:border-[#00F260]/50 focus:outline-none transition-colors"
          required
        />
      </div>

      {showEmail && (
        <div>
          <label className="block text-[11px] text-[#64748B] mb-2 uppercase tracking-[0.1em] font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="player@email.com"
            className="w-full bg-[#0C0F14] border border-white/[0.08] rounded-xl px-5 py-3.5 text-[15px] text-white placeholder-[#4B5563] focus:border-[#00F260]/50 focus:outline-none transition-colors"
          />
        </div>
      )}

      <div>
        <label className="block text-[11px] text-[#64748B] mb-2.5 uppercase tracking-[0.1em] font-medium">Skill Rating</label>
        <div className="flex gap-2">
          {RATINGS.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRating(r)}
              className={`flex-1 py-3 rounded-xl text-[13px] font-bold transition-all duration-150 ${
                rating === r
                  ? 'bg-[#00F260] text-black'
                  : 'bg-white/[0.04] text-[#94A3B8] hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              {r.toFixed(1)}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-white/[0.08] text-white py-4 rounded-xl font-bold text-[15px] hover:bg-white/[0.12] transition-all duration-150 active:scale-[0.98] border border-white/[0.06]"
      >
        + {submitLabel}
      </button>
    </form>
  );
}

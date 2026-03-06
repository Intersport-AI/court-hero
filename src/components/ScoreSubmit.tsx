'use client';
import { useState } from 'react';
import { validateScore } from '@/lib/scoring';
import Modal from './Modal';

interface ScoreSubmitProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (score1: number, score2: number) => void;
  gameTo: number;
  winBy2: boolean;
  team1Label: string;
  team2Label: string;
}

export default function ScoreSubmit({ open, onClose, onSubmit, gameTo, winBy2, team1Label, team2Label }: ScoreSubmitProps) {
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const s1 = parseInt(score1);
    const s2 = parseInt(score2);
    if (isNaN(s1) || isNaN(s2)) { setError('Enter both scores'); return; }
    const validation = validateScore(s1, s2, gameTo, winBy2);
    if (!validation.valid) { setError(validation.error!); return; }
    onSubmit(s1, s2);
    setScore1('');
    setScore2('');
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit Score">
      <div className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block text-[12px] text-[#94A3B8] mb-3 uppercase tracking-[0.12em] font-bold">{team1Label}</label>
            <input
              type="number"
              inputMode="numeric"
              value={score1}
              onChange={e => { setScore1(e.target.value); setError(''); }}
              className="w-full bg-[#0C0F14] border border-white/[0.08] rounded-2xl px-6 py-5 text-[32px] font-black text-white text-center focus:border-[#00F260]/50 focus:outline-none tabular-nums transition-colors"
              placeholder="0"
              autoFocus
            />
          </div>
          <div className="text-center text-[#64748B] text-[14px] font-bold py-1">vs</div>
          <div>
            <label className="block text-[12px] text-[#94A3B8] mb-3 uppercase tracking-[0.12em] font-bold">{team2Label}</label>
            <input
              type="number"
              inputMode="numeric"
              value={score2}
              onChange={e => { setScore2(e.target.value); setError(''); }}
              className="w-full bg-[#0C0F14] border border-white/[0.08] rounded-2xl px-6 py-5 text-[32px] font-black text-white text-center focus:border-[#00F260]/50 focus:outline-none tabular-nums transition-colors"
              placeholder="0"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/[0.08] border border-red-500/20 rounded-2xl px-6 py-3.5 text-center">
            <p className="text-red-400 text-[14px] font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-[#00F260] text-black py-5 rounded-2xl font-bold text-[17px] hover:bg-[#00D954] transition-all duration-200 active:scale-[0.97] shadow-[0_0_30px_rgba(0,242,96,0.15)]"
        >
          Submit Score
        </button>
      </div>
    </Modal>
  );
}

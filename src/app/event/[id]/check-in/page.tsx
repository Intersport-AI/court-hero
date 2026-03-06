'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface Player {
  id: string;
  name: string;
  duprRating: number;
  checked_in: boolean;
}

interface CheckInStats {
  total: number;
  checked_in: number;
  pending: number;
  percentage: number;
}

export default function CheckInPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<CheckInStats>({
    total: 0,
    checked_in: 0,
    pending: 0,
    percentage: 0,
  });
  const [scannedPlayer, setScannedPlayer] = useState<Player | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [mode, setMode] = useState<'qr' | 'manual' | 'kiosk'>('manual');
  const qrInputRef = useRef<HTMLInputElement>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  // Load players
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const response = await fetch(`/api/organizations/org/events/${eventId}/players`);
        if (response.ok) {
          const data = await response.json();
          setPlayers(data);
          updateStats(data);
        }
      } catch (error) {
        console.error('Error loading players:', error);
      }
    };

    loadPlayers();
  }, [eventId]);

  // Update stats
  const updateStats = (playerList: Player[]) => {
    const checkedIn = playerList.filter((p) => p.checked_in).length;
    const total = playerList.length;
    setStats({
      total,
      checked_in: checkedIn,
      pending: total - checkedIn,
      percentage: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
    });
  };

  // Check in player
  const checkInPlayer = useCallback(
    async (playerId: string) => {
      try {
        const response = await fetch(
          `/api/organizations/org/events/${eventId}/players/${playerId}/check-in`,
          { method: 'POST' }
        );

        if (response.ok) {
          const updatedPlayers = players.map((p) =>
            p.id === playerId ? { ...p, checked_in: true } : p
          );
          setPlayers(updatedPlayers);
          updateStats(updatedPlayers);

          // Show confirmation
          const player = players.find((p) => p.id === playerId);
          if (player) {
            setScannedPlayer({ ...player, checked_in: true });
            setTimeout(() => setScannedPlayer(null), 2000);
          }

          // Clear input
          setManualInput('');
          if (manualInputRef.current) manualInputRef.current.focus();
        }
      } catch (error) {
        console.error('Error checking in player:', error);
      }
    },
    [eventId, players]
  );

  // Handle QR scan (simulated with input)
  const handleQRScan = useCallback(
    (value: string) => {
      const player = players.find((p) => p.id === value || p.name.toLowerCase() === value.toLowerCase());
      if (player) {
        if (!player.checked_in) {
          checkInPlayer(player.id);
        }
      }
    },
    [players, checkInPlayer]
  );

  // Handle manual input
  const handleManualInput = useCallback(
    (value: string) => {
      if (value.trim()) {
        const player = players.find(
          (p) => p.name.toLowerCase().includes(value.toLowerCase()) || p.id === value
        );
        if (player && !player.checked_in) {
          checkInPlayer(player.id);
        }
        setManualInput('');
      }
    },
    [players, checkInPlayer]
  );

  // Kiosk mode: full screen check-in for iPad
  if (mode === 'kiosk') {
    return (
      <div className="bg-[#0C0F14] text-white min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-[#FFB800] mb-4">Check In</h1>
          <p className="text-2xl text-[#B8C4D4] mb-8">Tap your name or scan QR code</p>
        </div>

        {/* Progress Circle */}
        <div className="mb-8">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-8 border-[#1A1F2E]"></div>
            <div
              className="absolute inset-0 rounded-full border-8 border-transparent border-t-[#00F260] border-r-[#00F260]"
              style={{
                transform: `rotate(${(stats.percentage / 100) * 360}deg)`,
                transition: 'transform 0.3s ease',
              }}
            ></div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#00F260]">{stats.percentage}%</div>
              <div className="text-sm text-[#B8C4D4]">
                {stats.checked_in}/{stats.total}
              </div>
            </div>
          </div>
        </div>

        {/* Last Scanned */}
        {scannedPlayer && (
          <div className="mb-8 p-6 bg-green-500/20 border-2 border-green-500 rounded-lg text-2xl">
            <div className="font-bold text-green-300">✓ Checked In</div>
            <div className="text-white mt-2">{scannedPlayer.name}</div>
          </div>
        )}

        {/* Input (invisible but active) */}
        <input
          ref={manualInputRef}
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleManualInput(manualInput);
            }
          }}
          onChange={(e) => setManualInput(e.target.value)}
          value={manualInput}
          autoFocus
          className="opacity-0 absolute"
          placeholder="Scan or type"
        />

        {/* Available Players Grid (small tablets) */}
        <div className="mt-8 w-full max-w-4xl">
          <div className="grid grid-cols-3 gap-4 max-h-64 overflow-y-auto">
            {players
              .filter((p) => !p.checked_in)
              .slice(0, 12)
              .map((player) => (
                <button
                  key={player.id}
                  onClick={() => checkInPlayer(player.id)}
                  className="p-4 bg-[#1A1F2E] border-2 border-[#00F260]/30 rounded-lg hover:border-[#00F260] hover:bg-[#00F260]/10 transition"
                >
                  <div className="font-semibold text-lg">{player.name}</div>
                  <div className="text-sm text-[#B8C4D4]">DUPR {player.duprRating.toFixed(1)}</div>
                </button>
              ))}
          </div>
        </div>

        <button
          onClick={() => setMode('manual')}
          className="mt-8 px-4 py-2 text-sm text-[#B8C4D4] hover:text-[#00F260]"
        >
          ← Exit Kiosk Mode
        </button>
      </div>
    );
  }

  // Normal mode
  return (
    <div className="bg-[#0C0F14] text-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#FFB800] mb-2">Player Check-In</h1>
          <p className="text-[#B8C4D4]">Real-time event attendance tracking</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1F2E] p-4 rounded-lg border border-[#00F260]/20">
            <div className="text-[#B8C4D4] text-sm">Total</div>
            <div className="text-3xl font-bold text-[#00F260] mt-1">{stats.total}</div>
          </div>
          <div className="bg-[#1A1F2E] p-4 rounded-lg border border-green-500/20">
            <div className="text-[#B8C4D4] text-sm">Checked In</div>
            <div className="text-3xl font-bold text-green-400 mt-1">{stats.checked_in}</div>
          </div>
          <div className="bg-[#1A1F2E] p-4 rounded-lg border border-amber-500/20">
            <div className="text-[#B8C4D4] text-sm">Pending</div>
            <div className="text-3xl font-bold text-amber-400 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-[#1A1F2E] p-4 rounded-lg border border-blue-500/20">
            <div className="text-[#B8C4D4] text-sm">Progress</div>
            <div className="text-3xl font-bold text-blue-400 mt-1">{stats.percentage}%</div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="bg-[#1A1F2E] p-4 rounded-lg border border-[#00F260]/10 mb-8 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              value="manual"
              checked={mode === 'manual'}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-4 h-4"
            />
            <span>Manual Input</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              value="qr"
              checked={mode === 'qr'}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-4 h-4"
            />
            <span>QR Code Scan</span>
          </label>
          <button
            onClick={() => setMode('kiosk')}
            className="ml-auto px-4 py-2 bg-[#FFB800]/20 text-[#FFB800] rounded hover:bg-[#FFB800]/30"
          >
            Kiosk Mode (iPad)
          </button>
        </div>

        {/* Input Field */}
        <div className="mb-8">
          {mode === 'manual' && (
            <div className="relative">
              <input
                ref={manualInputRef}
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleManualInput(manualInput);
                  }
                }}
                placeholder="Search player name or ID..."
                className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#00F260]/20 rounded-lg text-white placeholder-[#B8C4D4] focus:border-[#00F260] focus:outline-none"
              />
              {manualInput && (
                <div className="absolute top-full mt-2 w-full bg-[#1A1F2E] border border-[#00F260]/20 rounded-lg max-h-40 overflow-y-auto z-10">
                  {players
                    .filter(
                      (p) =>
                        !p.checked_in &&
                        (p.name.toLowerCase().includes(manualInput.toLowerCase()) ||
                          p.id.toLowerCase().includes(manualInput.toLowerCase()))
                    )
                    .map((player) => (
                      <button
                        key={player.id}
                        onClick={() => checkInPlayer(player.id)}
                        className="w-full px-4 py-2 text-left hover:bg-[#00F260]/10 border-b border-[#00F260]/5 last:border-b-0"
                      >
                        <div className="font-semibold">{player.name}</div>
                        <div className="text-sm text-[#B8C4D4]">DUPR {player.duprRating.toFixed(1)}</div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {mode === 'qr' && (
            <input
              ref={qrInputRef}
              type="text"
              onChange={(e) => {
                if (e.target.value) {
                  handleQRScan(e.target.value);
                  e.target.value = '';
                }
              }}
              placeholder="Position QR scanner here (or paste QR data)"
              className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#00F260]/20 rounded-lg text-white placeholder-[#B8C4D4] focus:border-[#00F260] focus:outline-none"
              autoFocus
            />
          )}
        </div>

        {/* Confirmation */}
        {scannedPlayer && (
          <div className="mb-8 p-6 bg-green-500/20 border-2 border-green-500 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✓</span>
              <div>
                <div className="font-bold text-lg">Checked In</div>
                <div className="text-[#B8C4D4]">{scannedPlayer.name}</div>
              </div>
            </div>
          </div>
        )}

        {/* Players List */}
        <div className="bg-[#1A1F2E] rounded-lg overflow-hidden border border-[#00F260]/10">
          <div className="px-6 py-4 bg-[#0C0F14] border-b border-[#00F260]/10 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="w-4 h-4" defaultChecked={false} />
              Checked In
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="w-4 h-4" defaultChecked={true} />
              Pending
            </label>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => !player.checked_in && checkInPlayer(player.id)}
                className={`w-full px-6 py-4 text-left border-b border-[#00F260]/5 flex items-center justify-between hover:bg-[#0C0F14]/50 transition ${
                  player.checked_in ? 'opacity-60' : ''
                }`}
              >
                <div>
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-sm text-[#B8C4D4]">DUPR {player.duprRating.toFixed(1)}</div>
                </div>
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    player.checked_in
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {player.checked_in ? '✓ In' : 'Pending'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

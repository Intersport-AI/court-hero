'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

interface Ticket {
  id: string;
  playerName: string;
  division: string;
  registrationDate: string;
  status: 'active' | 'cancelled';
  qrCode: string;
}

export default function EventTicketsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'TKT001', playerName: 'Sarah Johnson', division: 'Open', registrationDate: 'Feb 24', status: 'active', qrCode: 'QR001' },
    { id: 'TKT002', playerName: 'Mike Chen', division: 'Open', registrationDate: 'Feb 25', status: 'active', qrCode: 'QR002' },
    { id: 'TKT003', playerName: 'Jessica Davis', division: 'Women 35+', registrationDate: 'Feb 26', status: 'active', qrCode: 'QR003' },
  ]);

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-6xl mx-auto pt-8 px-6 pb-12">
        <h1 className="text-white text-[40px] font-bold mb-8">Event Tickets</h1>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6 text-center">
            <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">TOTAL REGISTERED</p>
            <p className="text-[#00F260] text-[40px] font-bold">{tickets.length}</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6 text-center">
            <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">REVENUE</p>
            <p className="text-white text-[40px] font-bold">${(tickets.length * 38).toFixed(0)}</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6 text-center">
            <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">CHECK-INS</p>
            <p className="text-[#FFB800] text-[40px] font-bold">0</p>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-8 py-6 bg-[#0A0D12]/50 border-b border-white/[0.06] font-bold text-[13px] text-[#8B9DB8]">
            <div>Ticket ID</div>
            <div>Player</div>
            <div>Division</div>
            <div>Registered</div>
            <div>Status</div>
          </div>

          {tickets.map((ticket, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-4 px-8 py-6 border-b border-white/[0.06] hover:bg-[#0A0D12]/20 transition-all items-center">
              <div className="text-white font-mono text-[13px]">{ticket.id}</div>
              <div className="text-white font-bold">{ticket.playerName}</div>
              <div className="text-[#8B9DB8]">{ticket.division}</div>
              <div className="text-[#8B9DB8] text-[13px]">{ticket.registrationDate}</div>
              <div>
                <span className="px-3 py-1 rounded-full bg-[#00F260]/10 text-[#00F260] text-[11px] font-bold">
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button className="bg-[#00F260] text-black px-8 py-4 rounded-2xl font-bold hover:bg-[#00D954] transition-all">
            📥 Export Tickets
          </button>
          <button className="border border-[#00F260]/30 text-[#00F260] px-8 py-4 rounded-2xl font-bold hover:bg-[#00F260]/5 transition-all">
            📧 Email All Players
          </button>
          <button className="border border-[#00F260]/30 text-[#00F260] px-8 py-4 rounded-2xl font-bold hover:bg-[#00F260]/5 transition-all">
            🎫 Manage Refunds
          </button>
        </div>
      </div>
    </div>
  );
}

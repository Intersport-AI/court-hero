'use client';
import { useState } from 'react';
import Header from '@/components/Header';

interface Notification {
  id: string;
  type: 'match' | 'registration' | 'tournament' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'match', title: 'Match Assignment', message: 'You\'ve been assigned to Court 1 in 30 minutes', timestamp: '2 minutes ago', read: false, actionUrl: '/event/1/play' },
    { id: '2', type: 'tournament', title: 'Tournament Starting', message: 'Summer Championship 2026 starts tomorrow at 9:00 AM', timestamp: '1 hour ago', read: false, actionUrl: '/event/1' },
    { id: '3', type: 'registration', title: 'Registration Confirmed', message: 'You\'ve successfully registered for Downtown Cup', timestamp: '5 hours ago', read: true, actionUrl: '/event/2' },
    { id: '4', type: 'system', title: 'Leaderboard Update', message: 'Your rating increased to 3.8 DUPR', timestamp: '1 day ago', read: true },
    { id: '5', type: 'match', title: 'Match Result Posted', message: 'Results from your match vs Smith/Jones have been posted', timestamp: '2 days ago', read: true },
  ]);

  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-3xl mx-auto pt-8 px-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white text-[40px] font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead}
              className="text-[#00F260] font-bold text-[13px] hover:underline">
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'match', 'tournament', 'registration', 'system'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-[13px] transition-all capitalize ${
                filter === f
                  ? 'bg-[#00F260] text-black'
                  : 'bg-[#111827] text-[#8B9DB8] hover:border-[#00F260]/20'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-12 text-center">
            <p className="text-[#8B9DB8]">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notif) => (
              <button key={notif.id} onClick={() => markAsRead(notif.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  notif.read
                    ? 'bg-[#111827]/40 border-white/[0.06]'
                    : 'bg-[#00F260]/10 border-[#00F260]/20'
                }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-bold">{notif.title}</h3>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#00F260]"></span>
                      )}
                    </div>
                    <p className="text-[#8B9DB8] text-[13px] mb-2">{notif.message}</p>
                    <p className="text-[#64748B] text-[12px]">{notif.timestamp}</p>
                  </div>
                  {notif.actionUrl && (
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-[#00F260] text-[12px] font-bold">→</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Notification Settings Hint */}
        <div className="mt-12 bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-white font-bold mb-3">📧 Manage Notifications</h2>
          <p className="text-[#8B9DB8] text-[13px] mb-4">
            Configure which notifications you'd like to receive in your account settings.
          </p>
          <a href="/account" className="text-[#00F260] font-bold text-[13px] hover:underline">
            Go to Settings →
          </a>
        </div>
      </div>
    </div>
  );
}

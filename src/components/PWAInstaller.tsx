'use client';

import { useEffect, useState } from 'react';

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration.scope);
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      });
    }

    // Capture install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-[#1A1F2E] border-2 border-[#00F260] rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="font-bold text-[#00F260] mb-1">Install Court Hero</div>
          <p className="text-sm text-[#B8C4D4] mb-3">
            Add to your home screen for quick access and offline support
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-[#00F260] text-[#0C0F14] font-bold rounded hover:bg-[#00F260]/80 text-sm"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="px-4 py-2 bg-[#0C0F14] border border-[#00F260]/20 text-white rounded hover:border-[#00F260] text-sm"
            >
              Not Now
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="text-[#B8C4D4] hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

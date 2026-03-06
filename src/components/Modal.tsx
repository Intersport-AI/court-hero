'use client';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function Modal({ open, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Panel */}
      <div
        className="relative bg-[#111827] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl p-8 sm:p-10 w-full sm:max-w-[460px] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[20px] font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/[0.06] transition text-lg"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

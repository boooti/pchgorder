import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

let toastListener = null;

export function showToast(message, type = 'success') {
  if (toastListener) {
    toastListener({ id: Date.now(), message, type });
  }
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastListener = (newToast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3500);
    };
    return () => {
      toastListener = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-elevated border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
            t.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-700'
              : t.type === 'error'
              ? 'bg-rose-900/90 text-white border-rose-700'
              : 'bg-slate-900/95 text-white border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span className="text-sm font-medium leading-snug">{t.message}</span>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4 opacity-70 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  );
}

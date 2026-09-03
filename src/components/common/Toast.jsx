import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

let toastListener = null;

export const showToast = (message, type = 'success') => {
  if (toastListener) {
    toastListener({ id: Date.now(), message, type });
  }
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastListener = (toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 1500); // Fast auto-dismiss in 1.5s
    };

    return () => {
      toastListener = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-1.5 max-w-[280px] w-auto pointer-events-none px-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between px-3 py-2 rounded-xl shadow-md border backdrop-blur-md transition-all duration-200 animate-slide-up ${
            toast.type === 'error'
              ? 'bg-red-950/95 border-red-800 text-white'
              : toast.type === 'warning'
              ? 'bg-amber-950/95 border-amber-800 text-amber-100'
              : 'bg-navy-950/95 border-navy-700 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            ) : toast.type === 'warning' ? (
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            <span className="text-xs font-semibold leading-tight">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-0.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

'use client';

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { clsx } from 'clsx';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
  toast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const MAX_TOASTS = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++nextIdRef.current;
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      // En eski toast'ları kaldır
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-100 flex flex-col gap-2"
        role="alert"
        aria-live="assertive"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up',
              toast.type === 'success' && 'bg-green-600 text-white',
              toast.type === 'error' && 'bg-red-600 text-white',
              toast.type === 'info' && 'bg-gray-900 dark:bg-slate-700 text-white',
              toast.type === 'warning' && 'bg-amber-500 text-white'
            )}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

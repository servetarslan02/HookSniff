'use client';

import { useEffect, useState } from 'react';

/**
 * Service Worker registration component.
 * Registers the SW and handles update prompts.
 * Renders nothing — side-effect only.
 */
export function ServiceWorkerRegister() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [newWorkerRef, setNewWorkerRef] = useState<ServiceWorker | null>(null);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  // Track the SW version that was dismissed so "Later" persists across reloads
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem('sw_dismissed_version'); } catch { return null; }
  });

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    let isMounted = true;

    async function register() {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        if (!isMounted) return;
        setRegistration(reg);

        // Check for updates periodically (every 60 minutes)
        const updateInterval = setInterval(
          () => reg.update(),
          60 * 60 * 1000
        );

        // New SW waiting → show update prompt
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // Get the SW script URL as a version identifier
              const swUrl = newWorker.scriptURL;
              // Only show prompt if user hasn't dismissed this exact version
              const storedDismissed = localStorage.getItem('sw_dismissed_version');
              if (storedDismissed !== swUrl && isMounted) {
                setNewWorkerRef(newWorker);
                setShowUpdate(true);
              }
            }
          });
        });

        return () => clearInterval(updateInterval);
      } catch (err) {
        // SW registration failed — non-fatal, app works normally
        console.warn('[SW] Registration failed:', err);
      }
    }

    register();

    return () => {
      isMounted = false;
    };
  }, []);

  // Apply update when user clicks the prompt
  function applyUpdate() {
    const worker = newWorkerRef ?? registration?.waiting;
    if (!worker) return;
    // Listen BEFORE posting skipWaiting to avoid race condition
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    }, { once: true });
    worker.postMessage('skipWaiting');
  }

  // Dismiss and persist so this version doesn't prompt again
  function dismissUpdate() {
    const worker = newWorkerRef ?? registration?.waiting;
    if (worker) {
      try { localStorage.setItem('sw_dismissed_version', worker.scriptURL); } catch {}
    }
    setShowUpdate(false);
  }

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4">
      <div className="rounded-xl border border-violet-500/20 bg-slate-900 p-4 shadow-2xl shadow-violet-500/10">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-100">
              Update available
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              A new version of HookSniff is ready.
            </p>
          </div>
          <button
            onClick={dismissUpdate}
            className="shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Dismiss"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={applyUpdate}
            className="flex-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 transition-colors"
          >
            Update now
          </button>
          <button
            onClick={dismissUpdate}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

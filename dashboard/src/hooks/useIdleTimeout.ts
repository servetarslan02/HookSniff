'use client';

import { useEffect, useRef, useCallback } from 'react';

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;

/**
 * Logs the user out after `timeoutMs` of inactivity.
 * Resets the timer on each user interaction (mouse, keyboard, scroll, touch).
 *
 * Fixes:
 * - Mobile: listens to visibilitychange to handle app backgrounding
 * - Saves last activity timestamp to survive mobile timer throttling
 * - On return from background, checks if idle time exceeded threshold
 */
export function useIdleTimeout(onIdle: () => void, timeoutMs = IDLE_TIMEOUT_MS) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onIdleRef.current(), timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    // Start timer on mount
    resetTimer();

    // Reset on each user activity
    const handler = () => resetTimer();
    for (const event of EVENTS) {
      window.addEventListener(event, handler, { passive: true });
    }

    // BUG FIX: Mobile backgrounding — browsers throttle timers when app is hidden.
    // When user returns, check if they've been idle too long.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const idleMs = Date.now() - lastActivityRef.current;
        if (idleMs >= timeoutMs) {
          // Been idle too long while backgrounded — logout now
          onIdleRef.current();
        } else {
          // Reset timer with remaining time
          const remaining = timeoutMs - idleMs;
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => onIdleRef.current(), remaining);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of EVENTS) {
        window.removeEventListener(event, handler);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [resetTimer, timeoutMs]);
}

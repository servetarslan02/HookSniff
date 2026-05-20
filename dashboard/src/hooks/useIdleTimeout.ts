'use client';

import { useEffect, useRef, useCallback } from 'react';

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;

/**
 * Logs the user out after `timeoutMs` of inactivity.
 * Resets the timer on each user interaction (mouse, keyboard, scroll, touch).
 */
export function useIdleTimeout(onIdle: () => void, timeoutMs = IDLE_TIMEOUT_MS) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  const resetTimer = useCallback(() => {
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

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of EVENTS) {
        window.removeEventListener(event, handler);
      }
    };
  }, [resetTimer]);
}

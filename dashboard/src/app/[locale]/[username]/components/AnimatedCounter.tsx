'use client';

import { useState, useEffect, useRef } from 'react';

export function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const safeValue = Math.max(0, Math.round(value));
  const [display, setDisplay] = useState(0);
  const prevRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevRef.current;
    const diff = safeValue - start;
    if (diff === 0) {
      setDisplay(safeValue);
      return;
    }
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = safeValue;
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [safeValue, duration]);

  return <>{display.toLocaleString()}</>;
}

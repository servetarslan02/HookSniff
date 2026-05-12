'use client';

import { useState } from 'react';

export function ConsentToggle({
  consentKey: _consentKey,
  storageKey,
}: {
  consentKey: string;
  storageKey: string;
}) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(storageKey) === 'true';
  });

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem(storageKey, String(newValue));
    // Also set/remove the cookie for backend consent tracking
    if (newValue) {
      document.cookie = `${storageKey}=true; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    } else {
      document.cookie = `${storageKey}=; path=/; max-age=0`;
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={handleToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-brand-600 dark:bg-brand-500' : 'bg-gray-300 dark:bg-slate-600'
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

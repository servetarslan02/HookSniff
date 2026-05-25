'use client';

import { useState, useDeferredValue, useCallback } from 'react';

/**
 * useDebouncedSearch — React 19 Concurrent Features
 * 
 * useDeferredValue ile arama input'u optimize edilir.
 * Kullanıcı yazarken UI responsive kalır, arama arkada çalışır.
 * 
 * setTimeout debounce yerine React'un built-in deferred rendering kullanır.
 * Daha iyi: yazma performansı asla engellenmez, arama otomatik olarak ertelenir.
 */
export function useDebouncedSearch(initialValue = '') {
  const [input, setInput] = useState(initialValue);
  const deferredValue = useDeferredValue(input);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const reset = useCallback(() => {
    setInput('');
  }, []);

  return {
    input,
    deferredValue,
    handleChange,
    reset,
    isStale: input !== deferredValue,
  };
}

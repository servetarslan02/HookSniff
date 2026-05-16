import { HISTORY_KEY, MAX_HISTORY, MAX_HISTORY_SIZE_BYTES, type PlaygroundRequest } from './types';

export function loadHistory(): PlaygroundRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: PlaygroundRequest[]) {
  try {
    const trimmed = history.slice(0, MAX_HISTORY);
    const json = JSON.stringify(trimmed);
    if (new Blob([json]).size > MAX_HISTORY_SIZE_BYTES) {
      // Remove oldest entries until size is under limit
      while (trimmed.length > 1) {
        trimmed.pop();
        const reduced = JSON.stringify(trimmed);
        if (new Blob([reduced]).size <= MAX_HISTORY_SIZE_BYTES) {
          localStorage.setItem(HISTORY_KEY, reduced);
          return;
        }
      }
      // If even one entry is too large, store empty
      localStorage.setItem(HISTORY_KEY, '[]');
    } else {
      localStorage.setItem(HISTORY_KEY, json);
    }
  } catch {
    // localStorage full — clear history
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* cleanup failed */ }
  }
}

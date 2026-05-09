/**
 * Dashboard Smoke Tests
 *
 * Temel bileşenlerin varlığını ve temel fonksiyonları test eder.
 * Run: npx vitest run
 */

import { describe, it, expect } from 'vitest';

// ─── Utility Functions ───

describe('Error handling', () => {
  it('getErrorMessage returns string for Error objects', async () => {
    const { getErrorMessage } = await import('@/lib/errors');
    expect(getErrorMessage(new Error('test error'))).toBe('test error');
  });

  it('getErrorMessage returns string for string values', async () => {
    const { getErrorMessage } = await import('@/lib/errors');
    expect(getErrorMessage('string error')).toBe('string error');
  });

  it('getErrorMessage returns Unknown error for non-string non-Error values', async () => {
    const { getErrorMessage } = await import('@/lib/errors');
    expect(getErrorMessage(42)).toBe('Unknown error');
    expect(getErrorMessage(null)).toBe('Unknown error');
    expect(getErrorMessage(undefined)).toBe('Unknown error');
  });

  it('getErrorMessage extracts message from object with message property', async () => {
    const { getErrorMessage } = await import('@/lib/errors');
    expect(getErrorMessage({ message: 'obj error' })).toBe('obj error');
  });
});

// ─── API Client ───

describe('API client', () => {
  it('exports apiFetch function', async () => {
    const api = await import('@/lib/api');
    expect(api.apiFetch).toBeDefined();
    expect(typeof api.apiFetch).toBe('function');
  });
});

// ─── Error messages ───

describe('Error module', () => {
  it('exports getErrorMessage function', async () => {
    const mod = await import('@/lib/errors');
    expect(mod.getErrorMessage).toBeDefined();
    expect(typeof mod.getErrorMessage).toBe('function');
  });
});

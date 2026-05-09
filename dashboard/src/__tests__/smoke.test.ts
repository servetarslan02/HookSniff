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

  it('getErrorMessage returns string for unknown values', async () => {
    const { getErrorMessage } = await import('@/lib/errors');
    expect(getErrorMessage('string error')).toBe('string error');
    expect(getErrorMessage(42)).toBe('42');
    expect(getErrorMessage(null)).toBe('An unexpected error occurred');
  });
});

// ─── Store ───

describe('Auth store', () => {
  it('exports useAuth hook', async () => {
    const store = await import('@/lib/store');
    expect(store.useAuth).toBeDefined();
    expect(typeof store.useAuth).toBe('function');
  });
});

// ─── API Client ───

describe('API client', () => {
  it('exports api object', async () => {
    const api = await import('@/lib/api');
    expect(api).toBeDefined();
  });
});

// ─── i18n ───

describe('Internationalization', () => {
  it('has locale messages for all supported languages', async () => {
    const locales = ['en', 'tr', 'de', 'ja', 'pt-br', 'es', 'fr', 'ko'];
    for (const locale of locales) {
      const messages = await import(`../../messages/${locale}.json`);
      expect(messages.default).toBeDefined();
      expect(typeof messages.default).toBe('object');
    }
  });
});

// ─── Components ───

describe('Component exports', () => {
  it('Toast component is exported', async () => {
    const mod = await import('@/components/Toast');
    expect(mod.ToastProvider).toBeDefined();
    expect(mod.useToast).toBeDefined();
  });
});

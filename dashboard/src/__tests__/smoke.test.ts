import { describe, it, expect } from 'vitest';

describe('Smoke Tests', () => {
  it('app module exports exist', async () => {
    const api = await import('@/lib/api');
    expect(api.apiFetch).toBeDefined();
    expect(api.endpointsApi).toBeDefined();
    expect(api.webhooksApi).toBeDefined();
  });

  it('store module exports exist', async () => {
    const store = await import('@/lib/store');
    expect(store.useAuth).toBeDefined();
  });

  it('schemas module exports exist', async () => {
    const schemas = await import('@/schemas/api');
    expect(schemas.SystemHealthSchema).toBeDefined();
    expect(schemas.DeliverySchema).toBeDefined();
    expect(schemas.PlatformSettingsSchema).toBeDefined();
  });

  it('error utils module exports exist', async () => {
    const errors = await import('@/lib/errors');
    expect(errors.getErrorMessage).toBeDefined();
  });
});

describe('Environment', () => {
  it('has fetch available', () => {
    expect(typeof fetch).toBe('function');
  });

  it('has crypto available', () => {
    expect(typeof crypto).toBe('object');
  });
});

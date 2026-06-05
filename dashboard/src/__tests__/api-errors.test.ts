import { describe, it, expect } from 'vitest';
import { HookSniffError, createApiError, createNetworkError } from '../lib/api-errors';

describe('HookSniffError', () => {
  it('stores message, code, status', () => {
    const err = new HookSniffError({ message: 'Bad', code: 'BAD', status: 400 });
    expect(err.message).toBe('Bad');
    expect(err.code).toBe('BAD');
    expect(err.status).toBe(400);
    expect(err.isNetworkError).toBe(false);
    expect(err.name).toBe('HookSniffError');
  });

  it('defaults isNetworkError to false', () => {
    const err = new HookSniffError({ message: 'm', code: 'c', status: 500 });
    expect(err.isNetworkError).toBe(false);
  });

  it('accepts isNetworkError=true', () => {
    const err = new HookSniffError({ message: 'm', code: 'c', status: 0, isNetworkError: true });
    expect(err.isNetworkError).toBe(true);
  });
});

describe('createApiError', () => {
  it('parses { error: { code, message } } response', () => {
    const err = createApiError({ error: { code: 'INVALID', message: 'Bad input' } }, 400);
    expect(err.message).toBe('Bad input');
    expect(err.code).toBe('INVALID');
    expect(err.status).toBe(400);
  });

  it('uses fallback message when error.message is missing', () => {
    const err = createApiError({ error: { code: 'X' } }, 500);
    expect(err.message).toBe('API error: 500');
    expect(err.code).toBe('X');
  });

  it('uses UNKNOWN code when error.code is missing', () => {
    const err = createApiError({ error: { message: 'oops' } }, 422);
    expect(err.code).toBe('UNKNOWN');
  });

  it('handles string responseBody (line 51)', () => {
    const err = createApiError('Server Error', 500);
    expect(err.message).toBe('Server Error');
    expect(err.code).toBe('UNKNOWN');
    expect(err.status).toBe(500);
  });

  it('handles null responseBody (line 44)', () => {
    const err = createApiError(null, 502);
    expect(err.message).toBe('API error: 502');
    expect(err.code).toBe('UNKNOWN');
    expect(err.status).toBe(502);
  });

  it('handles object without error key (line 44)', () => {
    const err = createApiError({ message: 'something' }, 403);
    expect(err.message).toBe('API error: 403');
    expect(err.code).toBe('UNKNOWN');
  });

  it('handles undefined responseBody', () => {
    const err = createApiError(undefined, 503);
    expect(err.message).toBe('API error: 503');
    expect(err.code).toBe('UNKNOWN');
  });
});

describe('createNetworkError', () => {
  it('creates error with NETWORK_ERROR code', () => {
    const err = createNetworkError('Connection refused');
    expect(err.message).toBe('Connection refused');
    expect(err.code).toBe('NETWORK_ERROR');
    expect(err.status).toBe(0);
    expect(err.isNetworkError).toBe(true);
  });
});

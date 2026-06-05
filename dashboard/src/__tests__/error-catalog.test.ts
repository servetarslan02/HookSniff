import { describe, it, expect } from 'vitest';

describe('error-catalog', () => {
  it('ERROR_CODES is a non-empty object', async () => {
    const { ERROR_CODES } = await import('@/lib/error-catalog');
    expect(typeof ERROR_CODES).toBe('object');
    expect(Object.keys(ERROR_CODES).length).toBeGreaterThan(0);
  });

  it('getUserFriendlyMessage returns a string for known code', async () => {
    const { getUserFriendlyMessage, ERROR_CODES } = await import('@/lib/error-catalog');
    const firstCode = Object.keys(ERROR_CODES)[0];
    const msg = getUserFriendlyMessage(firstCode);
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('getUserFriendlyMessage returns fallback for unknown code', async () => {
    const { getUserFriendlyMessage } = await import('@/lib/error-catalog');
    const msg = getUserFriendlyMessage('UNKNOWN_CODE_12345');
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('extractErrorCode returns code from Error with code', async () => {
    const { extractErrorCode } = await import('@/lib/error-catalog');
    const err = { code: 'TEST_CODE', message: 'test' };
    expect(extractErrorCode(err)).toBe('TEST_CODE');
  });

  it('extractErrorCode returns null for plain Error', async () => {
    const { extractErrorCode } = await import('@/lib/error-catalog');
    expect(extractErrorCode(new Error('test'))).toBeNull();
  });

  it('extractErrorCode returns null for null', async () => {
    const { extractErrorCode } = await import('@/lib/error-catalog');
    expect(extractErrorCode(null)).toBeNull();
  });
});

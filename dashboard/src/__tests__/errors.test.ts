import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../lib/errors';

describe('getErrorMessage', () => {
  it('extracts message from Error instance', () => {
    expect(getErrorMessage(new Error('test error'))).toBe('test error');
  });

  it('returns string as-is', () => {
    expect(getErrorMessage('raw string error')).toBe('raw string error');
  });

  it('extracts message from object with message property', () => {
    expect(getErrorMessage({ message: 'obj error' })).toBe('obj error');
  });

  it('returns "Unknown error" for null', () => {
    expect(getErrorMessage(null)).toBe('Unknown error');
  });

  it('returns "Unknown error" for undefined', () => {
    expect(getErrorMessage(undefined)).toBe('Unknown error');
  });

  it('returns "Unknown error" for number', () => {
    expect(getErrorMessage(42)).toBe('Unknown error');
  });

  it('returns "Unknown error" for empty object', () => {
    expect(getErrorMessage({})).toBe('Unknown error');
  });

  it('handles object with non-string message', () => {
    expect(getErrorMessage({ message: 123 })).toBe('123');
  });
});

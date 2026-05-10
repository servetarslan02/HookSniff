import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../lib/errors';

describe('errors-ultra: getErrorMessage', () => {
  // Test 1: Returns message from Error instance
  it('extracts message from Error instance', () => {
    expect(getErrorMessage(new Error('Something broke'))).toBe('Something broke');
  });

  // Test 2: Returns string as-is
  it('returns string errors directly', () => {
    expect(getErrorMessage('just a string')).toBe('just a string');
  });

  // Test 3: Returns message from object with message property
  it('extracts message from object with message property', () => {
    expect(getErrorMessage({ message: 'obj error' })).toBe('obj error');
  });

  // Test 4: Handles null
  it('returns "Unknown error" for null', () => {
    expect(getErrorMessage(null)).toBe('Unknown error');
  });

  // Test 5: Handles undefined
  it('returns "Unknown error" for undefined', () => {
    expect(getErrorMessage(undefined)).toBe('Unknown error');
  });

  // Test 6: Handles number
  it('returns "Unknown error" for number', () => {
    expect(getErrorMessage(42)).toBe('Unknown error');
  });

  // Test 7: Handles boolean
  it('returns "Unknown error" for boolean', () => {
    expect(getErrorMessage(false)).toBe('Unknown error');
  });

  // Test 8: Handles empty object
  it('returns "Unknown error" for empty object', () => {
    expect(getErrorMessage({})).toBe('Unknown error');
  });

  // Test 9: Handles object with non-string message
  it('converts non-string message to string', () => {
    expect(getErrorMessage({ message: 123 })).toBe('123');
  });

  // Test 10: Handles Error subclass
  it('handles TypeError', () => {
    expect(getErrorMessage(new TypeError('type error'))).toBe('type error');
  });

  // Test 11: Handles empty string
  it('returns empty string for empty string input', () => {
    expect(getErrorMessage('')).toBe('');
  });

  // Test 12: Handles Error with empty message
  it('returns empty string for Error with empty message', () => {
    expect(getErrorMessage(new Error(''))).toBe('');
  });

  // Test 13: Handles object with message as array
  it('converts array message to string', () => {
    expect(getErrorMessage({ message: ['a', 'b'] })).toBe('a,b');
  });

  // Test 14: Handles object with message as object
  it('converts object message to string', () => {
    const result = getErrorMessage({ message: { nested: true } });
    expect(result).toBe('[object Object]');
  });

  // Test 15: Handles Error with cause
  it('handles Error with cause property', () => {
    const cause = new Error('root cause');
    const err = new Error('wrapper', { cause });
    expect(getErrorMessage(err)).toBe('wrapper');
  });
});

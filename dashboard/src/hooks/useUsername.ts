'use client';

/**
 * Username is no longer in the URL.
 * Returns empty string for backward compatibility.
 * Components should use direct paths like /deliveries instead of /${username}/deliveries.
 */
export function useUsername(): string {
  return '';
}

'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/store';

/**
 * Get the current username from URL params, falling back to auth store.
 * Used for building username-prefixed links.
 */
export function useUsername(): string {
  const params = useParams();
  const { user } = useAuth();

  // Try URL params first (inside [username] layout)
  if (params?.username && typeof params.username === 'string') {
    return params.username;
  }

  // Fallback: generate from user data
  if (user?.name || user?.email) {
    return (user.name || user.email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  return 'dashboard'; // fallback
}

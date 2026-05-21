/**
 * Hook for showing user-friendly error messages via toast.
 *
 * Usage:
 *   const { showError, showSuccess } = useFriendlyToast();
 *   try { ... } catch (e) { showError(e); }
 */

'use client';

import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import { getFriendlyError, extractErrorCode } from '@/lib/error-messages';

export function useFriendlyToast() {
  const { toast } = useToast();
  const t = useTranslations();

  /**
   * Show a user-friendly error toast.
   * Uses the API error code for i18n lookup — no string matching.
   */
  function showError(err: unknown, fallback?: string) {
    const code = extractErrorCode(err);
    const friendlyMessage = getFriendlyError(code, t as (key: string) => string, fallback);
    toast(friendlyMessage, 'error');
  }

  function showSuccess(message: string) {
    toast(message, 'success');
  }

  function showWarning(message: string) {
    toast(message, 'warning');
  }

  function showInfo(message: string) {
    toast(message, 'info');
  }

  return { showError, showSuccess, showWarning, showInfo, toast };
}

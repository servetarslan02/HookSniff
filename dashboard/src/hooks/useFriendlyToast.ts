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
import { getFriendlyError, extractErrorMessage } from '@/lib/error-messages';
import { HookSniffError } from '@/lib/api-errors';

export function useFriendlyToast() {
  const { toast } = useToast();
  const t = useTranslations();

  /**
   * Show a user-friendly error toast.
   * If the error is a HookSniffError, maps the raw message to an i18n key.
   * Otherwise, shows a generic error message.
   */
  function showError(err: unknown, fallback?: string) {
    let rawMessage: string | null = null;

    // Extract the raw message from HookSniffError or regular Error
    if (err instanceof HookSniffError) {
      rawMessage = err.rawMessage;
    } else {
      rawMessage = extractErrorMessage(err);
    }

    // Map to user-friendly message
    const friendlyMessage = getFriendlyError(rawMessage, t as (key: string) => string, fallback);
    toast(friendlyMessage, 'error');
  }

  /**
   * Show a success toast with an i18n key.
   */
  function showSuccess(message: string) {
    toast(message, 'success');
  }

  /**
   * Show a warning toast.
   */
  function showWarning(message: string) {
    toast(message, 'warning');
  }

  /**
   * Show an info toast.
   */
  function showInfo(message: string) {
    toast(message, 'info');
  }

  return { showError, showSuccess, showWarning, showInfo, toast };
}

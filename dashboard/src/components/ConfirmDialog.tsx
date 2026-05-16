'use client';

import { clsx } from 'clsx';
import { useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  const t = useTranslations('common');
  const tConfirm = confirmLabel ?? t('confirm');
  const tCancel = cancelLabel ?? t('cancel');
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Trap focus inside dialog
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    },
    [onCancel]
  );

  useEffect(() => {
    if (!open) return;

    // Save currently focused element to restore later
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the dialog
    dialogRef.current?.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      // Restore focus to the element that opened the dialog
      previousFocusRef.current?.focus();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        tabIndex={-1}
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 outline-hidden"
      >
        <h3 id="confirm-dialog-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
          >
            {tCancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-medium text-white transition',
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-brand-600 hover:bg-brand-700',
              loading && 'opacity-60 cursor-not-allowed'
            )}
          >
            {loading ? t('processing') : tConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}

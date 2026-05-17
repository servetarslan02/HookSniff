'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/store';
import { endpointsApi } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';

export function SignatureCard({
  endpointId,
  signingSecret,
}: {
  endpointId: string;
  signingSecret?: string;
}) {
  const t = useTranslations('endpointSettings');
  const tCommon = useTranslations('common');
  const { token } = useAuth();
  const { toast } = useToast();
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  const handleRotateSecret = async () => {
    if (!token || !endpointId) return;
    setRotating(true);
    try {
      const data = await endpointsApi.rotateSecret(token, endpointId);
      setNewSecret(data.signing_secret);
      toast(t('toastSecretRotated'), 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('toastRotationFailed');
      toast(msg, 'error');
    } finally {
      setRotating(false);
      setShowRotateConfirm(false);
    }
  };

  return (
    <>
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔑</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('signingSecret')}</h3>
        </div>

        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          {t('rotateSecretDesc')}
        </p>

        {signingSecret && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-700">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('currentSecret')}</p>
            <code className="text-sm font-mono text-gray-700 dark:text-slate-300 break-all">
              {signingSecret.slice(0, 12)}{'*'.repeat(20)}
            </code>
          </div>
        )}

        {newSecret && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">{t('newSecret')}</p>
            <code className="text-sm font-mono text-green-800 dark:text-green-300 break-all">{newSecret}</code>
          </div>
        )}

        <button type="button"
          onClick={() => setShowRotateConfirm(true)}
          className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 transition"
        >
          {t('rotateSecret')}
        </button>
      </div>

      <ConfirmDialog
        open={showRotateConfirm}
        title={t('rotateConfirmTitle')}
        message={t('rotateConfirmDesc')}
        confirmLabel={rotating ? t('rotating') : t('rotateSecret')}
        cancelLabel={tCommon('cancel')}
        variant="danger"
        onConfirm={handleRotateSecret}
        onCancel={() => setShowRotateConfirm(false)}
        loading={rotating}
      />
    </>
  );
}

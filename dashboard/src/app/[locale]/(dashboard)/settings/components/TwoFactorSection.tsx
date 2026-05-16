'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { twoFactorApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { useTranslations } from 'next-intl';

export function TwoFactorSection() {
  const { token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('settings');
  const tc = useTranslations('common');

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEnable, setShowEnable] = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  // Enable flow
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [enabling, setEnabling] = useState(false);
  const [step, setStep] = useState<'qr' | 'verify' | 'done'>('qr');

  // Disable flow
  const [disableCode, setDisableCode] = useState('');
  const [disabling, setDisabling] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!token) return;
    try {
      const data = await twoFactorApi.getStatus(token);
      setEnabled(data.enabled);
    } catch {
      // 2FA not configured
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  /* ─── Enable 2FA ─── */
  const handleStartEnable = async () => {
    if (!token) return;
    setEnabling(true);
    try {
      const data = await twoFactorApi.enable(token);
      setQrCode(data.qr_code);
      setSecret(data.secret);
      setStep('qr');
      setShowEnable(true);
    } catch (err) {
      toast(getErrorMessage(err, 'Failed to enable 2FA'), 'error');
    } finally {
      setEnabling(false);
    }
  };

  const handleConfirm = async () => {
    if (!token || !totpCode.trim()) return;
    setEnabling(true);
    try {
      const data = await twoFactorApi.confirm(token, totpCode.trim());
      setBackupCodes(data.backup_codes || []);
      setStep('done');
      setEnabled(true);
      toast('2FA enabled successfully', 'success');
    } catch (err) {
      toast(getErrorMessage(err, 'Invalid code. Try again.'), 'error');
    } finally {
      setEnabling(false);
    }
  };

  const handleCloseEnable = () => {
    setShowEnable(false);
    setQrCode('');
    setSecret('');
    setTotpCode('');
    setBackupCodes([]);
    setStep('qr');
  };

  /* ─── Disable 2FA ─── */
  const handleDisable = async () => {
    if (!token || !disableCode.trim()) return;
    setDisabling(true);
    try {
      await twoFactorApi.disable(token);
      setEnabled(false);
      setShowDisable(false);
      setDisableCode('');
      toast('2FA disabled', 'success');
    } catch (err) {
      toast(getErrorMessage(err, 'Failed to disable 2FA'), 'error');
    } finally {
      setDisabling(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/2" />
      </div>
    );
  }

  return (
    <>
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">🔐 {t('twoFactorAuth')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
          {t('twoFactorDesc')}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-slate-600'}`} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {enabled
                ? t('2faEnabled')
                : t('2faDisabled')}
            </span>
          </div>

          {enabled ? (
            <button
              type="button"
              onClick={() => setShowDisable(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition"
            >
              {t('disable2fa')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartEnable}
              disabled={enabling}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
            >
              {enabling ? tc('loading') : t('enable2fa')}
            </button>
          )}
        </div>
      </div>

      {/* ─── Enable Modal ─── */}
      {showEnable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={handleCloseEnable} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            {step === 'qr' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('scanQrCode')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                  {t('scanQrDesc')}
                </p>

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  {qrCode ? (
                    /* eslint-disable-next-line @next/next/no-img-element -- QR data URI, next/image unsupported */
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 rounded-lg" />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-slate-400 text-sm">
                      Loading QR...
                    </div>
                  )}
                </div>

                {/* Manual secret */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{t('manualSecret')}</p>
                  <code className="block px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white break-all">
                    {secret}
                  </code>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('verify')}
                  className="w-full py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition"
                >
                  {t('next')} →
                </button>
              </>
            )}

            {step === 'verify' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('enterTotpCode')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                  {t('enterTotpDesc')}
                </p>

                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  autoFocus
                />

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep('qr')}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                  >
                    ← {tc('back')}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={enabling || totpCode.length !== 6}
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
                  >
                    {enabling ? tc('saving') : t('verify')}
                  </button>
                </div>
              </>
            )}

            {step === 'done' && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  ✅ {t('2faEnabledSuccess')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                  {t('backupCodesDesc')}
                </p>

                <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code) => (
                      <code key={code} className="text-sm font-mono text-gray-900 dark:text-white">{code}</code>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseEnable}
                  className="w-full py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition"
                >
                  {tc('done')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Disable Modal ─── */}
      {showDisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowDisable(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('disable2fa')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('disable2faDesc')}
            </p>

            <input
              type="text"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              autoFocus
            />

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowDisable(false); setDisableCode(''); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                {tc('cancel')}
              </button>
              <button
                type="button"
                onClick={handleDisable}
                disabled={disabling || disableCode.length !== 6}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
              >
                {disabling ? tc('saving') : t('disable2fa')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

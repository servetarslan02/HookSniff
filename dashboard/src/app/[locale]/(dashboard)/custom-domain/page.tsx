'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';

export default function CustomDomainPage() {
  const t = useTranslations('customDomain');
  const { token } = useAuth();
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [saving, setSaving] = useState(false);
  const [domainId, setDomainId] = useState<string | null>(null);
  const [status, setStatus] = useState<'none' | 'pending' | 'verified' | 'error'>('none');
  const [dnsRecords, setDnsRecords] = useState<{ type: string; name: string; value: string }[]>([]);
  const [existingDomains, setExistingDomains] = useState<Array<{ id: string; domain: string; verified: boolean; created_at: string }>>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);

  // Fetch existing domains on mount
  useState(() => {
    (async () => {
      if (!token) return;
      try {
        const domains = await apiFetch<Array<{ id: string; domain: string; verified: boolean; created_at: string }>>('/custom-domains', { token });
        setExistingDomains(domains);
      } catch {
        // Silent fail — domains list is not critical
      } finally {
        setLoadingDomains(false);
      }
    })();
  });

  const handleDeleteDomain = async (id: string) => {
    if (!token) return;
    try {
      await apiFetch(`/custom-domains/${id}`, { method: 'DELETE', token });
      setExistingDomains(prev => prev.filter(d => d.id !== id));
      toast(t('domainDeleted') || 'Domain removed', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : t('failedToDelete') || 'Failed to delete', 'error');
    }
  };

  const handleAddDomain = async () => {
    if (!domain || !token) return;
    setSaving(true);
    try {
      const data = await apiFetch<{ id: string; domain: string; cname_target: string; txt_record: string; instructions: Record<string, string> }>('/custom-domains', {
        method: 'POST',
        body: { domain },
        token,
      });
      setDomainId(data.id);
      setStatus('pending');
      setDnsRecords([
        { type: 'CNAME', name: domain, value: data.cname_target },
        { type: 'TXT', name: `_hooksniff.${domain}`, value: data.txt_record },
      ]);
      toast(t('domainAdded'), 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : t('failedToAdd'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    if (!token || !domainId) return;
    setSaving(true);
    try {
      const data = await apiFetch<{ verified: boolean; message?: string; issues?: string[]; hint?: string }>(`/custom-domains/${domainId}/verify`, {
        method: 'POST',
        token,
      });
      if (data.verified) {
        setStatus('verified');
        toast(data.message || t('domainVerified'), 'success');
      } else {
        setStatus('error');
        const issues = data.issues?.join(', ') || t('verificationFailedCheck');
        toast(`${t('verificationFailedPrefix')} ${issues}`, 'error');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : t('verificationFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Add Domain */}
      <div className="glass-card p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('addDomain')}</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ''))}
            placeholder={t('placeholder')}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
          />
          <button type="button"
            onClick={handleAddDomain}
            disabled={saving || !domain}
            className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
          >
            {t('addDomainBtn')}
          </button>
        </div>
      </div>

      {/* DNS Records */}
      {dnsRecords.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('dnsRecords')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
            {t('dnsRecordsDesc')}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('colType')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('colName')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('colValue')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('colCopy')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {dnsRecords.map((rec, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><span className="font-mono text-sm bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-sm">{rec.type}</span></td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-900 dark:text-white">{rec.name}</td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-slate-400 break-all">{rec.value}</td>
                    <td className="px-4 py-3">
                      <button type="button"
                        onClick={() => { navigator.clipboard.writeText(rec.value); toast(t('copied'), 'success'); }}
                        className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
                      >
                        {t('copy')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button"
              onClick={handleVerify}
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {saving ? t('verifying') : t('verifyDomain')}
            </button>
            {status === 'verified' && (
              <span className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                ✅ {t('verified')}
              </span>
            )}
            {status === 'error' && (
              <span className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                ❌ {t('verificationFailedCheck')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Existing Domains */}
      {!loadingDomains && existingDomains.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('existingDomains') || 'Your Domains'}</h2>
          <div className="space-y-3">
            {existingDomains.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${d.verified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="font-mono text-sm text-gray-900 dark:text-white">{d.domain}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${d.verified ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'}`}>
                    {d.verified ? (t('verified') || 'Verified') : (t('pending') || 'Pending')}
                  </span>
                </div>
                <button type="button"
                  onClick={() => handleDeleteDomain(d.id)}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  {t('delete') || 'Remove'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('howItWorks')}</h2>
        <div className="space-y-3">
          {[
            { step: '1', title: t('step1Title'), desc: t('step1Desc') },
            { step: '2', title: t('step2Title'), desc: t('step2Desc') },
            { step: '3', title: t('step3Title'), desc: t('step3Desc') },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm shrink-0">
                {item.step}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

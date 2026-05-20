'use client';


import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';
import { AlertTriangle, CheckCircle2, Clock, Globe, Lock, XCircle } from '@/components/icons';

interface ExistingDomain {
  id: string;
  domain: string;
  verified: boolean;
  ssl_active: boolean;
  cname_target: string;
  txt_record: string;
  verified_at: string | null;
  created_at: string;
}

export function CustomDomainContent() {
  const t = useTranslations('customDomain');
  const { token } = useAuth();
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [saving, setSaving] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<{ type: string; name: string; value: string }[]>([]);
  const [existingDomains, setExistingDomains] = useState<ExistingDomain[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [newDomainId, setNewDomainId] = useState<string | null>(null);
  const [newDomainStatus, setNewDomainStatus] = useState<'none' | 'pending' | 'verified' | 'error'>('none');

  // Fetch existing domains on mount
  const fetchDomains = useCallback(async () => {
    if (!token) return;
    try {
      setLoadError(false);
      const domains = await apiFetch<ExistingDomain[]>('/custom-domains', { token });
      setExistingDomains(domains);
    } catch {
      setLoadError(true);
    } finally {
      setLoadingDomains(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(t('copied'), 'success');
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      toast(t('copied'), 'success');
    }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!token) return;
    try {
      await apiFetch(`/custom-domains/${id}`, { method: 'DELETE', token });
      setExistingDomains(prev => prev.filter(d => d.id !== id));
      setDeleteConfirm(null);
      // Clear new domain state if we deleted the newly added one
      if (id === newDomainId) {
        setNewDomainId(null);
        setNewDomainStatus('none');
        setDnsRecords([]);
      }
      toast(t('domainDeleted'), 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : t('failedToDelete'), 'error');
    }
  };

  const handleAddDomain = async () => {
    if (!domain || !token) return;

    // Strip protocol prefix if user accidentally included it
    let cleanDomain = domain.trim();
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '');

    // Validate
    if (!cleanDomain.includes('.')) {
      toast(t('invalidDomain'), 'error');
      return;
    }
    if (cleanDomain.length > 253) {
      toast(t('invalidDomain'), 'error');
      return;
    }

    setSaving(true);
    try {
      const data = await apiFetch<{ id: string; domain: string; cname_target: string; txt_record: string }>('/custom-domains', {
        method: 'POST',
        body: { domain: cleanDomain },
        token,
      });
      setNewDomainId(data.id);
      setNewDomainStatus('pending');
      setDnsRecords([
        { type: 'CNAME', name: cleanDomain, value: data.cname_target },
        { type: 'TXT', name: `_hooksniff.${cleanDomain}`, value: data.txt_record },
      ]);
      setDomain('');
      toast(t('domainAdded'), 'success');
      // Refresh existing domains list
      fetchDomains();
    } catch (err) {
      toast(err instanceof Error ? err.message : t('failedToAdd'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    if (!token) return;
    setVerifyingId(domainId);
    try {
      const data = await apiFetch<{ verified: boolean; message?: string; issues?: string[]; hint?: string }>(`/custom-domains/${domainId}/verify`, {
        method: 'POST',
        token,
      });
      if (data.verified) {
        if (domainId === newDomainId) {
          setNewDomainStatus('verified');
        }
        // Refresh the full domain list from API to get correct ssl_active status
        fetchDomains();
        toast(data.message || t('domainVerified'), 'success');
      } else {
        if (domainId === newDomainId) {
          setNewDomainStatus('error');
        }
        const issues = data.issues?.join(', ') || t('verificationFailedCheck');
        const hint = data.hint ? ` ${data.hint}` : '';
        toast(`${t('verificationFailedPrefix')} ${issues}${hint}`, 'error');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : t('verificationFailed'), 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  // Build DNS records for an unverified existing domain
  const getDnsRecordsForDomain = (d: ExistingDomain) => [
    { type: 'CNAME', name: d.domain, value: d.cname_target, copyValue: d.cname_target },
    { type: 'TXT', name: `_hooksniff.${d.domain}`, value: d.txt_record, copyValue: d.txt_record },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
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
            onKeyDown={(e) => { if (e.key === 'Enter' && domain && !saving) handleAddDomain(); }}
          />
          <button type="button"
            onClick={handleAddDomain}
            disabled={saving || !domain}
            className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
          >
            {saving ? t('adding') : t('addDomainBtn')}
          </button>
        </div>
      </div>

      {/* DNS Records for newly added domain */}
      {dnsRecords.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('dnsRecords')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('dnsRecordsDesc')}</p>
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
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-gray-900 dark:text-white">{rec.name}</span>
                      <button type="button" onClick={() => handleCopy(rec.name)} className="text-brand-600 dark:text-brand-400 text-xs hover:underline ml-2">
                        {t('copy')}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-slate-400 break-all">{rec.value}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => handleCopy(rec.value)} className="text-brand-600 dark:text-brand-400 text-sm hover:underline">
                        {t('copy')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 dark:text-slate-500 mt-3 mb-4">
            <Clock size={14} className="inline mr-1 -mt-0.5 text-gray-500" /> {t('dnsPropagationHint')}
          </p>

          <div className="flex gap-3 items-center">
            {newDomainId && (
              <button type="button"
                onClick={() => handleVerify(newDomainId)}
                disabled={verifyingId === newDomainId}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {verifyingId === newDomainId ? t('verifying') : t('verifyDomain')}
              </button>
            )}
            {newDomainStatus === 'verified' && (
              <span className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                <CheckCircle2 size={16} strokeWidth={1.75} className="inline mr-1" /> {t('verified')}
              </span>
            )}
            {newDomainStatus === 'error' && (
              <span className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                <XCircle size={16} strokeWidth={1.75} className="inline mr-1" /> {t('verificationFailedCheck')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Existing Domains — Loading */}
      {loadingDomains && (
        <div className="glass-card p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      )}

      {/* Existing Domains — Load Error */}
      {!loadingDomains && loadError && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <span className="text-lg"><AlertTriangle size={18} strokeWidth={1.75} /></span>
            <div>
              <p className="font-medium">{t('loadError')}</p>
              <button type="button" onClick={fetchDomains} className="text-sm text-brand-600 dark:text-brand-400 hover:underline mt-1">
                {t('retry')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Domains — Empty State */}
      {!loadingDomains && !loadError && existingDomains.length === 0 && !newDomainId && (
        <div className="glass-card p-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-3"><Globe size={18} strokeWidth={1.75} /></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('noDomains')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('noDomainsDesc')}</p>
          </div>
        </div>
      )}

      {/* Existing Domains — List */}
      {!loadingDomains && existingDomains.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('existingDomains')}</h2>
          <div className="space-y-3">
            {existingDomains.map((d) => (
              <div key={d.id} className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                {/* Domain header */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${d.verified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="font-mono text-sm text-gray-900 dark:text-white truncate">{d.domain}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${d.verified
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                      }`}>
                      {d.verified ? t('verified') : t('pending')}
                    </span>
                    {d.verified && d.ssl_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shrink-0">
                        <Lock size={16} strokeWidth={1.75} className="inline mr-1" /> SSL
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    {!d.verified && (
                      <button type="button"
                        onClick={() => handleVerify(d.id)}
                        disabled={verifyingId === d.id}
                        className="text-xs text-green-600 dark:text-green-400 hover:underline disabled:opacity-50"
                      >
                        {verifyingId === d.id ? t('verifying') : t('verifyDomain')}
                      </button>
                    )}
                    {deleteConfirm === d.id ? (
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => handleDeleteDomain(d.id)}
                          className="text-xs text-red-600 dark:text-red-400 font-medium px-2 py-1 bg-red-50 dark:bg-red-500/10 rounded-lg">
                          {t('confirmDelete')}
                        </button>
                        <button type="button" onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-gray-500 px-2 py-1 hover:text-gray-700">
                          {t('cancel')}
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setDeleteConfirm(d.id)}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline">
                        {t('delete')}
                      </button>
                    )}
                  </div>
                </div>

                {/* DNS details for unverified domains */}
                {!d.verified && (
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800 space-y-2">
                    <p className="text-xs text-gray-500 dark:text-slate-400">{t('dnsRecordsDesc')}</p>
                    {getDnsRecordsForDomain(d).map((rec, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-sm text-gray-600 dark:text-slate-400">{rec.type}</span>
                        <span className="font-mono text-gray-900 dark:text-white">{rec.name}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-mono text-gray-600 dark:text-slate-400 truncate max-w-[200px]">{rec.value}</span>
                        <button type="button" onClick={() => handleCopy(rec.copyValue)} className="text-brand-600 dark:text-brand-400 hover:underline ml-1 shrink-0">
                          {t('copy')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

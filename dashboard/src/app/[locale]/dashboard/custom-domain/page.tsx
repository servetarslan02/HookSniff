'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';

export default function CustomDomainPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'none' | 'pending' | 'verified' | 'error'>('none');
  const [dnsRecords, setDnsRecords] = useState<{ type: string; name: string; value: string }[]>([]);

  const handleAddDomain = async () => {
    if (!domain || !token) return;
    setSaving(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
      const res = await fetch(`${API}/custom-domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ domain }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus('pending');
        setDnsRecords(data.dns_records || [
          { type: 'CNAME', name: domain, value: 'portal.hooksniff.dev' },
          { type: 'TXT', name: `_hooksniff.${domain}`, value: `hooksniff-verify=${data.verification_token || 'abc123'}` },
        ]);
        toast('Domain added! Add the DNS records below.', 'success');
      } else {
        toast('Failed to add domain', 'error');
      }
    } catch {
      toast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
      const res = await fetch(`${API}/custom-domains/${domain}/verify`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setStatus('verified');
        toast('Domain verified! SSL certificate provisioning...', 'success');
      } else {
        setStatus('error');
        toast('Verification failed. Check DNS records.', 'error');
      }
    } catch {
      toast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🌐 Custom Domain</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Use your own domain for the webhook portal. White-label your customers&apos; experience.
        </p>
      </div>

      {/* Add Domain */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Domain</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ''))}
            placeholder="webhooks.yourcompany.com"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
          />
          <button
            onClick={handleAddDomain}
            disabled={saving || !domain}
            className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
          >
            Add Domain
          </button>
        </div>
      </div>

      {/* DNS Records */}
      {dnsRecords.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">DNS Records</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
            Add these records to your DNS provider (Cloudflare, Route53, etc.)
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Copy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {dnsRecords.map((rec, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><span className="font-mono text-sm bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">{rec.type}</span></td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-900 dark:text-white">{rec.name}</td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-slate-400 break-all">{rec.value}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { navigator.clipboard.writeText(rec.value); toast('Copied!', 'success'); }}
                        className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
                      >
                        📋 Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleVerify}
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {saving ? 'Verifying...' : '✓ Verify Domain'}
            </button>
            {status === 'verified' && (
              <span className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                ✅ Verified! SSL provisioning...
              </span>
            )}
            {status === 'error' && (
              <span className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                ❌ Verification failed — check DNS records
              </span>
            )}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">How it works</h2>
        <div className="space-y-3">
          {[
            { step: '1', title: 'Add your domain', desc: 'Enter the domain you want to use (e.g., webhooks.yourcompany.com)' },
            { step: '2', title: 'Add DNS records', desc: 'We\'ll give you CNAME and TXT records to add to your DNS provider' },
            { step: '3', title: 'Verify & go live', desc: 'We verify ownership and automatically provision an SSL certificate' },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
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

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SettingsPage() {
  const { token, apiKey, setApiKey, user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://myapp.com/webhooks');
  const [saving, setSaving] = useState(false);

  const displayKey = apiKey || 'hr_live_not_configured';
  const maskedKey = showKey ? displayKey : displayKey.slice(0, 12) + '••••••••';

  const copyKey = () => {
    navigator.clipboard.writeText(displayKey);
    setCopied(true);
    toast('API key copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
      const res = await fetch(`${API_BASE}/auth/regenerate-key`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to regenerate key');
      const data = await res.json();
      setApiKey(data.api_key);
      toast('API key regenerated!', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to regenerate key', 'error');
    } finally {
      setRegenerating(false);
      setShowRegenerate(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      // Mock save - in production this would call the API
      await new Promise((r) => setTimeout(r, 800));
      toast('Configuration saved!', 'success');
    } catch {
      toast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const plan = user?.plan || 'free';
  const planDetails: Record<string, { name: string; limit: string; features: string[] }> = {
    free: { name: 'Free', limit: '1,000 webhooks/month', features: ['100 requests/min', '3 retry attempts', 'Community support'] },
    pro: { name: 'Pro', limit: '50,000 webhooks/month', features: ['1,000 requests/min', '5 retry attempts', 'Priority support', 'Custom domains'] },
    business: { name: 'Business', limit: '500,000 webhooks/month', features: ['10,000 requests/min', '10 retry attempts', 'Dedicated support', 'SLA guarantee'] },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* API Key */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Key</h2>
        <p className="text-sm text-gray-600 mb-4">
          Use this key to authenticate API requests. Pass it as a Bearer token in the Authorization header.
        </p>
        <div className="flex gap-2 items-center">
          <code className="flex-1 bg-gray-100 px-4 py-3 rounded-xl text-sm font-mono truncate">
            {maskedKey}
          </code>
          <button
            onClick={() => setShowKey(!showKey)}
            className="px-3 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition"
            title={showKey ? 'Hide' : 'Reveal'}
          >
            {showKey ? '🙈' : '👁️'}
          </button>
          <button
            onClick={copyKey}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button
            onClick={() => setShowRegenerate(true)}
            className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm hover:bg-red-100 transition"
          >
            Regenerate
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">⚠️ Rotating your key will immediately invalidate the old one.</p>
      </div>

      {/* Plan */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-block bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1 rounded-full">
              {planDetails[plan].name}
            </span>
            <p className="text-sm text-gray-500 mt-2">{planDetails[plan].limit}</p>
            <ul className="mt-2 space-y-1">
              {planDetails[plan].features.map((f) => (
                <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          {plan !== 'business' && (
            <a
              href="/dashboard/billing"
              className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition"
            >
              Upgrade →
            </a>
          )}
        </div>
      </div>

      {/* Webhook Config */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhook Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Retry Policy</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500">
              <option>Exponential backoff (default)</option>
              <option>Linear backoff</option>
              <option>Fixed interval</option>
            </select>
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? <><LoadingSpinner size="sm" /> Saving...</> : 'Save Configuration'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showRegenerate}
        title="Regenerate API Key"
        message="Your current API key will be immediately invalidated. All integrations using the old key will stop working. Are you sure?"
        confirmLabel="Regenerate Key"
        variant="danger"
        onConfirm={handleRegenerate}
        onCancel={() => setShowRegenerate(false)}
        loading={regenerating}
      />
    </div>
  );
}

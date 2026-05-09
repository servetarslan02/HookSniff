'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';

/* ─── Types ─── */
interface GlobalRetryPolicy {
  default_max_attempts: number;
  default_backoff: 'exponential' | 'linear' | 'fixed';
  default_initial_delay_secs: number;
  default_max_delay_secs: number;
  dead_letter_queue_enabled: boolean;
  dead_letter_queue_max_age_hours: number;
  retry_on_status_codes: number[];
  timeout_secs: number;
}

const DEFAULT_POLICY: GlobalRetryPolicy = {
  default_max_attempts: 5,
  default_backoff: 'exponential',
  default_initial_delay_secs: 10,
  default_max_delay_secs: 3600,
  dead_letter_queue_enabled: true,
  dead_letter_queue_max_age_hours: 72,
  retry_on_status_codes: [408, 429, 500, 502, 503, 504],
  timeout_secs: 30,
};

const BACKOFF_OPTIONS = [
  { value: 'exponential', label: 'Exponential', desc: 'Delay doubles each attempt (10s → 20s → 40s → 80s...)' },
  { value: 'linear', label: 'Linear', desc: 'Delay increases linearly (10s → 20s → 30s → 40s...)' },
  { value: 'fixed', label: 'Fixed', desc: 'Same delay every attempt (10s → 10s → 10s...)' },
];

const STATUS_CODES = [
  { code: 408, label: '408 Request Timeout' },
  { code: 429, label: '429 Too Many Requests' },
  { code: 500, label: '500 Internal Server Error' },
  { code: 502, label: '502 Bad Gateway' },
  { code: 503, label: '503 Service Unavailable' },
  { code: 504, label: '504 Gateway Timeout' },
];

export default function RetryPolicyPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [policy, setPolicy] = useState<GlobalRetryPolicy>(DEFAULT_POLICY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPolicy = useCallback(async () => {
    if (!token) return;
    try {
      try {
        const data = await apiFetch<GlobalRetryPolicy>('/settings/retry-policy', { token });
        setPolicy({ ...DEFAULT_POLICY, ...data });
      } catch {
        // Try localStorage fallback
        try {
          const saved = localStorage.getItem('hooksniff_retry_policy');
          if (saved) setPolicy({ ...DEFAULT_POLICY, ...JSON.parse(saved) });
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPolicy(); }, [fetchPolicy]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiFetch('/settings/retry-policy', { method: 'PUT', body: policy, token });
      toast('Retry policy saved!', 'success');
    } catch {
      // Backend endpoint may not exist — save to localStorage as fallback
      try { localStorage.setItem('hooksniff_retry_policy', JSON.stringify(policy)); } catch {}
      toast('Retry policy saved locally (backend endpoint pending)', 'success');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatusCode = (code: number) => {
    const codes = policy.retry_on_status_codes.includes(code)
      ? policy.retry_on_status_codes.filter((c) => c !== code)
      : [...policy.retry_on_status_codes, code];
    setPolicy({ ...policy, retry_on_status_codes: codes });
  };

  // Calculate delay preview
  const getDelayPreview = () => {
    const delays: number[] = [];
    let delay = policy.default_initial_delay_secs;
    for (let i = 0; i < policy.default_max_attempts; i++) {
      delays.push(delay);
      if (policy.default_backoff === 'exponential') delay = Math.min(delay * 2, policy.default_max_delay_secs);
      else if (policy.default_backoff === 'linear') delay = Math.min(delay + policy.default_initial_delay_secs, policy.default_max_delay_secs);
      // fixed: delay stays the same
    }
    return delays;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔄 Retry Policy</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Configure global retry behavior for webhook deliveries. Per-endpoint overrides take precedence.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Retry Settings */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Retry Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Max Attempts</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={policy.default_max_attempts}
                  onChange={(e) => setPolicy({ ...policy, default_max_attempts: parseInt(e.target.value) || 5 })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Backoff Strategy</label>
                <div className="space-y-2">
                  {BACKOFF_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition ${
                        policy.default_backoff === opt.value
                          ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20'
                          : 'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <input
                        type="radio"
                        name="backoff"
                        value={opt.value}
                        checked={policy.default_backoff === opt.value}
                        onChange={(e) => setPolicy({ ...policy, default_backoff: e.target.value as GlobalRetryPolicy['default_backoff'] })}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{opt.label}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Initial Delay (sec)</label>
                  <input
                    type="number"
                    min={1}
                    value={policy.default_initial_delay_secs}
                    onChange={(e) => setPolicy({ ...policy, default_initial_delay_secs: parseInt(e.target.value) || 10 })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Max Delay (sec)</label>
                  <input
                    type="number"
                    min={1}
                    value={policy.default_max_delay_secs}
                    onChange={(e) => setPolicy({ ...policy, default_max_delay_secs: parseInt(e.target.value) || 3600 })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Request Timeout (sec)</label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={policy.timeout_secs}
                  onChange={(e) => setPolicy({ ...policy, timeout_secs: parseInt(e.target.value) || 30 })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Dead Letter Queue */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dead Letter Queue</h2>
            <label className="flex items-center justify-between cursor-pointer mb-4">
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">Enable DLQ</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">Move permanently failed deliveries to DLQ</div>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors ${policy.dead_letter_queue_enabled ? 'bg-brand-600' : 'bg-gray-300 dark:bg-slate-600'} relative`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${policy.dead_letter_queue_enabled ? 'translate-x-5' : 'translate-x-0.5'} absolute top-0.5`} />
                <input
                  type="checkbox"
                  checked={policy.dead_letter_queue_enabled}
                  onChange={(e) => setPolicy({ ...policy, dead_letter_queue_enabled: e.target.checked })}
                  className="sr-only"
                />
              </div>
            </label>
            {policy.dead_letter_queue_enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Max Age (hours)</label>
                <input
                  type="number"
                  min={1}
                  value={policy.dead_letter_queue_max_age_hours}
                  onChange={(e) => setPolicy({ ...policy, dead_letter_queue_max_age_hours: parseInt(e.target.value) || 72 })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Retry on Status Codes */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Retry on Status Codes</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Webhooks that return these HTTP status codes will be retried.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_CODES.map((sc) => (
                <label
                  key={sc.code}
                  className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition ${
                    policy.retry_on_status_codes.includes(sc.code)
                      ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20'
                      : 'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={policy.retry_on_status_codes.includes(sc.code)}
                    onChange={() => toggleStatusCode(sc.code)}
                    className="w-4 h-4 rounded text-brand-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">{sc.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="glass-card p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Delay Preview</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              How delays will look with current settings:
            </p>
            <div className="space-y-2">
              {getDelayPreview().map((delay, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-slate-400 w-20">Attempt {i + 1}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${Math.min((delay / policy.default_max_delay_secs) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-gray-700 dark:text-slate-300 w-20 text-right">
                    {delay < 60 ? `${delay}s` : `${Math.round(delay / 60)}m`}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <div className="text-sm text-gray-500 dark:text-slate-400 mb-2">Total retry time (worst case):</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(() => {
                  const total = getDelayPreview().reduce((a, b) => a + b, 0);
                  if (total < 60) return `${total}s`;
                  if (total < 3600) return `${Math.round(total / 60)}m`;
                  return `${(total / 3600).toFixed(1)}h`;
                })()}
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                💡 <strong>Tip:</strong> Per-endpoint retry policies override these global defaults. 
                Configure them in <a href="/dashboard/endpoints" className="underline">Endpoint Settings</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

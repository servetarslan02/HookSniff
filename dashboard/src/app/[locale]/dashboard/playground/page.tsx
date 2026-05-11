'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');

const ENDPOINT_PATHS: Record<string, string> = {
  'List Endpoints': '/endpoints',
  'List Deliveries': '/webhooks',
  'Get Stats': '/stats',
};

// ─── AI Payload Templates ───
const AI_PAYLOAD_TEMPLATES: Record<string, () => object> = {
  'order.created': () => ({
    event: 'order.created',
    data: {
      order_id: `ord_${Date.now().toString(36)}`,
      customer: {
        id: `cus_${Math.random().toString(36).slice(2, 10)}`,
        email: 'jane.doe@example.com',
        name: 'Jane Doe',
      },
      items: [
        { sku: 'WIDGET-001', name: 'Premium Widget', quantity: 2, unit_price: 29.99 },
        { sku: 'GADGET-042', name: 'Super Gadget', quantity: 1, unit_price: 149.99 },
      ],
      total: 209.97,
      currency: 'USD',
      shipping_method: 'express',
      created_at: new Date().toISOString(),
    },
  }),
  'order.completed': () => ({
    event: 'order.completed',
    data: {
      order_id: `ord_${Date.now().toString(36)}`,
      status: 'completed',
      completed_at: new Date().toISOString(),
      total_charged: 209.97,
      payment_method: 'visa_ending_4242',
    },
  }),
  'payment.failed': () => ({
    event: 'payment.failed',
    data: {
      payment_id: `pay_${Math.random().toString(36).slice(2, 10)}`,
      order_id: `ord_${Date.now().toString(36)}`,
      amount: 99.99,
      currency: 'USD',
      error: {
        code: 'card_declined',
        message: 'Your card was declined. Please try a different payment method.',
        decline_code: 'insufficient_funds',
      },
      customer_id: `cus_${Math.random().toString(36).slice(2, 10)}`,
      attempted_at: new Date().toISOString(),
    },
  }),
  'payment.succeeded': () => ({
    event: 'payment.succeeded',
    data: {
      payment_id: `pay_${Math.random().toString(36).slice(2, 10)}`,
      amount: 149.99,
      currency: 'USD',
      method: 'card',
      card_brand: 'visa',
      card_last4: '4242',
      receipt_url: 'https://pay.stripe.com/receipts/...',
      paid_at: new Date().toISOString(),
    },
  }),
  'user.registered': () => ({
    event: 'user.registered',
    data: {
      user_id: `usr_${Math.random().toString(36).slice(2, 10)}`,
      email: 'new.user@example.com',
      name: 'Alex Smith',
      plan: 'pro',
      registered_at: new Date().toISOString(),
      source: 'organic',
    },
  }),
  'user.updated': () => ({
    event: 'user.updated',
    data: {
      user_id: `usr_${Math.random().toString(36).slice(2, 10)}`,
      changes: {
        plan: { old: 'free', new: 'pro' },
        email: { old: 'old@example.com', new: 'new@example.com' },
      },
      updated_at: new Date().toISOString(),
    },
  }),
  'invoice.created': () => ({
    event: 'invoice.created',
    data: {
      invoice_id: `inv_${Math.random().toString(36).slice(2, 10)}`,
      customer_id: `cus_${Math.random().toString(36).slice(2, 10)}`,
      amount_due: 49.99,
      currency: 'USD',
      period_start: new Date(Date.now() - 30 * 86400000).toISOString(),
      period_end: new Date().toISOString(),
      status: 'open',
    },
  }),
};

// ─── History types ───
interface PlaygroundRequest {
  id: string;
  method: string;
  path: string;
  body: string;
  status: number | null;
  response: unknown;
  timestamp: string;
  duration_ms: number;
  headers?: Record<string, string>;
}

const HISTORY_KEY = 'hooksniff_playground_history';
const MAX_HISTORY = 10;

function loadHistory(): PlaygroundRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: PlaygroundRequest[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

// ─── Response Inspector ───
function ResponseInspector({
  response,
  status,
  headers,
  duration,
}: {
  response: unknown;
  status: number | null;
  headers: Record<string, string>;
  duration: number | null;
}) {
  const t = useTranslations('playground');
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  if (!response && !status) {
    return (
      <div className="text-center text-gray-400 dark:text-slate-500 py-16">
        <div className="text-4xl mb-3">🧪</div>
        <p>{t('sendToInspect')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {status && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              status < 300
                ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400'
                : status < 400
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
                  : status < 500
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'
            }`}
          >
            {status} {status < 300 ? 'OK' : status < 400 ? 'Redirect' : status < 500 ? 'Client Error' : 'Server Error'}
          </span>
        )}
        {duration !== null && (
          <span className="text-sm text-gray-500 dark:text-slate-400">
            ⏱ {duration}ms
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-slate-700">
        {(['body', 'headers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-[400px]">
        {activeTab === 'body'
          ? JSON.stringify(response, null, 2)
          : Object.entries(headers)
              .map(([k, v]) => `${k}: ${v}`)
              .join('\n') || t('noHeaders')}
      </pre>
    </div>
  );
}

// ─── History Panel ───
function HistoryPanel({
  history,
  onSelect,
  onClear,
}: {
  history: PlaygroundRequest[];
  onSelect: (req: PlaygroundRequest) => void;
  onClear: () => void;
}) {
  const t = useTranslations('playground');
  if (history.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('requestHistory')}</h3>
        <p className="text-xs text-gray-400 dark:text-slate-500">{t('noRequests')}</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('requestHistory')}</h3>
        <button
          onClick={onClear}
          className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 transition"
        >
          Clear
        </button>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {history.map((req) => (
          <button
            key={req.id}
            onClick={() => onSelect(req)}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                    req.method === 'GET'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      : req.method === 'POST'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                        : req.method === 'DELETE'
                          ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {req.method}
                </span>
                <span className="text-xs font-mono text-gray-600 dark:text-slate-400 truncate max-w-[140px]">
                  {req.path}
                </span>
              </div>
              <span
                className={`text-xs font-mono ${
                  req.status && req.status < 400
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {req.status ?? '—'}
              </span>
            </div>
            <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
              {new Date(req.timestamp).toLocaleString()} • {req.duration_ms}ms
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Live Request Viewer ───
function LiveRequestViewer() {
  const t = useTranslations('playground');
  const [liveDeliveries, setLiveDeliveries] = useState<
    Array<{ id: string; event: string; status: string; time: string }>
  >([]);
  const [isLive, setIsLive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLive = useCallback(async () => {
    setIsLive(true);
    // Poll for recent deliveries
    const poll = async () => {
      try {
        const data = await apiFetch<{ deliveries?: Array<Record<string, unknown>> }>('/webhooks?page=1', { token: token || undefined });
        const recent = (data.deliveries || []).slice(0, 5).map((d) => ({
          id: String(d.id).slice(0, 10),
          event: String(d.event || 'webhook'),
          status: String(d.status),
          time: new Date(String(d.created_at)).toLocaleTimeString(),
        }));
        setLiveDeliveries(recent);
      } catch {
        // Live polling — silently retry on next interval
      }
    };
    poll();
    intervalRef.current = setInterval(poll, 3000);
  }, []);

  const stopLive = useCallback(() => {
    setIsLive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('liveViewer')}</h3>
        <button
          onClick={isLive ? stopLive : startLive}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            isLive
              ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
              : 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
          }`}
        >
          {isLive ? t('stop') : t('startLive')}
        </button>
      </div>
      {isLive && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600 dark:text-green-400">{t('watchingDeliveries')}</span>
        </div>
      )}
      {liveDeliveries.length > 0 ? (
        <div className="space-y-2">
          {liveDeliveries.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    d.status === 'delivered'
                      ? 'bg-green-500'
                      : d.status === 'failed'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  }`}
                />
                <span className="text-xs font-mono text-gray-700 dark:text-slate-300">{d.event}</span>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-slate-500">{d.time}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 dark:text-slate-500">
          {isLive ? t('waitingRequests') : t('clickStart')}
        </p>
      )}
    </div>
  );
}

// ─── Main Playground Page ───
export default function PlaygroundPage() {
  const { apiKey, token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('playground');
  const [method, setMethod] = useState<string>('POST');
  const [path, setPath] = useState('/webhooks');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<unknown>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseDuration, setResponseDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [history, setHistory] = useState<PlaygroundRequest[]>([]);
  const [_showAiGenerator, setShowAiGenerator] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const headers = {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  };

  const curlCommand = `curl -X ${method} ${API_BASE}${path} \\
${Object.entries(headers)
  .map(([k, v]) => `  -H "${k}: ${v}"`)
  .join(' \\\n')}${method !== 'GET' && body ? ` \\
  -d '${body}'` : ''}`;

  const handlePreset = (preset: string) => {
    setSelectedPreset(preset);
    const p = ENDPOINT_PATHS[preset];
    if (p) {
      setPath(p);
      setMethod('GET');
      setBody('');
    }
  };

  const handleAiGenerate = (eventType: string) => {
    const generator = AI_PAYLOAD_TEMPLATES[eventType];
    if (generator) {
      const payload = generator();
      setBody(JSON.stringify(payload, null, 2));
      setMethod('POST');
      setShowAiGenerator(false);
      toast(`Generated ${eventType} payload`, 'success');
    }
  };

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    setResponseStatus(null);
    setResponseHeaders({});
    setResponseDuration(null);

    const startTime = performance.now();
    const capturedHeaders: Record<string, string> = {};

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: method !== 'GET' && body ? body : undefined,
      });

      const duration = Math.round(performance.now() - startTime);
      setResponseStatus(res.status);
      setResponseDuration(duration);

      // Capture response headers
      res.headers.forEach((value, key) => {
        capturedHeaders[key] = value;
      });
      setResponseHeaders(capturedHeaders);

      const data = await res.json().catch(() => null);
      setResponse(data);

      // Save to history
      const entry: PlaygroundRequest = {
        id: Date.now().toString(36),
        method,
        path,
        body,
        status: res.status,
        response: data,
        timestamp: new Date().toISOString(),
        duration_ms: duration,
        headers: capturedHeaders,
      };
      const newHistory = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(newHistory);
      saveHistory(newHistory);
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - startTime);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setResponse({ error: errorMessage });
      setResponseDuration(duration);

      const entry: PlaygroundRequest = {
        id: Date.now().toString(36),
        method,
        path,
        body,
        status: null,
        response: { error: errorMessage },
        timestamp: new Date().toISOString(),
        duration_ms: duration,
      };
      const newHistory = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(newHistory);
      saveHistory(newHistory);
    } finally {
      setLoading(false);
    }
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    toast(t('curlCopied'), 'success');
  };

  const selectFromHistory = (req: PlaygroundRequest) => {
    setMethod(req.method);
    setPath(req.path);
    setBody(req.body);
    setResponse(req.response);
    setResponseStatus(req.status);
    setResponseHeaders(req.headers || {});
    setResponseDuration(req.duration_ms);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    toast(t('historyCleared'), 'info');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('request')}</h2>

            {/* AI Payload Generator */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                🤖 AI Payload Generator
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(AI_PAYLOAD_TEMPLATES).map((eventType) => (
                  <button
                    key={eventType}
                    onClick={() => handleAiGenerate(eventType)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/20 transition"
                  >
                    {eventType}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('quickPresets')}</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(ENDPOINT_PATHS).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePreset(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedPreset === preset
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Method + Path */}
            <div className="flex gap-2 mb-4">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                placeholder="/v1/endpoints"
              />
            </div>

            {/* Headers */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Headers (auto-added)
              </label>
              <pre className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl text-xs font-mono text-gray-600 dark:text-slate-400 overflow-x-auto">
                {JSON.stringify(headers, null, 2)}
              </pre>
            </div>

            {/* Body */}
            {method !== 'GET' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('requestBody')}</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 resize-none"
                  placeholder='{"key": "value"}'
                  spellCheck={false}
                />
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" /> Sending...
                </>
              ) : (
                t('sendRequest')
              )}
            </button>
          </div>

          {/* cURL Generator */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('curlCommand')}</h3>
              <button
                onClick={copyCurl}
                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
              >
                📋 Copy
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono overflow-x-auto">
              {curlCommand}
            </pre>
          </div>

          {/* Live Request Viewer */}
          <LiveRequestViewer />
        </div>

        {/* Response + History */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('responseInspector')}</h2>
            <ResponseInspector
              response={response}
              status={responseStatus}
              headers={responseHeaders}
              duration={responseDuration}
            />
          </div>

          {/* History */}
          <HistoryPanel history={history} onSelect={selectFromHistory} onClear={clearHistory} />
        </div>
      </div>
    </div>
  );
}

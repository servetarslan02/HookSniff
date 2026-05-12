'use client';

import { useTranslations } from 'next-intl';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

/* ─── Tab Types ─── */
type PlaygroundTab = 'playground' | 'api';

/* ─── Types ─── */

type WebhookRecord = {
  id: string;
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: string | null;
  body_json: unknown;
  content_type: string | null;
  content_length: number;
  ip: string;
  user_agent: string | null;
  timestamp: string;
};

type PlaygroundState = 'idle' | 'generating' | 'ready' | 'error';

/* ─── Sample Payloads ─── */

const samplePayloads = [
  { name: 'Order Created', event: 'order.created', payload: JSON.stringify({ order_id: 'ord_123', total: 49.99, currency: 'USD', customer_id: 'cus_abc', items: [{ sku: 'HOOK-001', qty: 2 }] }, null, 2) },
  { name: 'Payment Completed', event: 'payment.completed', payload: JSON.stringify({ payment_id: 'pay_xyz', amount: 99.00, currency: 'USD', status: 'succeeded', method: 'card' }, null, 2) },
  { name: 'User Signup', event: 'user.created', payload: JSON.stringify({ user_id: 'usr_456', email: 'dev@example.com', plan: 'pro', created_at: new Date().toISOString() }, null, 2) },
  { name: 'AI Agent Task', event: 'agent.task_completed', payload: JSON.stringify({ agent_id: 'agent_789', task_id: 'task_001', status: 'success', tokens_used: 15420, latency_ms: 3200 }, null, 2) },
];

/* ─── Main Page ─── */

export function PlaygroundPageContent() {
  const t = useTranslations('playgroundPublic');
  // State
  const [activeTab, setActiveTab] = useState<PlaygroundTab>('playground');
  const [state, setState] = useState<PlaygroundState>('idle');
  const [token, setToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [history, setHistory] = useState<WebhookRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<WebhookRecord | null>(null);
  const [polling, setPolling] = useState(false);
  const [lastPoll, setLastPoll] = useState<string>('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [apiCopied, setApiCopied] = useState<string | null>(null);

  // Send test form
  const [sendEvent, setSendEvent] = useState('order.created');
  const [sendPayload, setSendPayload] = useState(samplePayloads[0].payload);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ status: number; time: number } | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ─── Generate Token ─── */

  const generateToken = useCallback(async () => {
    setState('generating');
    setError('');
    try {
      const res = await fetch('/api/playground/token', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setWebhookUrl(data.url);
        setState('ready');
        // Store in localStorage for session persistence
        localStorage.setItem('hooksniff_playground_token', data.token);
        localStorage.setItem('hooksniff_playground_url', data.url);
      } else {
        setError(data.error || 'Failed to generate token');
        setState('error');
      }
    } catch {
      setError('Network error — check your connection');
      setState('error');
    }
  }, []);

  /* ─── Restore from localStorage ─── */

  useEffect(() => {
    const savedToken = localStorage.getItem('hooksniff_playground_token');
    const savedUrl = localStorage.getItem('hooksniff_playground_url');
    if (savedToken && savedUrl) {
      setToken(savedToken);
      setWebhookUrl(savedUrl);
      setState('ready');
    }
  }, []);

  /* ─── Poll History ─── */

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      const url = lastPoll
        ? `/api/playground/history/${token}?since=${encodeURIComponent(lastPoll)}`
        : `/api/playground/history/${token}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setHistory((prev) => {
          const existing = new Set(prev.map((r) => r.id));
          const newRecords = data.data.filter((r: WebhookRecord) => !existing.has(r.id));
          return [...newRecords, ...prev].slice(0, 100);
        });
        setLastPoll(data.data[0]?.timestamp || lastPoll);
      }
    } catch {
      // Silent fail — polling will retry
    }
  }, [token, lastPoll]);

  // Start/stop polling (only on playground tab)
  useEffect(() => {
    if (state === 'ready' && token && activeTab === 'playground') {
      // Initial fetch
      fetchHistory();
      // Poll every 2 seconds
      pollingRef.current = setInterval(fetchHistory, 2000);
      setPolling(true);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setPolling(false);
    };
  }, [state, token, fetchHistory, activeTab]);

  /* ─── Copy URL ─── */

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = webhookUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApiCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setApiCopied(id);
      setTimeout(() => setApiCopied(null), 2000);
    } catch {
      setApiCopied(null);
    }
  };

  /* ─── Send Test Webhook ─── */

  const handleSend = async () => {
    if (!webhookUrl) return;
    setSending(true);
    setSendResult(null);
    try {
      JSON.parse(sendPayload);
    } catch {
      setSendResult({ status: 0, time: 0 });
      setSending(false);
      return;
    }

    const start = Date.now();
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-HookSniff-Event': sendEvent },
        body: sendPayload,
      });
      setSendResult({ status: res.status, time: Date.now() - start });
    } catch {
      setSendResult({ status: 0, time: Date.now() - start });
    } finally {
      setSending(false);
    }
  };

  /* ─── Clear History ─── */

  const handleClear = async () => {
    if (!token) return;
    try {
      await fetch(`/api/playground/history/${token}`, { method: 'DELETE' });
      setHistory([]);
      setSelectedRecord(null);
      setLastPoll('');
    } catch {
      // Silent fail
    }
  };

  /* ─── New Session ─── */

  const handleNewSession = () => {
    localStorage.removeItem('hooksniff_playground_token');
    localStorage.removeItem('hooksniff_playground_url');
    setToken('');
    setWebhookUrl('');
    setHistory([]);
    setSelectedRecord(null);
    setLastPoll('');
    setState('idle');
  };

  /* ─── Format Helpers ─── */

  const formatHeaders = (headers: Record<string, string>) =>
    Object.entries(headers)
      .filter(([k]) => !k.startsWith('sec-') && k !== 'connection')
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

  const formatBody = (body: string | null) => {
    if (!body) return '(empty)';
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  };

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString();
    } catch {
      return ts;
    }
  };

  /* ─── Render ─── */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t("title")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("webhookPlayground")}</h1>
          <p className="text-gray-600 dark:text-slate-400">Get a unique URL, send webhooks, inspect requests in real-time. No signup required.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('playground')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'playground'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            🧪 Playground
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'api'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            ⚡ API Access
          </button>
        </div>

        {/* ─── API Access Tab ─── */}
        {activeTab === 'api' && (
          <ApiAccessSection
            token={token}
            webhookUrl={webhookUrl}
            apiCopied={apiCopied}
            onCopy={handleApiCopy}
          />
        )}

        {/* ─── Playground Tab ─── */}
        {activeTab === 'playground' && (<>
        {/* Idle State — Generate Token */}
        {state === 'idle' && (
          <div className="max-w-md mx-auto text-center py-16">
            <span className="text-6xl mb-4 block">🧪</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Test webhooks in real-time</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6">Get a unique URL that captures any HTTP request. Inspect headers, body, and signatures.</p>
            <button onClick={generateToken} className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
              Generate Webhook URL →
            </button>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-3">Free forever · No signup · Works with any service</p>
          </div>
        )}

        {/* Generating State */}
        {state === 'generating' && (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-slate-400">Generating your unique URL...</p>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="max-w-md mx-auto text-center py-16">
            <span className="text-5xl mb-4 block">⚠️</span>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button onClick={generateToken} className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
              Try Again
            </button>
          </div>
        )}

        {/* Ready State — Main Playground */}
        {state === 'ready' && (
          <div className="space-y-6">
            {/* URL Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 font-mono text-sm text-gray-900 dark:text-white overflow-x-auto">
                  <span className="text-emerald-500 shrink-0">●</span>
                  <span className="truncate">{webhookUrl}</span>
                </div>
                <button onClick={handleCopy} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${copied ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
                <button onClick={handleNewSession} className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                  New
                </button>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-slate-500">
                <span>{polling ? '🟢 Polling every 2s' : '⚪ Not polling'}</span>
                <span>·</span>
                <span>{history.length} request{history.length !== 1 ? 's' : ''} captured</span>
                <span>·</span>
                <span>Expires in 24h</span>
              </div>
            </div>

            {/* Send Test Webhook */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{t("sendTest")}</h3>
              <div className="grid md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-slate-500 mb-1">{t("eventType")}</label>
                  <input type="text" value={sendEvent} onChange={(e) => setSendEvent(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 dark:text-slate-500 mb-1">{t("quickSamples")}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {samplePayloads.map((s) => (
                      <button key={s.name} onClick={() => { setSendEvent(s.event); setSendPayload(s.payload); }} className={`px-2.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${sendEvent === s.event ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700'}`}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end">
                  <button onClick={handleSend} disabled={sending} className="w-full py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
                    {sending ? 'Sending...' : 'Send →'}
                  </button>
                </div>
              </div>
              {sendResult && (
                <div className={`mt-3 px-3 py-2 rounded-lg text-sm ${sendResult.status >= 200 && sendResult.status < 300 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                  {sendResult.status === 0 && sendResult.time === 0
                    ? '⚠️ Invalid JSON — check your payload'
                    : `Status: ${sendResult.status} · ${sendResult.time}ms`}
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Left: Request List */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Requests ({history.length})</h3>
                  {history.length > 0 && (
                    <button onClick={handleClear} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400">{t("clearAll")}</button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="flex items-center justify-center h-48 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-gray-500 dark:text-slate-600 text-sm mb-1">{t("noRequests")}</p>
                      <p className="text-gray-500 dark:text-slate-600 text-xs">{t("sendToUrl")}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {history.map((record) => (
                      <button
                        key={record.id}
                        onClick={() => setSelectedRecord(record)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedRecord?.id === record.id ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-300 dark:border-brand-500/40' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-500/20'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold ${record.method === 'POST' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : record.method === 'GET' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'}`}>
                            {record.method}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-slate-500 truncate font-mono">{record.path}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-600">
                          <span>{formatTime(record.timestamp)}</span>
                          <span>{record.content_length} bytes</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Request Detail */}
              <div className="lg:col-span-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{t("requestDetail")}</h3>

                {!selectedRecord ? (
                  <div className="flex items-center justify-center h-64 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                    <p className="text-gray-500 dark:text-slate-600 text-sm">{t("selectRequest")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Meta */}
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${selectedRecord.method === 'POST' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>
                        {selectedRecord.method}
                      </span>
                      <span className="text-sm font-mono text-gray-700 dark:text-slate-300 truncate">{selectedRecord.path}</span>
                      <span className="text-xs text-gray-500 dark:text-slate-600 ml-auto">{formatTime(selectedRecord.timestamp)}</span>
                    </div>

                    {/* Headers */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider">{t("headers")}</h4>
                      <div className="bg-gray-900 dark:bg-slate-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                        <pre className="text-xs text-gray-300 dark:text-slate-400 font-mono whitespace-pre-wrap">{formatHeaders(selectedRecord.headers)}</pre>
                      </div>
                    </div>

                    {/* Body */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider">{t("body")}</h4>
                      <div className="bg-gray-900 dark:bg-slate-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{formatBody(selectedRecord.body)}</pre>
                      </div>
                    </div>

                    {/* Signature */}
                    {selectedRecord.headers['svix-signature'] || selectedRecord.headers['x-hooksniff-signature'] ? (
                      <div className="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-lg border border-brand-200 dark:border-brand-500/20">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">🔐 Webhook Signature</h4>
                        <p className="text-xs font-mono text-gray-600 dark:text-slate-400 break-all">
                          {selectedRecord.headers['svix-signature'] || selectedRecord.headers['x-hooksniff-signature']}
                        </p>
                      </div>
                    ) : null}

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                        <p className="text-xs text-gray-500 dark:text-slate-500">{t("ipAddress")}</p>
                        <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedRecord.ip}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                        <p className="text-xs text-gray-500 dark:text-slate-500">Content-Length</p>
                        <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedRecord.content_length} bytes</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">💡 Works with any service</h4>
                <p className="text-xs text-blue-700 dark:text-blue-400">Stripe, GitHub, Shopify, Slack — if it sends HTTP requests, this captures it.</p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-300 mb-1">🔒 Secure by default</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">HTTPS included. Signatures captured. Data expires in 24 hours automatically.</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-lg border border-purple-200 dark:border-purple-500/20">
                <h4 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">⚡ Real-time</h4>
                <p className="text-xs text-purple-700 dark:text-purple-400">Polls every 2 seconds. New requests appear instantly in the list.</p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
              <p className="text-gray-600 dark:text-slate-400 mb-4">Like what you see? Sign up and send webhooks for real.</p>
              <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
                Start for free →
              </Link>
            </div>
          </div>
        )}
        </>)}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   API Access Section
   ═══════════════════════════════════════════════════════════════════ */

function ApiAccessSection({
  token,
  webhookUrl,
  apiCopied,
  onCopy,
}: {
  token: string;
  webhookUrl: string;
  apiCopied: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  const t = useTranslations('playgroundPublic');
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hooksniff.vercel.app';
  const exampleToken = token || 'hs_AbCdEfGhJkMnPqRsTuvw';
  const exampleUrl = webhookUrl || `${baseUrl}/api/playground/in/${exampleToken}`;

  const endpoints = [
    {
      method: 'POST',
      path: '/api/playground/token',
      desc: 'Generate a unique playground URL',
      response: `{
  "success": true,
  "token": "${exampleToken}",
  "url": "${exampleUrl}",
  "expires_in": "24 hours"
}`,
    },
    {
      method: 'ANY',
      path: '/api/playground/in/{token}',
      desc: 'Send any HTTP request — it gets captured',
      response: `{
  "received": true,
  "id": "1715289600000-a1b2c3"
}`,
    },
    {
      method: 'GET',
      path: '/api/playground/history/{token}',
      desc: 'Retrieve captured requests',
      response: `{
  "success": true,
  "count": 3,
  "total": 3,
  "data": [
    {
      "id": "1715289600000-a1b2c3",
      "method": "POST",
      "headers": { "content-type": "application/json" },
      "body": "{ \\"event\\": \\"order.created\\" }",
      "timestamp": "2026-05-10T03:18:00.000Z"
    }
  ]
}`,
    },
    {
      method: 'DELETE',
      path: '/api/playground/history/{token}',
      desc: 'Clear captured requests',
      response: `{
  "success": true,
  "message": "History cleared"
}`,
    },
  ];

  const curlExamples = {
    generate: `curl -X POST ${baseUrl}/api/playground/token`,
    send: `curl -X POST ${exampleUrl} \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Event: order.created" \\
  -d '{"order_id": "ord_123", "total": 49.99}'`,
    history: `curl ${baseUrl}/api/playground/history/${exampleToken}`,
    clear: `curl -X DELETE ${baseUrl}/api/playground/history/${exampleToken}`,
  };

  const nodeExample = `// 1. Generate playground URL
const { url, token } = await fetch('${baseUrl}/api/playground/token', {
  method: 'POST'
}).then(r => r.json());

// 2. Send a webhook to the playground
await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ event: 'order.created', data: { order_id: 'ord_123' } })
});

// 3. Check what was received
const { data } = await fetch(
  \`${baseUrl}/api/playground/history/\${token}\`
).then(r => r.json());

console.log('Captured requests:', data);`;

  const pythonExample = `import requests

# 1. Generate playground URL
res = requests.post('${baseUrl}/api/playground/token')
url = res.json()['url']
token = res.json()['token']

# 2. Send a webhook to the playground
requests.post(url, json={
    'event': 'order.created',
    'data': {'order_id': 'ord_123', 'total': 49.99}
})

# 3. Check what was received
history = requests.get(
    f'${baseUrl}/api/playground/history/{token}'
).json()

print(f"Captured {history['count']} requests")`;

  const goExample = `package main

import (


	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	// 1. Generate playground URL
	resp, err := http.Post("${baseUrl}/api/playground/token", "application/json", nil)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	var result struct {
		Url   string \`json:"url"\`
		Token string \`json:"token"\`
	}
	json.NewDecoder(resp.Body).Decode(&result)
	fmt.Printf("Playground URL: %s\\n", result.Url)

	// 2. Send a webhook
	payload, _ := json.Marshal(map[string]interface{}{
		"event": "order.created",
		"data":  map[string]string{"order_id": "ord_123"},
	})
	http.Post(result.Url, "application/json", bytes.NewBuffer(payload))

	// 3. Check history
	histResp, err := http.Get(
		fmt.Sprintf("${baseUrl}/api/playground/history/%s", result.Token),
	)
	if err != nil {
		panic(err)
	}
	defer histResp.Body.Close()
	var history struct{ Count int }
	json.NewDecoder(histResp.Body).Decode(&history)
	fmt.Printf("Captured %d requests\\n", history.Count)
}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-500/10 dark:to-blue-500/10 rounded-xl border border-brand-200 dark:border-brand-500/20 p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">⚡</span>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t("api")}</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
              Use the playground programmatically — generate URLs, send webhooks, and inspect captured requests via API.
              No authentication required. Same endpoints that power the UI above.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">{t("noSignup")}</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">{t("restApi")}</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400">24h TTL</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">{t("rateLimited")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">🚀 Quick Start</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Generate URL', code: 'POST /api/playground/token', desc: 'Get a unique webhook endpoint' },
            { step: '2', title: 'Send webhooks', code: 'POST /api/playground/in/{token}', desc: 'Any HTTP method, any payload' },
            { step: '3', title: 'Read requests', code: 'GET /api/playground/history/{token}', desc: 'Inspect what was received' },
          ].map((s) => (
            <div key={s.step} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">{s.step}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{s.title}</span>
              </div>
              <p className="text-xs font-mono text-brand-600 dark:text-brand-400 mb-1">{s.code}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoint Reference */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">📡 Endpoints</h3>
        <div className="space-y-4">
          {endpoints.map((ep) => (
            <div key={ep.path + ep.method} className="border border-gray-100 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-800">
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  ep.method === 'POST' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                  ep.method === 'GET' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' :
                  ep.method === 'DELETE' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400' :
                  'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                }`}>
                  {ep.method}
                </span>
                <code className="text-sm font-mono text-gray-900 dark:text-white">{ep.path}</code>
                <span className="text-xs text-gray-500 dark:text-slate-500 ml-auto">{ep.desc}</span>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs text-gray-500 dark:text-slate-500 mb-2">Response:</p>
                <div className="relative group">
                  <pre className="bg-gray-900 dark:bg-slate-800 rounded-lg p-3 text-xs text-green-400 font-mono overflow-x-auto">{ep.response}</pre>
                  <button
                    onClick={() => onCopy(ep.response, ep.path)}
                    className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-gray-700 dark:bg-slate-700 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {apiCopied === ep.path ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Query Parameters */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{t("queryParams")}</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <code className="text-xs font-mono text-brand-600 dark:text-brand-400 shrink-0">force_status_code</code>
              <p className="text-xs text-gray-600 dark:text-slate-400">Force a specific HTTP response code (100-599). Example: <code className="bg-gray-200 dark:bg-slate-700 px-1 rounded">?force_status_code=500</code></p>
            </div>
            <div className="flex items-start gap-3">
              <code className="text-xs font-mono text-brand-600 dark:text-brand-400 shrink-0">echo_body</code>
              <p className="text-xs text-gray-600 dark:text-slate-400">Echo back the request body in the response. Example: <code className="bg-gray-200 dark:bg-slate-700 px-1 rounded">?echo_body=true</code></p>
            </div>
            <div className="flex items-start gap-3">
              <code className="text-xs font-mono text-brand-600 dark:text-brand-400 shrink-0">since</code>
              <p className="text-xs text-gray-600 dark:text-slate-400">Filter history by timestamp (ISO 8601). Only returns requests after this time.</p>
            </div>
            <div className="flex items-start gap-3">
              <code className="text-xs font-mono text-brand-600 dark:text-brand-400 shrink-0">limit</code>
              <p className="text-xs text-gray-600 dark:text-slate-400">Max results from history (default: 100).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">💻 Code Examples</h3>

        {/* cURL */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">cURL</h4>
          <div className="space-y-3">
            {Object.entries(curlExamples).map(([key, code]) => (
              <div key={key} className="relative group">
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 dark:bg-slate-700 rounded-t-lg">
                  <span className="text-xs text-gray-500 dark:text-slate-500">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  <button
                    onClick={() => onCopy(code, `curl-${key}`)}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    {apiCopied === `curl-${key}` ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-gray-900 dark:bg-slate-800 rounded-b-lg p-3 text-xs text-green-400 font-mono overflow-x-auto">{code}</pre>
              </div>
            ))}
          </div>
        </div>

        {/* Node.js */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">Node.js</h4>
          <div className="relative group">
            <button
              onClick={() => onCopy(nodeExample, 'node')}
              className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-gray-700 dark:bg-slate-700 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              {apiCopied === 'node' ? '✓ Copied' : 'Copy'}
            </button>
            <pre className="bg-gray-900 dark:bg-slate-800 rounded-lg p-4 text-xs text-green-400 font-mono overflow-x-auto">{nodeExample}</pre>
          </div>
        </div>

        {/* Python */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">Python</h4>
          <div className="relative group">
            <button
              onClick={() => onCopy(pythonExample, 'python')}
              className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-gray-700 dark:bg-slate-700 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              {apiCopied === 'python' ? '✓ Copied' : 'Copy'}
            </button>
            <pre className="bg-gray-900 dark:bg-slate-800 rounded-lg p-4 text-xs text-green-400 font-mono overflow-x-auto">{pythonExample}</pre>
          </div>
        </div>

        {/* Go */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">Go</h4>
          <div className="relative group">
            <button
              onClick={() => onCopy(goExample, 'go')}
              className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-gray-700 dark:bg-slate-700 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              {apiCopied === 'go' ? '✓ Copied' : 'Copy'}
            </button>
            <pre className="bg-gray-900 dark:bg-slate-800 rounded-lg p-4 text-xs text-green-400 font-mono overflow-x-auto">{goExample}</pre>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">🆚 Svix Play vs HookSniff Playground</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-2 text-gray-500 dark:text-slate-500 font-medium">{t("feature")}</th>
                <th className="text-center py-2 text-gray-500 dark:text-slate-500 font-medium">{t("svixPlay")}</th>
                <th className="text-center py-2 text-gray-500 dark:text-slate-500 font-medium">HookSniff</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-slate-300">
              {[
                ['Unique URL (no signup)', '✅', '✅'],
                ['Any HTTP method', '✅', '✅'],
                ['Request inspection', '✅', '✅'],
                ['API access', '✅', '✅'],
                ['Sample payloads', '❌', '✅'],
                ['HMAC signature display', '✅', '✅'],
                ['force_status_code', '✅', '✅'],
                ['echo_body', '✅', '✅'],
                ['CLI integration', '✅', '❌'],
                ['Custom headers', '❌', '✅'],
                ['Rate limit', 'Unknown', '100/min'],
              ].map(([feature, svix, hooksniff]) => (
                <tr key={feature as string} className="border-b border-gray-100 dark:border-slate-700/50">
                  <td className="py-2 text-xs">{feature}</td>
                  <td className="py-2 text-center text-xs">{svix}</td>
                  <td className="py-2 text-center text-xs">{hooksniff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-6 bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-500/10 dark:to-blue-500/10 rounded-xl border border-brand-200 dark:border-brand-500/20">
        <p className="text-gray-700 dark:text-slate-300 mb-2 text-sm font-medium">Need more than playground?</p>
        <p className="text-gray-500 dark:text-slate-400 text-xs mb-4">Get reliable webhook delivery with retries, signatures, and analytics.</p>
        <Link href="/login" className="inline-block px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
          Start free →
        </Link>
      </div>
    </div>
  );
}

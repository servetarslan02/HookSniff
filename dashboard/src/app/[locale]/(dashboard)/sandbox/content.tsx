'use client';

import { useTranslations } from 'next-intl';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { AlertTriangle, FlaskConical, Lightbulb, Lock, ShieldCheck, Zap } from '@/components/icons';

/* ─── Timeout-aware fetch helper ─── */
const FETCH_TIMEOUT_MS = 15_000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/* ─── Tab Types ─── */

/* ─── Types ─── */

type WebhookRecord = {
  id: string;
  method: string;
  path: string;
  query: Record<string, React.ReactNode>;
  headers: Record<string, React.ReactNode>;
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
  const tc = useTranslations('common');
  // State
  const [state, setState] = useState<PlaygroundState>('idle');
  const [token, setToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [history, setHistory] = useState<WebhookRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<WebhookRecord | null>(null);
  const [polling, setPolling] = useState(false);
  const [lastPoll, setLastPoll] = useState<string>('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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
      const res = await fetchWithTimeout('/playground-api/token', { method: 'POST' });
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
      setError(tc('networkErrorCheck'));
      setState('error');
    }
  }, [tc]);

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
        ? `/playground-api/history/${token}?since=${encodeURIComponent(lastPoll)}`
        : `/playground-api/history/${token}`;
      const res = await fetchWithTimeout(url);
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

  // Start/stop polling
  useEffect(() => {
    if (state === 'ready' && token) {
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
  }, [state, token, fetchHistory]);

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
      const res = await fetchWithTimeout(webhookUrl, {
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
      await fetchWithTimeout(`/playground-api/history/${token}`, { method: 'DELETE' });
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

  const formatHeaders = (headers: Record<string, React.ReactNode>) =>
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Idle State — Generate Token */}
        {state === 'idle' && (
          <div className="max-w-md mx-auto text-center py-16">
            <span className="text-6xl mb-4 block"><FlaskConical size={18} strokeWidth={1.75} /></span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('idleTitle')}</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6">{t('idleDesc')}</p>
            <button onClick={generateToken} className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
              {t('generateUrl')}
            </button>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-3">{t('freeForever')}</p>
          </div>
        )}

        {/* Generating State */}
        {state === 'generating' && (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-slate-400">{t('generatingUrl')}</p>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="max-w-md mx-auto text-center py-16">
            <span className="text-5xl mb-4 block"><AlertTriangle size={18} strokeWidth={1.75} /></span>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button onClick={generateToken} className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
              {t('tryAgain')}
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
                  {copied ? t('copied') : t('copy')}
                </button>
                <button onClick={handleNewSession} className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                  {t('newSession')}
                </button>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-slate-500">
                <span>{polling ? t('polling') : t('notPolling')}</span>
                <span>·</span>
                <span>{t('requestsCaptured', { count: history.length })}</span>
                <span>·</span>
                <span>{t("expiresIn")}</span>
              </div>
            </div>

            {/* Send Test Webhook */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{t("sendTest")}</h3>
              <div className="grid md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-slate-500 mb-1">{t("eventType")}</label>
                  <input type="text" value={sendEvent} onChange={(e) => setSendEvent(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-hidden" />
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
                    {sending ? t('sending') : t('sendBtn')}
                  </button>
                </div>
              </div>
              {sendResult && (
                <div className={`mt-3 px-3 py-2 rounded-lg text-sm ${sendResult.status >= 200 && sendResult.status < 300 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                  {sendResult.status === 0 && sendResult.time === 0
                    ? t('invalidJson')
                    : t('statusTime', { status: sendResult.status, time: sendResult.time })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left: Request List */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('requestHistory')} ({history.length})</h3>
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
                          <span className={`px-1.5 py-0.5 rounded-sm text-xs font-mono font-bold ${record.method === 'POST' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : record.method === 'GET' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'}`}>
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
                      <span className={`px-2 py-1 rounded-sm text-xs font-mono font-bold ${selectedRecord.method === 'POST' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>
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
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1"><ShieldCheck size={16} strokeWidth={1.75} className="inline mr-1" /> Webhook {t('signature')}</h4>
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
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1"><Lightbulb size={16} strokeWidth={1.75} className="inline mr-1" /> {t('worksAnyService')}</h4>
                <p className="text-xs text-blue-700 dark:text-blue-400">{t('worksAnyServiceDesc')}</p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-300 mb-1"><Lock size={16} strokeWidth={1.75} className="inline mr-1" /> {t('secureDefault')}</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">{t('secureDefaultDesc')}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-lg border border-purple-200 dark:border-purple-500/20">
                <h4 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1"><Zap size={16} strokeWidth={1.75} className="inline mr-1" /> {t('realtime')}</h4>
                <p className="text-xs text-purple-700 dark:text-purple-400">{t('realtimeDesc')}</p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
              <p className="text-gray-600 dark:text-slate-400 mb-4">{t('likeSignup')}</p>
              <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
                {t('startFree')}
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

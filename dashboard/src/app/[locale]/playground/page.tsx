'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import PublicNavbar from '@/components/PublicNavbar';
import { FlaskConical, ShieldCheck, Lightbulb, Lock, Zap, AlertTriangle } from '@/components/icons';

const FETCH_TIMEOUT_MS = 15_000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

type WebhookRecord = {
  id: string;
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
  content_length: number;
  ip: string;
};

const samplePayloads = [
  { name: 'Payment', event: 'payment.completed', payload: JSON.stringify({ id: 'pay_123', amount: 9900, currency: 'USD', status: 'succeeded', customer: 'cus_456' }, null, 2) },
  { name: 'Order', event: 'order.created', payload: JSON.stringify({ id: 'ord_789', total: 149.99, items: [{ sku: 'PRO', qty: 1 }], status: 'pending' }, null, 2) },
  { name: 'User', event: 'user.registered', payload: JSON.stringify({ id: 'usr_012', email: 'dev@example.com', plan: 'free', created_at: new Date().toISOString() }, null, 2) },
];

export default function PublicPlaygroundPage() {
  const t = useTranslations('playgroundPublic');
  const tc = useTranslations('common');

  const [state, setState] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [token, setToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [history, setHistory] = useState<WebhookRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<WebhookRecord | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(false);
  const [sendEvent, setSendEvent] = useState(samplePayloads[0].event);
  const [sendPayload, setSendPayload] = useState(samplePayloads[0].payload);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ status: number; time: number } | null>(null);
  const lastPollRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      } else {
        setError(data.error || 'Failed to generate token');
        setState('error');
      }
    } catch {
      setError(tc('networkError'));
      setState('error');
    }
  }, [tc]);

  const pollHistory = useCallback(async () => {
    if (!token) return;
    try {
      const url = lastPollRef.current > 0
        ? `/playground-api/history/${token}?since=${encodeURIComponent(lastPollRef.current)}`
        : `/playground-api/history/${token}`;
      const res = await fetchWithTimeout(url);
      const data = await res.json();
      if (data.requests?.length) {
        setHistory((prev) => {
          const existing = new Set(prev.map((r) => r.id));
          const newOnes = data.requests.filter((r: WebhookRecord) => !existing.has(r.id));
          return [...newOnes, ...prev];
        });
        lastPollRef.current = Date.now();
      }
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => {
    if (state !== 'ready' || !token) return;
    pollHistory();
    pollRef.current = setInterval(pollHistory, 2000);
    setPolling(true);
    return () => { if (pollRef.current) clearInterval(pollRef.current); setPolling(false); };
  }, [state, token, pollHistory]);

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewSession = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setState('idle');
    setToken('');
    setWebhookUrl('');
    setHistory([]);
    setSelectedRecord(null);
    lastPollRef.current = 0;
  };

  const handleSend = async () => {
    setSending(true);
    setSendResult(null);
    const start = Date.now();
    try {
      const res = await fetchWithTimeout(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Event-Type': sendEvent },
        body: sendPayload,
      });
      setSendResult({ status: res.status, time: Date.now() - start });
    } catch {
      setSendResult({ status: 0, time: 0 });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatHeaders = (h: Record<string, string>) => Object.entries(h).map(([k, v]) => `${k}: ${v}`).join('\n');
  const formatBody = (b: string) => { try { return JSON.stringify(JSON.parse(b), null, 2); } catch { return b; } };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle="Playground" />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Idle State */}
        {state === 'idle' && (
          <div className="max-w-md mx-auto text-center py-16">
            <span className="text-6xl mb-4 block"><FlaskConical size={56} strokeWidth={1.5} /></span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('idleTitle')}</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6">{t('idleDesc')}</p>
            <button onClick={generateToken} className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
              {t('generateUrl')}
            </button>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-3">{t('freeForever')}</p>
          </div>
        )}

        {/* Generating */}
        {state === 'generating' && (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-slate-400">{t('generatingUrl')}</p>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="max-w-md mx-auto text-center py-16">
            <span className="text-5xl mb-4 block"><AlertTriangle size={48} strokeWidth={1.5} /></span>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button onClick={generateToken} className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
              {t('tryAgain')}
            </button>
          </div>
        )}

        {/* Ready */}
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
                <span>{t('expiresIn')}</span>
              </div>
            </div>

            {/* Send Test */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{t('sendTest')}</h3>
              <div className="grid md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-slate-500 mb-1">{t('eventType')}</label>
                  <input type="text" value={sendEvent} onChange={(e) => setSendEvent(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-hidden" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 dark:text-slate-500 mb-1">{t('quickSamples')}</label>
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
                  {sendResult.status === 0 && sendResult.time === 0 ? t('invalidJson') : t('statusTime', { status: sendResult.status, time: sendResult.time })}
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Left: Request List */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('requestHistory')} ({history.length})</h3>
                  {history.length > 0 && (
                    <button onClick={() => { setHistory([]); setSelectedRecord(null); lastPollRef.current = 0; }} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400">{t('clearAll')}</button>
                  )}
                </div>
                {history.length === 0 ? (
                  <div className="flex items-center justify-center h-48 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-gray-500 dark:text-slate-600 text-sm mb-1">{t('noRequests')}</p>
                      <p className="text-gray-500 dark:text-slate-600 text-xs">{t('sendToUrl')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {history.map((record) => (
                      <button key={record.id} onClick={() => setSelectedRecord(record)} className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedRecord?.id === record.id ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-300 dark:border-brand-500/40' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-500/20'}`}>
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
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{t('requestDetail')}</h3>
                {!selectedRecord ? (
                  <div className="flex items-center justify-center h-64 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                    <p className="text-gray-500 dark:text-slate-600 text-sm">{t('selectRequest')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                      <span className={`px-2 py-1 rounded-sm text-xs font-mono font-bold ${selectedRecord.method === 'POST' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>
                        {selectedRecord.method}
                      </span>
                      <span className="text-sm font-mono text-gray-700 dark:text-slate-300 truncate">{selectedRecord.path}</span>
                      <span className="text-xs text-gray-500 dark:text-slate-600 ml-auto">{formatTime(selectedRecord.timestamp)}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider">{t('headers')}</h4>
                      <div className="bg-gray-900 dark:bg-slate-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                        <pre className="text-xs text-gray-300 dark:text-slate-400 font-mono whitespace-pre-wrap">{formatHeaders(selectedRecord.headers)}</pre>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider">{t('body')}</h4>
                      <div className="bg-gray-900 dark:bg-slate-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{formatBody(selectedRecord.body)}</pre>
                      </div>
                    </div>
                    {selectedRecord.headers['svix-signature'] || selectedRecord.headers['x-hooksniff-signature'] ? (
                      <div className="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-lg border border-brand-200 dark:border-brand-500/20">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1"><ShieldCheck size={14} strokeWidth={1.75} className="inline mr-1" /> Webhook {t('signature')}</h4>
                        <p className="text-xs font-mono text-gray-600 dark:text-slate-400 break-all">
                          {selectedRecord.headers['svix-signature'] || selectedRecord.headers['x-hooksniff-signature']}
                        </p>
                      </div>
                    ) : null}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                        <p className="text-xs text-gray-500 dark:text-slate-500">{t('ipAddress')}</p>
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

            {/* Info boxes */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1"><Lightbulb size={14} strokeWidth={1.75} className="inline mr-1" /> {t('worksAnyService')}</h4>
                <p className="text-xs text-blue-700 dark:text-blue-400">{t('worksAnyServiceDesc')}</p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-300 mb-1"><Lock size={14} strokeWidth={1.75} className="inline mr-1" /> {t('secureDefault')}</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">{t('secureDefaultDesc')}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-lg border border-purple-200 dark:border-purple-500/20">
                <h4 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1"><Zap size={14} strokeWidth={1.75} className="inline mr-1" /> {t('realtime')}</h4>
                <p className="text-xs text-purple-700 dark:text-purple-400">{t('realtimeDesc')}</p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
              <p className="text-gray-600 dark:text-slate-400 mb-4">{t('likeSignup')}</p>
              <Link href="/register" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
                {t('startFree')}
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

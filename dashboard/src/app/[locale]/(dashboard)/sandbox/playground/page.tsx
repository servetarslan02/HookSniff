'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTranslations } from 'next-intl';
import { ResponseInspector } from './components/ResponseInspector';
import { HistoryPanel } from './components/HistoryPanel';
import { LiveRequestViewer } from './components/LiveRequestViewer';
import { METHODS, API_BASE, ENDPOINT_PATHS, AI_PAYLOAD_TEMPLATES } from './constants';
import { loadHistory, saveHistory } from './history';
import type { PlaygroundRequest } from './types';
import { Bot, ClipboardList } from 'lucide-react';

export default function PlaygroundPage() {
  const { apiKey } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('playground');
  const tc = useTranslations('common');
  const [method, setMethod] = useState<string>('POST');
  const [path, setPath] = useState('/webhooks');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<unknown>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, React.ReactNode>>({});
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
      toast(t('generatedPayload', { type: eventType }), 'success');
    }
  };

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    setResponseStatus(null);
    setResponseHeaders({});
    setResponseDuration(null);

    const startTime = performance.now();
    const capturedHeaders: Record<string, React.ReactNode> = {};

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        credentials: 'include',
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
      const newHistory = [entry, ...history].slice(0, 10);
      setHistory(newHistory);
      saveHistory(newHistory);
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - startTime);
      const errorMessage = err instanceof Error ? err.message : tc('unknownError');
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
      const newHistory = [entry, ...history].slice(0, 10);
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
    localStorage.removeItem('hooksniff_playground_history');
    toast(t('historyCleared'), 'info');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">{t('subtitle')}</p>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('request')}</h2>

            {/* AI Payload Generator */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <Bot size={16} strokeWidth={1.75} className="inline mr-1" /> AI Payload Generator
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
                {t('headersAuto')}
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

            <button type="button"
              onClick={handleSend}
              disabled={loading}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" /> {tc('sending')}
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
              <button type="button"
                onClick={copyCurl}
                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
              >
                <ClipboardList size={16} strokeWidth={1.75} className="inline mr-1" /> Copy
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

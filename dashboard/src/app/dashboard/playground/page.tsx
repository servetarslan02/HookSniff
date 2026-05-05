'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { endpointsApi, type Endpoint } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const METHODS = ['GET', 'POST', 'DELETE'] as const;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

const ENDPOINT_PATHS: Record<string, string> = {
  'List Endpoints': '/endpoints',
  'List Deliveries': '/webhooks',
  'Get Stats': '/stats',
};

export default function PlaygroundPage() {
  const { token, apiKey } = useAuth();
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [method, setMethod] = useState<string>('GET');
  const [path, setPath] = useState('/endpoints');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');

  useEffect(() => {
    if (!token) return;
    endpointsApi.list(token).then(setEndpoints).catch(() => {});
  }, [token]);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || 'YOUR_TOKEN'}`,
  };

  const curlCommand = `curl -X ${method} ${API_BASE}${path} \\
${Object.entries(headers).map(([k, v]) => `  -H "${k}: ${v}"`).join(' \\\n')}${method !== 'GET' && body ? ` \\
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

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    setResponseStatus(null);
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: method !== 'GET' && body ? body : undefined,
      });
      setResponseStatus(res.status);
      const data = await res.json().catch(() => null);
      setResponse(data);
    } catch (err: any) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    toast('cURL command copied!', 'success');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">API Playground</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request</h2>

            {/* Presets */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(ENDPOINT_PATHS).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePreset(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedPreset === preset
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-brand-500"
              >
                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-brand-500"
                placeholder="/v1/endpoints"
              />
            </div>

            {/* Headers */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Headers (auto-added)</label>
              <pre className="bg-gray-50 p-3 rounded-xl text-xs font-mono text-gray-600 overflow-x-auto">
                {JSON.stringify(headers, null, 2)}
              </pre>
            </div>

            {/* Body */}
            {method !== 'GET' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Request Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-brand-500 resize-none"
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
              {loading ? <><LoadingSpinner size="sm" /> Sending...</> : '🚀 Send Request'}
            </button>
          </div>

          {/* cURL */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">cURL Command</h3>
              <button onClick={copyCurl} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                Copy
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono overflow-x-auto">
              {curlCommand}
            </pre>
          </div>
        </div>

        {/* Response */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Response</h2>
            {responseStatus && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                responseStatus < 400 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {responseStatus}
              </span>
            )}
          </div>
          {response ? (
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-auto max-h-[600px]">
              {JSON.stringify(response, null, 2)}
            </pre>
          ) : (
            <div className="text-center text-gray-400 py-16">
              <div className="text-4xl mb-3">🧪</div>
              <p>Send a request to see the response</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

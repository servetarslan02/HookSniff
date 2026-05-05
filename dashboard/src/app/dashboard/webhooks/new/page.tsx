'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { webhooksApi, endpointsApi, type Endpoint } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SendWebhookPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [endpointId, setEndpointId] = useState('');
  const [eventType, setEventType] = useState('');
  const [payload, setPayload] = useState('{\n  "message": "Hello from Hookrelay!"\n}');
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [jsonError, setJsonError] = useState('');

  useEffect(() => {
    if (!token) return;
    endpointsApi.list(token).then(setEndpoints).catch(() => {});
  }, [token]);

  const validateJson = (val: string) => {
    try {
      JSON.parse(val);
      setJsonError('');
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const handleSend = async () => {
    if (!token || !endpointId) return;
    try {
      JSON.parse(payload);
    } catch {
      toast('Invalid JSON payload', 'error');
      return;
    }
    setSending(true);
    setResponse(null);
    try {
      const res = await webhooksApi.create(token, {
        endpoint_id: endpointId,
        event: eventType || undefined,
        data: JSON.parse(payload),
      });
      setResponse(res);
      toast('Webhook sent!', 'success');
    } catch (err: any) {
      setResponse({ error: err.message });
      toast('Failed to send webhook', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Send Test Webhook</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
              <select
                value={endpointId}
                onChange={(e) => setEndpointId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select an endpoint...</option>
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id}>{ep.url}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <input
                type="text"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="order.created"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payload (JSON)</label>
              <textarea
                value={payload}
                onChange={(e) => { setPayload(e.target.value); validateJson(e.target.value); }}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-brand-500 resize-none"
                spellCheck={false}
              />
              {jsonError && <p className="text-xs text-red-600 mt-1">⚠️ {jsonError}</p>}
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !endpointId || !!jsonError}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {sending ? <><LoadingSpinner size="sm" /> Sending...</> : '🚀 Send Webhook'}
            </button>
          </div>
        </div>

        {/* Response */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Response</h2>
          {response ? (
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-auto max-h-[500px]">
              {JSON.stringify(response, null, 2)}
            </pre>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <div className="text-4xl mb-3">📡</div>
              <p>Send a webhook to see the response here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

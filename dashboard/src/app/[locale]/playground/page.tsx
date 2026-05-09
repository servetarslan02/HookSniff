'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const samplePayloads = [
  {
    name: 'Order Created',
    event: 'order.created',
    payload: JSON.stringify({ order_id: 'ord_123', total: 49.99, currency: 'USD', customer_id: 'cus_abc', items: [{ sku: 'HOOK-001', qty: 2 }] }, null, 2),
  },
  {
    name: 'Payment Completed',
    event: 'payment.completed',
    payload: JSON.stringify({ payment_id: 'pay_xyz', amount: 99.00, currency: 'USD', status: 'succeeded', method: 'card' }, null, 2),
  },
  {
    name: 'User Signup',
    event: 'user.created',
    payload: JSON.stringify({ user_id: 'usr_456', email: 'dev@example.com', plan: 'pro', created_at: '2026-05-10T02:38:00Z' }, null, 2),
  },
  {
    name: 'AI Agent Task',
    event: 'agent.task_completed',
    payload: JSON.stringify({ agent_id: 'agent_789', task_id: 'task_001', status: 'success', tokens_used: 15420, latency_ms: 3200 }, null, 2),
  },
];

export default function PlaygroundPage() {
  const [url, setUrl] = useState('https://webhook.site/your-unique-url');
  const [event, setEvent] = useState('order.created');
  const [payload, setPayload] = useState(samplePayloads[0].payload);
  const [secret, setSecret] = useState('whsec_test_...');
  const [response, setResponse] = useState<{ status: number; body: string; headers: Record<string, string>; time: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      // Validate JSON
      JSON.parse(payload);

      const start = Date.now();

      // In a real implementation, this would call the HookSniff API
      // For now, simulate a response
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

      const elapsed = Date.now() - start;

      setResponse({
        status: 200,
        body: JSON.stringify({ success: true, message: 'Webhook delivered', event, timestamp: new Date().toISOString() }, null, 2),
        headers: {
          'content-type': 'application/json',
          'x-hooksniff-signature': 'sha256=abc123...',
          'x-hooksniff-event': event,
          'x-hooksniff-delivery': 'del_' + Math.random().toString(36).slice(2, 10),
          'x-request-id': 'req_' + Math.random().toString(36).slice(2, 10),
        },
        time: elapsed,
      });
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError('Invalid JSON payload');
      } else {
        setError('Failed to send webhook');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSample = (sample: typeof samplePayloads[0]) => {
    setEvent(sample.event);
    setPayload(sample.payload);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">Playground</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Webhook Playground</h1>
          <p className="text-gray-600 dark:text-slate-400">Test webhook delivery in real-time. Send a payload, see the response.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Request */}
          <div className="space-y-4">
            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Endpoint URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-app.com/webhook"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Event + Secret */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Event type</label>
                <input
                  type="text"
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Signing secret</label>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Sample payloads */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Quick samples</label>
              <div className="flex flex-wrap gap-2">
                {samplePayloads.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => handleSample(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      event === s.event
                        ? 'bg-brand-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-brand-300'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Payload editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Payload (JSON)</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-900 dark:bg-slate-800 text-green-400 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Sending...' : 'Send Webhook →'}
            </button>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-4 py-2 rounded-lg">{error}</p>
            )}
          </div>

          {/* Right: Response */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Response</h3>

            {!response && !loading && (
              <div className="flex items-center justify-center h-64 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                <p className="text-gray-400 dark:text-slate-600">Send a webhook to see the response</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center h-64 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-slate-500">Delivering webhook...</p>
                </div>
              </div>
            )}

            {response && (
              <>
                {/* Status */}
                <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">Delivered</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-500">Status: {response.status} · {response.time}ms</p>
                  </div>
                </div>

                {/* Response Headers */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Response Headers</h4>
                  <div className="bg-gray-900 dark:bg-slate-800 rounded-lg p-4">
                    <pre className="text-xs text-gray-300 dark:text-slate-400 font-mono overflow-x-auto">
                      {Object.entries(response.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}
                    </pre>
                  </div>
                </div>

                {/* Response Body */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Response Body</h4>
                  <div className="bg-gray-900 dark:bg-slate-800 rounded-lg p-4">
                    <pre className="text-xs text-green-400 font-mono overflow-x-auto">{response.body}</pre>
                  </div>
                </div>

                {/* HMAC Signature */}
                <div className="p-4 bg-brand-50 dark:bg-brand-500/10 rounded-lg border border-brand-200 dark:border-brand-500/20">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">🔐 HMAC-SHA256 Signature</h4>
                  <p className="text-xs font-mono text-gray-600 dark:text-slate-400 break-all">
                    sha256={btoa(payload + secret).slice(0, 64)}...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Verify this signature in your endpoint to ensure authenticity.</p>
                </div>
              </>
            )}

            {/* Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">💡 How it works</h4>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Your payload is signed with HMAC-SHA256</li>
                <li>• The webhook is delivered to your endpoint</li>
                <li>• Response headers include the signature for verification</li>
                <li>• Failed deliveries are retried automatically</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
          <p className="text-gray-600 dark:text-slate-400 mb-4">Like what you see? Sign up and start sending webhooks for real.</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
            Start for free →
          </Link>
        </div>
      </main>
    </div>
  );
}

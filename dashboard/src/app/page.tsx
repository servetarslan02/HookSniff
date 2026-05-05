'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xl">
              🪝
            </div>
            <span className="text-xl font-bold text-gray-900">Hookrelay</span>
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">Pricing</a>
            <Link href="/docs" className="text-sm text-gray-600 hover:text-gray-900 transition">Docs</Link>
            <Link
              href="/dashboard"
              className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
            >
              Dashboard →
            </Link>
          </div>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 -mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            aria-label="Toggle navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl px-6 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileNavOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#pricing" onClick={() => setMobileNavOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900 transition">Pricing</a>
            <Link href="/docs" onClick={() => setMobileNavOpen(false)} className="block text-sm text-gray-600 hover:text-gray-900 transition">Docs</Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className="block bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition text-center"
            >
              Dashboard →
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            99.99% delivery uptime
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Webhooks that
            <br />
            <span className="gradient-text">actually deliver</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Send webhooks with confidence. Automatic retries, HMAC signatures,
            real-time monitoring. Built for developers who need reliability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-gray-900 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-gray-800 transition shadow-lg shadow-gray-900/20"
            >
              Get started free
            </Link>
            <Link
              href="/docs"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 transition"
            >
              Read the docs
            </Link>
          </div>
        </div>

        {/* Code Example */}
        <div className="max-w-3xl mx-auto mb-24">
          <div className="glass-card overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200/50 bg-gray-50/50">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="ml-4 text-sm text-gray-500 font-mono">send-webhook.sh</span>
            </div>
            <pre className="p-6 text-sm font-mono text-gray-800 overflow-x-auto">
              <code>{`# Create an endpoint
curl -X POST https://api.hookrelay.io/v1/endpoints \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://myapp.com/webhook"}'

# Send a webhook
curl -X POST https://api.hookrelay.io/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"endpoint_id": "ep_abc123", "event": "order.created", "data": {"order_id": "12345"}}'`}</code>
            </pre>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            {
              icon: '🔄',
              title: 'Automatic Retries',
              desc: 'Exponential backoff with configurable max attempts. Failed deliveries are retried automatically.',
            },
            {
              icon: '🔐',
              title: 'HMAC Signatures',
              desc: 'Every webhook is signed with SHA256. Verify authenticity with a single function call.',
            },
            {
              icon: '📊',
              title: 'Real-time Dashboard',
              desc: 'Monitor deliveries, track success rates, debug failures. Everything in one place.',
            },
            {
              icon: '⚡',
              title: 'Low Latency',
              desc: 'Built on Rust for speed. Sub-millisecond overhead on webhook delivery.',
            },
            {
              icon: '🪦',
              title: 'Dead Letter Queue',
              desc: 'Failed deliveries are preserved for debugging. Nothing gets lost.',
            },
            {
              icon: '🌍',
              title: 'Global Infrastructure',
              desc: 'Deploy worldwide for low-latency webhook delivery to any endpoint.',
            },
          ].map((feature, i) => (
            <div key={i} className="glass-card p-8 hover-lift">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div id="pricing" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            {
              name: 'Free',
              price: '$0',
              period: '/month',
              features: ['1,000 webhooks/month', '100 requests/min', '3 retry attempts', 'Community support'],
              cta: 'Get started',
              popular: false,
            },
            {
              name: 'Pro',
              price: '$49',
              period: '/month',
              features: ['50,000 webhooks/month', '1,000 requests/min', '5 retry attempts', 'Priority support', 'Custom domains'],
              cta: 'Start free trial',
              popular: true,
            },
            {
              name: 'Business',
              price: '$199',
              period: '/month',
              features: ['500,000 webhooks/month', '10,000 requests/min', '10 retry attempts', 'Dedicated support', 'SLA guarantee', 'Custom integrations'],
              cta: 'Contact sales',
              popular: false,
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`glass-card p-8 hover-lift relative ${
                plan.popular ? 'ring-2 ring-brand-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-medium transition ${
                  plan.popular
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-12 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪝</span>
              <span className="font-semibold text-gray-900">Hookrelay</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="https://github.com/hookrelay" className="hover:text-gray-900 transition">GitHub</a>
              <Link href="/docs" className="hover:text-gray-900 transition">Docs</Link>
              <a href="#" className="hover:text-gray-900 transition">Status</a>
              <a href="#" className="hover:text-gray-900 transition">Blog</a>
              <Link href="/terms" className="hover:text-gray-900 transition">Terms</Link>
              <Link href="/privacy" className="hover:text-gray-900 transition">Privacy</Link>
            </div>
            <p className="text-sm text-gray-400">© 2026 Hookrelay. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

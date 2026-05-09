'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (data.success) { setStatus('success'); setMessage(data.message); setEmail(''); }
      else { setStatus('error'); setMessage(data.error || 'Something went wrong'); }
    } catch { setStatus('error'); setMessage('Network error'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">Newsletter</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="text-5xl mb-4 block">📬</span>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Stay in the loop</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-xl mx-auto">Get webhook tips, product updates, and engineering insights. No spam. Unsubscribe anytime.</p>
        </div>
        <div className="max-w-md mx-auto mb-16">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
            <button type="submit" disabled={status === 'loading'} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">{status === 'loading' ? '...' : 'Subscribe'}</button>
          </form>
          {message && <p className={`text-sm mt-3 ${status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{message}</p>}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🚀', title: 'Product updates', desc: 'New features, SDK releases, and platform improvements.' },
            { icon: '🔧', title: 'Engineering insights', desc: 'Deep dives into webhook architecture, Rust, and distributed systems.' },
            { icon: '📊', title: 'Industry trends', desc: 'Webhook standards, AI agents, and event-driven architecture news.' },
          ].map((item) => (
            <div key={item.title} className="text-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
              <span className="text-3xl">{item.icon}</span>
              <h3 className="font-bold text-gray-900 dark:text-white mt-3 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

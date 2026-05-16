'use client';

import { useState } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import { useTranslations } from 'next-intl';
import { API_BASE } from '@/lib/api';
import Footer from '@/components/Footer';



export function ContactPageContent() {
  const t = useTranslations();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t('contact.title')} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('contact.title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-12">{t('contact.subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('contact.email')}</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{t('contact.useFormBelow')}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('contact.location')}</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{t('contact.locationValue')}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('contact.responseTime')}</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{t('contact.responseTimeValue')}</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('contact.sendMessage')}</h2>

          {status === 'sent' && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 mb-6">
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">{t('contact.messageSent')}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 mb-6">
              <p className="text-red-700 dark:text-red-400 font-medium">{t('contact.sendError')}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('contact.name')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-hidden transition"
                  placeholder={t('contact.name')}
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('contact.email')}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-hidden transition"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('contact.subject')}</label>
              <select
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-hidden transition"
                required
              >
                <option value="">{t('contact.selectTopic')}</option>
                <option value="general">{t('contact.generalQuestion')}</option>
                <option value="technical">{t('contact.technicalSupport')}</option>
                <option value="billing">{t('contact.billingPayments')}</option>
                <option value="enterprise">{t('contact.enterpriseInquiry')}</option>
                <option value="bug">{t('contact.bugReport')}</option>
                <option value="feature">{t('contact.featureRequest')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('contact.message')}</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-hidden transition resize-none"
                placeholder={t('contact.howCanWeHelp')}
                required
              />
            </div>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="bg-brand-600 dark:bg-brand-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? t('sending') : t('sendMessage')}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

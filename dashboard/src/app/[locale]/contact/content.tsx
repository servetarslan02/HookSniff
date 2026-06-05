'use client';

import { useState } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import { useTranslations } from 'next-intl';
import { API_BASE } from '@/lib/api';
import Footer from '@/components/Footer';
import { Mail, MapPin, Clock, Send, MessageSquare, Shield, Zap, CheckCircle2, AlertCircle } from '@/components/icons';

const TOPICS = [
  { value: 'general', icon: MessageSquare, color: 'from-blue-500 to-indigo-600' },
  { value: 'technical', icon: Zap, color: 'from-amber-500 to-orange-600' },
  { value: 'billing', icon: Shield, color: 'from-emerald-500 to-green-600' },
  { value: 'enterprise', icon: MapPin, color: 'from-purple-500 to-violet-600' },
  { value: 'bug', icon: AlertCircle, color: 'from-red-500 to-rose-600' },
  { value: 'feature', icon: Zap, color: 'from-cyan-500 to-teal-600' },
] as const;

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

  const infoCards = [
    { icon: Mail, label: t('contact.email'), value: 'support@hooksniff.dev', color: 'from-brand-500 to-purple-600' },
    { icon: MapPin, label: t('contact.location'), value: t('contact.locationValue'), color: 'from-emerald-500 to-teal-600' },
    { icon: Clock, label: t('contact.responseTime'), value: t('contact.responseTimeValue'), color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t('contact.title')} />

      <main>
        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 py-20 sm:py-28">
          {/* Decorative grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]" />
          {/* Glow orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

          <div className="relative max-w-5xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/80 mb-6">
              <MessageSquare size={14} strokeWidth={2} />
              {t('contact.subtitle')}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
              {t('contact.title')}
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
              {t('contact.howCanWeHelp')}
            </p>
          </div>
        </section>

        {/* ── Info Cards ── */}
        <section className="relative -mt-10 max-w-5xl mx-auto px-6 z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {infoCards.map((card) => (
              <div
                key={card.label}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <card.icon size={20} strokeWidth={2} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{card.label}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">{card.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Form Section ── */}
        <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
            {/* Left: Form */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 sm:p-10 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('contact.sendMessage')}</h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">{t('contact.responseTimeValue')}</p>

                {status === 'sent' && (
                  <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 mb-8">
                    <CheckCircle2 size={20} strokeWidth={2} className="text-emerald-500 shrink-0" />
                    <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">{t('contact.messageSent')}</p>
                  </div>
                )}

                {status === 'error' && (
                  <div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 mb-8">
                    <AlertCircle size={20} strokeWidth={2} className="text-red-500 shrink-0" />
                    <p className="text-red-700 dark:text-red-400 text-sm font-medium">{t('contact.sendError')}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('contact.name')}</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition"
                        placeholder="John Doe"
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition"
                        placeholder="you@company.com"
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition appearance-none"
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
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition resize-none"
                      placeholder={t('contact.howCanWeHelp')}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-linear-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {status === 'sending' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('sending')}
                      </>
                    ) : (
                      <>
                        <Send size={16} strokeWidth={2} />
                        {t('sendMessage')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Topic cards */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('contact.selectTopic')}</h3>
                <div className="space-y-2.5">
                  {TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    const isActive = form.subject === topic.value;
                    return (
                      <button
                        key={topic.value}
                        type="button"
                        onClick={() => setForm({ ...form, subject: topic.value })}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 shadow-sm'
                            : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 border border-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-linear-to-br ${topic.color} flex items-center justify-center shrink-0`}>
                          <Icon size={14} strokeWidth={2} className="text-white" />
                        </div>
                        {t(`contact.${topic.value === 'general' ? 'generalQuestion' : topic.value === 'technical' ? 'technicalSupport' : topic.value === 'billing' ? 'billingPayments' : topic.value === 'enterprise' ? 'enterpriseInquiry' : topic.value === 'bug' ? 'bugReport' : 'featureRequest'}`)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trust card */}
              <div className="bg-linear-to-br from-gray-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Shield size={20} strokeWidth={2} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Secure & Private</h3>
                    <p className="text-xs text-slate-400">Your data is encrypted</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={14} strokeWidth={2} className="text-emerald-400 shrink-0" />
                    TLS encrypted transmission
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={14} strokeWidth={2} className="text-emerald-400 shrink-0" />
                    Rate limited (5/hour per IP)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={14} strokeWidth={2} className="text-emerald-400 shrink-0" />
                    No data shared with third parties
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={14} strokeWidth={2} className="text-emerald-400 shrink-0" />
                    Response within 24 hours
                  </li>
                </ul>
              </div>

              {/* GitHub link */}
              <a
                href="https://github.com/servetarslan02/HookSniff/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">GitHub Discussions</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Community support & questions</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 py-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t('about.readyToStart')}</h2>
            <p className="text-slate-400 mb-8">{t('about.cta')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/register"
                className="inline-flex items-center gap-2 bg-linear-to-r from-brand-600 to-purple-600 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-brand-500/40 transition-all duration-300"
              >
                {t('about.startFree')}
              </a>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-semibold border border-white/10 hover:bg-white/20 transition-all duration-300"
              >
                {t('pricing.title')}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

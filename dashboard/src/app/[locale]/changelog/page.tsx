'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

type ChangeType = 'feature' | 'fix' | 'improvement' | 'security' | 'breaking';

type ChangeEntry = {
  type: ChangeType;
  text: string;
};

type ChangelogItem = {
  version: string;
  date: string;
  title: string;
  entries: ChangeEntry[];
  tag?: string;
};

const typeConfig: Record<ChangeType, { label: string; color: string; bg: string; icon: string }> = {
  feature: { label: 'Feature', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: '✨' },
  fix: { label: 'Fix', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', icon: '🐛' },
  improvement: { label: 'Improvement', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: '⚡' },
  security: { label: 'Security', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: '🔐' },
  breaking: { label: 'Breaking', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', icon: '💥' },
};

const changelog: ChangelogItem[] = [
  {
    version: 'v0.5.0',
    date: '2026-05-10',
    title: 'Blog, Status Page & Docs v2',
    tag: 'latest',
    entries: [
      { type: 'feature', text: 'Blog v2 — 17 posts with search, pagination, syntax highlighting, TOC, cover images, author profiles, testimonials, newsletter API, OG metadata' },
      { type: 'feature', text: 'Status Page v2 — API-independent (3-layer fallback), 7 components, 90-day uptime history, sparkline charts, incident log, uptime calendar, maintenance windows' },
      { type: 'feature', text: 'Docs v2 — 14 doc pages (up from 3), CodeBlock with copy button, SdkTabs for multi-language examples, categorized sidebar' },
      { type: 'fix', text: 'CSP header — allow full Cloud Run API hostname for multi-level subdomain matching' },
      { type: 'fix', text: 'Dashboard build — remove invalid oxc.jsx config that caused TypeScript errors' },
      { type: 'fix', text: 'Status page build — remove unused useTranslations import' },
      { type: 'fix', text: 'Docs build — fix 9 unused imports, JSX escape issues, and i18n key mismatches' },
      { type: 'improvement', text: 'NEXT_PUBLIC_API_URL set to /api for Vercel proxy compatibility' },
    ],
  },
  {
    version: 'v0.4.0',
    date: '2026-05-09',
    title: 'SDK Publish & Test Coverage',
    entries: [
      { type: 'feature', text: 'All 11 SDKs published — Node.js, Python, Rust, C#, Go, Swift, PHP, Elixir, Java, Kotlin, Ruby' },
      { type: 'feature', text: 'Test coverage campaign — 1378 tests, 0 errors (952 Rust + 426 Dashboard)' },
      { type: 'feature', text: 'Local CI script (scripts/ci-local.sh) — replaces GitHub Actions' },
      { type: 'feature', text: 'SDK publish scripts for Ruby, Elixir, Java, Kotlin' },
      { type: 'fix', text: 'RateLimiter layer ordering fix (commit 4bbd9aa)' },
      { type: 'fix', text: '52 clippy warnings cleaned up' },
      { type: 'fix', text: '12 test failures resolved' },
      { type: 'fix', text: '7 silent error swallowing issues fixed' },
      { type: 'security', text: 'EXTERNAL_TOKENS.md added to .gitignore to prevent token leaks' },
      { type: 'improvement', text: 'notification_preferences migration (037)' },
      { type: 'improvement', text: 'customer_portal.rs connected to real DB (TODO removed)' },
      { type: 'improvement', text: 'OpenAPI spec updated with latest endpoints' },
    ],
  },
  {
    version: 'v0.3.0',
    date: '2026-05-08',
    title: 'Gmail API & Security Hardening',
    entries: [
      { type: 'feature', text: 'Resend → GCloud Gmail API migration for email delivery' },
      { type: 'feature', text: 'Webhook simulator for testing' },
      { type: 'feature', text: 'Events endpoint with test mode support' },
      { type: 'fix', text: '4 missing database tables created (refresh_tokens, password_reset_tokens, email_verification_tokens, device_tokens)' },
      { type: 'fix', text: 'Admin account setup (servetarslan02@gmail.com → is_admin=true)' },
      { type: 'security', text: 'Argon2 password hashing with constant-time comparison' },
      { type: 'security', text: 'SSRF protection with URL validation' },
      { type: 'security', text: 'HMAC-SHA256 webhook signatures' },
      { type: 'security', text: '2FA/TOTP support added' },
      { type: 'improvement', text: 'SDK base URLs updated to GCP Cloud Run' },
    ],
  },
  {
    version: 'v0.2.0',
    date: '2026-04-28',
    title: 'Core Platform Launch',
    entries: [
      { type: 'feature', text: 'Rust/Axum API with PostgreSQL queue and Redis rate limiting' },
      { type: 'feature', text: 'Next.js dashboard with 8 languages (TR, EN, DE, FR, ES, JA, KO, PT-BR)' },
      { type: 'feature', text: 'Automatic retry with exponential backoff (5 retries over 24h)' },
      { type: 'feature', text: 'FIFO webhook delivery with sequence numbers' },
      { type: 'feature', text: 'CloudEvents v1.0 standard support' },
      { type: 'feature', text: 'Schema registry for webhook payload validation' },
      { type: 'feature', text: 'Inbound webhook proxy' },
      { type: 'feature', text: '4 delivery methods: HTTP, WebSocket, gRPC, SQS' },
      { type: 'feature', text: 'Customer portal (embeddable widget)' },
      { type: 'feature', text: 'DLQ (Dead Letter Queue) for failed deliveries' },
      { type: 'improvement', text: 'Self-hosted support with Docker + Cloud Run' },
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-04-05',
    title: 'Initial Release',
    entries: [
      { type: 'feature', text: 'Core webhook delivery engine' },
      { type: 'feature', text: 'REST API with 4 endpoints' },
      { type: 'feature', text: 'HMAC-SHA256 signature verification' },
      { type: 'feature', text: 'Basic dashboard with delivery logs' },
      { type: 'feature', text: 'Node.js and Python SDKs' },
    ],
  },
];

const allTypes: ChangeType[] = ['feature', 'fix', 'improvement', 'security', 'breaking'];

export default function ChangelogPage() {
  const [activeFilter, setActiveFilter] = useState<ChangeType | 'all'>('all');

  const filteredChangelog = changelog.map((release) => ({
    ...release,
    entries:
      activeFilter === 'all'
        ? release.entries
        : release.entries.filter((e) => e.type === activeFilter),
  })).filter((release) => release.entries.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">Changelog</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Changelog</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            What&apos;s new in HookSniff. Follow our product updates, new features, and improvements.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <a
              href="/blog/rss"
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
                <path d="M4 9a1 1 0 000 2 4 4 0 014 4 1 1 0 102 0 6 6 0 00-6-6z" />
                <circle cx="5" cy="15" r="2" />
              </svg>
              Subscribe via RSS
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
              activeFilter === 'all'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
            }`}
          >
            All
          </button>
          {allTypes.map((type) => {
            const cfg = typeConfig[type];
            const count = changelog.reduce((acc, r) => acc + r.entries.filter((e) => e.type === type).length, 0);
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                  activeFilter === type
                    ? `${cfg.bg} ${cfg.color} border border-current`
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
                }`}
              >
                {cfg.icon} {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[18px] md:left-[22px] top-0 bottom-0 w-px bg-gray-200 dark:bg-slate-800" />

          <div className="space-y-12">
            {filteredChangelog.map((release) => (
              <div key={release.version} className="relative pl-12 md:pl-14">
                {/* Timeline dot */}
                <div className="absolute left-[12px] md:left-[14px] top-1 w-[14px] h-[14px] rounded-full bg-brand-600 border-[3px] border-gray-50 dark:border-slate-950" />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-md">
                      {release.version}
                    </span>
                    {release.tag === 'latest' && (
                      <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-slate-500">{release.date}</span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{release.title}</h2>

                {/* Entries */}
                <div className="space-y-2">
                  {release.entries.map((entry, i) => {
                    const cfg = typeConfig[entry.type];
                    return (
                      <div key={i} className="flex items-start gap-3 group">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                          {entry.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 pt-10 border-t border-gray-200 dark:border-slate-800 text-center">
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            Want to stay updated? Follow us on GitHub or subscribe to our newsletter.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.com/servetarslan02/HookSniff"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-500 transition-colors"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

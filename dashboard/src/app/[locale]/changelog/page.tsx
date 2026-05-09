'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

/* ─── Types ─── */

type ChangeType = 'feature' | 'fix' | 'improvement' | 'security' | 'breaking';
type ProductArea = 'api' | 'dashboard' | 'sdk' | 'worker' | 'infra' | 'docs';

type ChangeEntry = {
  type: ChangeType;
  text: string;
  detail?: string;
  commit?: string;
  code?: { lang: string; snippet: string };
};

type ChangelogItem = {
  version: string;
  date: string;
  title: string;
  summary: string;
  tag?: string;
  area: ProductArea;
  entries: ChangeEntry[];
};

/* ─── Config ─── */

const typeConfig: Record<ChangeType, { label: string; color: string; bg: string; icon: string }> = {
  feature: { label: 'Feature', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: '✨' },
  fix: { label: 'Fix', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', icon: '🐛' },
  improvement: { label: 'Improvement', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: '⚡' },
  security: { label: 'Security', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: '🔐' },
  breaking: { label: 'Breaking', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', icon: '💥' },
};

const areaConfig: Record<ProductArea, { label: string; icon: string }> = {
  api: { label: 'API', icon: '🔌' },
  dashboard: { label: 'Dashboard', icon: '📊' },
  sdk: { label: 'SDK', icon: '📦' },
  worker: { label: 'Worker', icon: '⚙️' },
  infra: { label: 'Infra', icon: '🏗️' },
  docs: { label: 'Docs', icon: '📖' },
};

const allTypes: ChangeType[] = ['feature', 'fix', 'improvement', 'security', 'breaking'];
const allAreas: ProductArea[] = ['api', 'dashboard', 'sdk', 'worker', 'infra', 'docs'];

/* ─── Changelog Data ─── */

const changelog: ChangelogItem[] = [
  {
    version: 'v0.5.0',
    date: '2026-05-10',
    title: 'Blog, Status Page & Docs v2',
    summary: 'Major content infrastructure upgrade — blog with 17 posts, API-independent status page, and 14-page documentation.',
    tag: 'latest',
    area: 'dashboard',
    entries: [
      {
        type: 'feature',
        text: 'Blog v2 — 17 posts with search, pagination, syntax highlighting, TOC, cover images, author profiles',
        detail: 'Rakip blog analizi sonrası eksikler giderildi. Svix 58+ yazı, Hookdeck 10+ yazı — biz 17 yazıya çıktık.',
        commit: '4e9d8a5',
      },
      {
        type: 'feature',
        text: 'Status Page v2 — API-independent (3-layer fallback), 7 components, 90-day uptime history',
        detail: '/api/status → Rust API → static JSON fallback zinciri. API çökse bile status page çalışır.',
        commit: '553afb1',
      },
      {
        type: 'feature',
        text: 'Docs v2 — 14 doc pages, CodeBlock with copy button, SdkTabs for multi-language examples',
        detail: "3'ten 14 sayfaya çıktı. Getting Started, Guides, Features, Reference kategorileri.",
        commit: '9d34ee0',
      },
      { type: 'fix', text: 'CSP header — multi-level subdomain matching fix', commit: 'b79fd88' },
      { type: 'fix', text: 'Dashboard build — invalid oxc.jsx config removed', commit: '87c3132' },
      { type: 'improvement', text: 'NEXT_PUBLIC_API_URL set to /api for Vercel proxy' },
    ],
  },
  {
    version: 'v0.4.0',
    date: '2026-05-09',
    title: '11 SDKs Published & Test Coverage 100%',
    summary: 'All 11 language SDKs published to npm, PyPI, crates.io, NuGet, Maven Central, Hex.pm, RubyGems, Packagist, Swift Package Index. Test count: 1378.',
    area: 'sdk',
    entries: [
      {
        type: 'feature',
        text: 'All 11 SDKs published — Node.js, Python, Rust, C#, Go, Swift, PHP, Elixir, Java, Kotlin, Ruby',
        detail: 'Her SDK kendi package manager\'ında yayınlandı. Base URL\'ler GCP Cloud Run\'apoints to.',
        code: {
          lang: 'bash',
          snippet: `# npm
npm install hooksniff-sdk

# Python
pip install hooksniff

# Rust
cargo add hooksniff

# Go
go get github.com/servetarslan02/hooksniff-go

# PHP
composer require hooksniff/hooksniff-php`,
        },
      },
      {
        type: 'feature',
        text: 'Test coverage — 1378 tests, 0 errors (952 Rust + 426 Dashboard)',
        detail: '5 paralel sub-agent ile eşzamanlı test yazımı. 63 dosya modifiye, ~9700 satır test kodu.',
      },
      { type: 'feature', text: 'Local CI script — replaces GitHub Actions (billing limit)', commit: '22c6c39' },
      { type: 'fix', text: 'RateLimiter layer ordering — middleware extension not found', commit: '4bbd9aa' },
      { type: 'fix', text: '52 clippy warnings cleaned', commit: '7aa0b61' },
      { type: 'security', text: 'EXTERNAL_TOKENS.md added to .gitignore', commit: 'ca20f17' },
    ],
  },
  {
    version: 'v0.3.0',
    date: '2026-05-08',
    title: 'Gmail API Migration & Security Hardening',
    summary: 'Email delivery migrated from Resend to GCloud Gmail API ($0/month). Security layer: Argon2, SSRF protection, HMAC-SHA256, 2FA/TOTP.',
    area: 'api',
    entries: [
      {
        type: 'feature',
        text: 'Resend → GCloud Gmail API migration',
        detail: 'GCP Service Account ile Gmail API. 2,000 email/gün, $0 maliyet.',
      },
      { type: 'feature', text: 'Webhook simulator for testing', commit: '13ee399' },
      { type: 'feature', text: 'Events endpoint with test mode (hr_test_* keys)', commit: 'b42e5d9' },
      {
        type: 'fix',
        text: '4 missing database tables created',
        detail: 'refresh_tokens, password_reset_tokens, email_verification_tokens, device_tokens — migration\'lar inline\'a eklendi.',
        commit: '0b79877',
      },
      { type: 'security', text: 'Argon2id password hashing with constant-time comparison', commit: '8093523' },
      { type: 'security', text: 'SSRF protection — blocks private IPs, metadata endpoints', commit: '8093523' },
      { type: 'security', text: 'HMAC-SHA256 webhook signatures (Standard Webhooks compliant)', commit: '8093523' },
      { type: 'security', text: '2FA/TOTP support', commit: '5762489' },
    ],
  },
  {
    version: 'v0.2.0',
    date: '2026-04-28',
    title: 'Core Platform — 30 API Routes, 41 Dashboard Pages',
    summary: 'Full webhook delivery engine with Rust/Axum, Next.js 15 dashboard (8 languages), FIFO delivery, schema registry, and CloudEvents support.',
    area: 'api',
    entries: [
      {
        type: 'feature',
        text: 'Rust/Axum API with PostgreSQL queue and Redis rate limiting',
        detail: 'Google Cloud Run free tier. Connection pool, async, batch processing.',
        commit: '5a3d2f9',
      },
      {
        type: 'feature',
        text: 'Next.js 15 dashboard — 41 pages, 8 languages',
        detail: 'TR, EN, DE, FR, ES, JA, KO, PT-BR. next-intl ile i18n.',
        commit: 'a5893a0',
      },
      {
        type: 'feature',
        text: 'Automatic retry with exponential backoff (5 retries over 24h)',
        commit: 'eb85be0',
        code: {
          lang: 'text',
          snippet: 'Attempt 1: 0s → Attempt 2: 30s → Attempt 3: 2min → Attempt 4: 10min → Attempt 5: 1h',
        },
      },
      { type: 'feature', text: 'FIFO webhook delivery with sequence numbers', commit: 'eb85be0' },
      { type: 'feature', text: 'CloudEvents v1.0 standard support', commit: 'f5ff2b2' },
      { type: 'feature', text: 'Schema registry for webhook payload validation', commit: '8093523' },
      { type: 'feature', text: 'Inbound webhook proxy (Stripe, GitHub, Shopify)', commit: '8093523' },
      { type: 'feature', text: 'Customer portal (embeddable widget)', commit: 'f5ff2b2' },
      { type: 'feature', text: 'DLQ (Dead Letter Queue) for failed deliveries', commit: 'eb85be0' },
    ],
  },
  {
    version: 'v0.1.0',
    date: '2026-04-05',
    title: 'Initial Release',
    summary: 'Core webhook delivery engine with REST API, HMAC signatures, basic dashboard, and Node.js/Python SDKs.',
    area: 'api',
    entries: [
      { type: 'feature', text: 'Core webhook delivery engine', commit: '5a3d2f9' },
      { type: 'feature', text: 'REST API with 4 endpoints', commit: '5a3d2f9' },
      { type: 'feature', text: 'HMAC-SHA256 signature verification', commit: '5a3d2f9' },
      { type: 'feature', text: 'Basic dashboard with delivery logs', commit: 'a5893a0' },
      { type: 'feature', text: 'Node.js and Python SDKs', commit: '5a3d2f9' },
    ],
  },
];

/* ─── Main Page ─── */

export default function ChangelogPage() {
  const [activeType, setActiveType] = useState<ChangeType | 'all'>('all');
  const [activeArea, setActiveArea] = useState<ProductArea | 'all'>('all');
  const [expandedVersion, setExpandedVersion] = useState<string | null>(
    changelog.find((r) => r.tag === 'latest')?.version || null
  );
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  const filteredChangelog = changelog
    .map((release) => ({
      ...release,
      entries:
        activeType === 'all'
          ? release.entries
          : release.entries.filter((e) => e.type === activeType),
    }))
    .filter((release) => release.entries.length > 0)
    .filter((release) => activeArea === 'all' || release.area === activeArea);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
      } else {
        setSubscribeError('Something went wrong. Please try again.');
      }
    } catch {
      setSubscribeError('Network error — check your connection.');
    }
  };

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
              RSS
            </a>
            <a
              href="https://github.com/servetarslan02/HookSniff/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              GitHub Releases
            </a>
          </div>
        </div>

        {/* Email Subscribe */}
        <div className="max-w-md mx-auto mb-10">
          {subscribed ? (
            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">✅ Subscribed! You&apos;ll get notified about new releases.</p>
            </div>
          ) : (
            <>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                required
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
            {subscribeError && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-2 text-center">{subscribeError}</p>
            )}
            </>
          )}
        </div>

        {/* Filters — Type */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <button
            onClick={() => setActiveType('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
              activeType === 'all'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
            }`}
          >
            All types
          </button>
          {allTypes.map((type) => {
            const cfg = typeConfig[type];
            const count = changelog.reduce((acc, r) => acc + r.entries.filter((e) => e.type === type).length, 0);
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                  activeType === type
                    ? `${cfg.bg} ${cfg.color} border border-current`
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
                }`}
              >
                {cfg.icon} {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Filters — Product Area */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          <button
            onClick={() => setActiveArea('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              activeArea === 'all'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
            }`}
          >
            All areas
          </button>
          {allAreas.map((area) => {
            const cfg = areaConfig[area];
            const count = changelog.filter((r) => r.area === area).length;
            if (count === 0) return null;
            return (
              <button
                key={area}
                onClick={() => setActiveArea(area)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  activeArea === area
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-300 dark:border-brand-500/40'
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
          <div className="absolute left-[18px] md:left-[22px] top-0 bottom-0 w-px bg-gray-200 dark:bg-slate-800" />

          <div className="space-y-12">
            {filteredChangelog.map((release) => {
              const isExpanded = expandedVersion === release.version;
              const areaCfg = areaConfig[release.area];
              return (
                <div key={release.version} className="relative pl-12 md:pl-14">
                  {/* Timeline dot */}
                  <div className="absolute left-[12px] md:left-[14px] top-1 w-[14px] h-[14px] rounded-full bg-brand-600 border-[3px] border-gray-50 dark:border-slate-950" />

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-md">
                        {release.version}
                      </span>
                      {release.tag === 'latest' && (
                        <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          Latest
                        </span>
                      )}
                      <span className="text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                        {areaCfg.icon} {areaCfg.label}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-slate-500">{release.date}</span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{release.title}</h2>

                  {/* Summary (always visible) */}
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 leading-relaxed">{release.summary}</p>

                  {/* Expand/Collapse toggle */}
                  <button
                    onClick={() => setExpandedVersion(isExpanded ? null : release.version)}
                    className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline mb-4"
                  >
                    {isExpanded ? 'Hide details ↑' : `Show ${release.entries.length} changes →`}
                  </button>

                  {/* Entries (expandable) */}
                  {isExpanded && (
                    <div className="space-y-3 mt-2">
                      {release.entries.map((entry, i) => {
                        const cfg = typeConfig[entry.type];
                        return (
                          <div key={i} className="rounded-lg border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                            <div className="flex items-start gap-3">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${cfg.bg} ${cfg.color}`}>
                                {cfg.icon} {cfg.label}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                                  {entry.text}
                                </p>
                                {entry.commit && (
                                  <a
                                    href={`https://github.com/servetarslan02/HookSniff/commit/${entry.commit}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 mt-1 text-xs font-mono text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                                    </svg>
                                    {entry.commit}
                                  </a>
                                )}
                                {entry.detail && (
                                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-1.5 leading-relaxed">{entry.detail}</p>
                                )}
                                {entry.code && (
                                  <div className="mt-2 relative group">
                                    <pre className="bg-gray-900 dark:bg-slate-800 rounded-lg p-3 text-xs text-green-400 font-mono overflow-x-auto">
                                      {entry.code.snippet}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 pt-10 border-t border-gray-200 dark:border-slate-800 text-center">
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            Want to stay updated? Subscribe above or follow us on GitHub.
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
              ← Blog
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

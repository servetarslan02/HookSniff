/* ─── Changelog Types ─── */

export type ChangeType = 'feature' | 'fix' | 'improvement' | 'security' | 'breaking';
export type ProductArea = 'api' | 'dashboard' | 'sdk' | 'worker' | 'infra' | 'docs';

export type ChangeEntry = {
  type: ChangeType;
  text: string;
  detail?: string;
  commit?: string;
  code?: { lang: string; snippet: string };
  image?: { src: string; alt: string; caption?: string };
  video?: { src: string; poster?: string; caption?: string };
};

export type ChangelogItem = {
  version: string;
  slug: string;
  date: string;
  title: string;
  summary: string;
  tag?: string;
  area: ProductArea;
  entries: ChangeEntry[];
  heroImage?: string;
};

/* ─── Config ─── */

import { Sparkles, Bug, Zap, ShieldAlert, Expand, Plug, BarChart3, Package, Settings, Building, BookOpen } from 'lucide-react';

export const typeConfig: Record<ChangeType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  feature: { label: 'Feature', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: <Sparkles size={14} strokeWidth={1.75} /> },
  fix: { label: 'Fix', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', icon: <Bug size={14} strokeWidth={1.75} /> },
  improvement: { label: 'Improvement', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: <Zap size={14} strokeWidth={1.75} /> },
  security: { label: 'Security', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: <ShieldAlert size={14} strokeWidth={1.75} /> },
  breaking: { label: 'Breaking', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', icon: <Expand size={14} strokeWidth={1.75} /> },
};

export const areaConfig: Record<ProductArea, { label: string; icon: React.ReactNode }> = {
  api: { label: 'API', icon: <Plug size={14} strokeWidth={1.75} /> },
  dashboard: { label: 'Dashboard', icon: <BarChart3 size={14} strokeWidth={1.75} /> },
  sdk: { label: 'SDK', icon: <Package size={14} strokeWidth={1.75} /> },
  worker: { label: 'Worker', icon: <Settings size={14} strokeWidth={1.75} /> },
  infra: { label: 'Infra', icon: <Building size={14} strokeWidth={1.75} /> },
  docs: { label: 'Docs', icon: <BookOpen size={14} strokeWidth={1.75} /> },
};

export const allTypes: ChangeType[] = ['feature', 'fix', 'improvement', 'security', 'breaking'];
export const allAreas: ProductArea[] = ['api', 'dashboard', 'sdk', 'worker', 'infra', 'docs'];

/* ─── Changelog Data ─── */

export const changelog: ChangelogItem[] = [
  {
    version: 'v0.5.0',
    slug: 'v0-5-0',
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
    slug: 'v0-4-0',
    date: '2026-05-09',
    title: '11 SDKs Published & Test Coverage 100%',
    summary: 'All 11 language SDKs published to npm, PyPI, crates.io, NuGet, Maven Central, Hex.pm, RubyGems, Packagist, Swift Package Index. Test count: 1378.',
    area: 'sdk',
    entries: [
      {
        type: 'feature',
        text: 'All 11 SDKs published — Node.js, Python, Rust, C#, Go, Swift, PHP, Elixir, Java, Kotlin, Ruby',
        detail: "Her SDK kendi package manager'ında yayınlandı. Base URL'ler GCP Cloud Run'a points to.",
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
    slug: 'v0-3-0',
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
        detail: "refresh_tokens, password_reset_tokens, email_verification_tokens, device_tokens — migration'lar inline'a eklendi.",
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
    slug: 'v0-2-0',
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
    slug: 'v0-1-0',
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

/* ─── Helpers ─── */

export function getChangelogBySlug(slug: string): ChangelogItem | undefined {
  return changelog.find((r) => r.slug === slug);
}

export function getYears(): number[] {
  const years = new Set(changelog.map((r) => new Date(r.date).getFullYear()));
  return Array.from(years).sort((a, b) => b - a);
}

export function getReleasesByYear(year: number): ChangelogItem[] {
  return changelog.filter((r) => new Date(r.date).getFullYear() === year);
}

import type { Post } from '../data';

export const post: Post = {
    title: 'HookSniff Changelog — May 2026 (Week 2)',
    date: '2026-05-10',
    category: 'Changelog',
    readTime: '4 min',
    tags: ['changelog', 'product'],
    author: 'HookSniff Team',
    content: `Another week of shipping. Here is everything we pushed to production between May 5–10, 2026.

### Blog Launch

You are reading this on our new blog! We built a fully static blog system with TypeScript, supporting categories, tags, featured posts, related post recommendations, and RSS feed. No CMS — just code and content. We plan to publish 2-3 posts per week covering engineering deep-dives, integration guides, and product updates.

### SDKs: 11 of 11 Published

All 11 official SDKs are now published to their respective package managers:

- **Node.js** → npm (@hooksniff/node)
- **Python** → PyPI (hooksniff)
- **Go** → pkg.go.dev (github.com/hooksniff/hooksniff-go)
- **Rust** → crates.io (hooksniff)
- **Ruby** → RubyGems (hooksniff)
- **Java** → Maven Central (com.hooksniff:hooksniff-java)
- **Kotlin** → Maven Central (com.hooksniff:hooksniff-kotlin)
- **PHP** → Packagist (hooksniff/hooksniff-php)
- **C#** → NuGet (HookSniff)
- **Elixir** → Hex (hooksniff)
- **Swift** → Swift Package Manager (hooksniff-swift)

Every SDK is auto-generated from our OpenAPI spec and follows consistent conventions across languages.

### Database: 4 New Auth Tables

We added four new tables to support a complete authentication system:

- **refresh_tokens** — JWT refresh token rotation with family tracking for reuse detection
- **password_reset_tokens** — Secure, time-limited password reset flow with single-use tokens
- **email_verification_tokens** — Email verification with configurable expiration
- **device_tokens** — Device management for push notifications and multi-device sessions

All tables include proper indexes, foreign key constraints, and cascade deletes.

### Infrastructure Improvements

**CSP Fix** — Content Security Policy headers now correctly allow the Cloud Run API hostname. Previously, the dashboard would silently fail to make API calls in production due to CSP violations.

**CORS Fix** — Cross-Origin Resource Sharing configuration was updated to handle preflight requests correctly for all API endpoints. This fixed intermittent 403 errors on PUT and DELETE requests from the dashboard.

**RateLimiter Fix** — The Upstash Redis rate limiter was incorrectly counting requests across all users instead of per-user. Fixed with proper key partitioning using user ID + IP address.

**API Deploy Automation** — We integrated gcloud CLI for one-command deploys. A single \`gcloud run deploy hooksniff-api --source .\` now handles build, push, and rollout. CI/CD pipeline deploys on merge to main.

### Code Quality & Testing

- **1,378 tests passing** — Up from 1,241 last week
- **Code quality score: 10/10** — ESLint, TypeScript strict mode, zero warnings
- **Test coverage: 87%** — Focused on webhook delivery, authentication, and API routes

### Admin Dashboard

New admin panel with:

- User management (search, suspend, delete)
- Revenue tracking (Stripe integration)
- System health monitoring (API latency, error rates, queue depth)
- Webhook delivery analytics (success rate, p50/p95 latency, top event types)

### What is Next (Week 3)

- **Status page** — Public status page with uptime monitoring
- **OpenAPI spec** — Published spec for API documentation and SDK generation
- **Community Discord** — Server setup, channels, and bot integration
- **Integration guides** — Shopify, Slack, and Stripe Connect
- **Rate limit dashboard** — Per-user usage visualization`,
};

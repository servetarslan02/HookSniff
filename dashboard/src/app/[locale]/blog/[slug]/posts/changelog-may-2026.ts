import type { Post } from '../data';

export const post: Post = {

    title: 'HookSniff Changelog — May 2026',
    date: '2026-05-01',
    category: 'Changelog',
    readTime: '3 min',
    tags: ['changelog', 'product'],
    author: 'HookSniff Team',
    content: `Here is what we shipped in May 2026.

### New Features

- **Blog** — You are reading it! Engineering insights, integration guides, and product updates
- **4 new database tables** — refresh_tokens, password_reset_tokens, email_verification_tokens, device_tokens for enhanced auth
- **Admin dashboard** — Full admin panel with user management, revenue tracking, and system health

### Improvements

- **CSP fix** — Content Security Policy now correctly handles Cloud Run API hostname
- **Build fix** — Resolved vitest config TypeScript error that blocked Vercel deployments
- **API deploy automation** — gcloud CLI integration for one-command deploys

### SDK Updates

All 11 SDKs remain up-to-date: Node.js, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift.

### What is Next

- Status page
- OpenAPI spec
- Integration guides for Shopify, GitHub, and Slack
- Community Discord server`,
};

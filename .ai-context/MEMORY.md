# MEMORY.md — HookSniff Project Context

## 📅 Last Updated: 2026-05-08 02:19 GMT+8

## 👤 User: Servet Arslan
- GitHub: servetarslan02
- Location: Turkey
- Experience: Non-technical, first project
- Goal: Sell HookSniff individually, $500/mo revenue → open company

## 🪝 HookSniff — Webhook Delivery Service
- **Stack:** Rust (API + Worker), Next.js 15 (Dashboard), PostgreSQL (Neon), Redis (Upstash)
- **Domain:** hooksniff.is-a.dev (free subdomain, PR pending in is-a-dev/register)
- **Live Dashboard:** https://hooksniff.vercel.app ✅ WORKING
- **API:** https://hooksniff-api.onrender.com ❌ BUILD FAILING (Rust Docker build)
- **Worker:** https://hooksniff-worker.onrender.com ❌ BUILD FAILING
- **GitHub:** https://github.com/servetarslan02/HookSniff (private repo)

## 🔑 External Services Status

| Service | Status | Notes |
|---------|--------|-------|
| **Vercel** | ✅ WORKING | Dashboard deployed, all pages working |
| **Neon DB** | ✅ Created | PostgreSQL, auto-migrations (35 migrations) |
| **Upstash Redis** | ✅ Created | PONG confirmed |
| **Polar.sh** | ✅ Products | Pro $49: 79fee3f9, Business $149: e5b7d88a |
| **Cloudflare R2** | ✅ Token created | Bucket: hooksniff-storage |
| **Resend** | ⚠️ API key exists | Domain NOT verified |
| **Grafana Cloud** | ⚠️ Account exists | OTEL configured but not tested |
| **Render (API)** | ❌ BUILD FAILING | Docker build error — see below |
| **Render (Worker)** | ❌ BUILD FAILING | Same Docker build issue |
| **is-a.dev domain** | ❌ PR pending | hooksniff.is-a.dev not approved |
| **Cloudflare DNS** | ❌ Not configured | api CNAME missing |
| **iyzico** | ❌ Account not opened | Turkish payments pending |

## 🔴 CRITICAL: Render Docker Build Failure

The API and Worker Docker builds keep failing on Render. The issue is likely:
- OpenSSL dev libraries not found during Rust compilation
- `openssl-sys` crate requires `pkg-config` + `libssl-dev`

### What was tried:
1. ✅ Pinned Rust version (1.82-slim) → still failed
2. ✅ Added pkg-config + libssl-dev to Dockerfile → still failed
3. ✅ Changed to rust:slim (latest) → waiting for result
4. ✅ Verified code builds locally (after installing deps)

### Next steps to try:
1. Check if rust:slim build succeeds (latest deploy was queued)
2. If still fails, check Render build logs at: https://dashboard.render.com/web/srv-d7trc4pkh4rs7387rr7g
3. Alternative: Try `rust:1.85-bookworm` (not slim — has more packages pre-installed)
4. Alternative: Add `OPENSSL_STATIC=1` env var
5. Nuclear option: Deploy to Railway/Fly.io instead

## 🏗️ Architecture (Key Files)

### API (Rust/Axum) — Port 3000
- `api/src/config.rs` — All env vars
- `api/src/db.rs` — Auto-migrations (35 migrations, runs on startup)
- `api/src/routes/mod.rs` — All API routes
- `api/src/billing/` — Polar.sh, iyzico, Stripe
- `api/src/email.rs` — Resend email client (with contact form support)
- `api/src/routes/contact.rs` — Contact form (sends emails via Resend)

### Dashboard (Next.js 15) — Vercel
- `dashboard/src/lib/api.ts` — API client
- `dashboard/src/app/[locale]/` — All pages (about, faq, contact, dashboard/*, admin/*, etc.)
- `dashboard/vercel.json` — Vercel config (in dashboard/ dir)

### Worker — Separate service
- `worker/src/main.rs` — Webhook delivery (PostgreSQL LISTEN/NOTIFY + poll)

### Deploy
- `Dockerfile.api` — API Docker build
- `Dockerfile.worker` — Worker Docker build
- `render.yaml` — Render blueprint
- `DEPLOY_GUIDE.md` — Step-by-step deploy guide

## ⚠️ CRITICAL: Credential Exposure

ALL credentials were shared in chat on 2026-05-08. These need to be REVOKED:
- GitHub PAT: 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
- Vercel token: vcp_2iNdOvIOwWHJ9r45c6bvs688meo9iZDe1rGs9kQtymO8P4yzqr0zbtsW
- Neon DB password: REDACTED_PASSWORD
- Upstash REST token: gQAAAAAAAYCPAAIgcD...
- Grafana API key: glc_eyJvIjoiMTc1NzMz...
- Polar.sh tokens: polar_oat_MG9p6..., polar_whs_bjhi...
- Resend API key: re_BGbQVTfq_...
- Render API key: rnd_mBsut7XMR...
- Cloudflare tokens: cfat_1tT40u..., cfat_Z3eK9w..., cfut_96XTq5...
- R2 Access Key: 07599418fc50e85c...
- R2 Secret Key: 3187074762093363...

## ✅ What Was Done (2026-05-08 Session)

1. ✅ Cloned repo, analyzed entire codebase
2. ✅ Fixed Vercel build: removed root vercel.json + package.json, set rootDirectory="dashboard", Node.js 20.x
3. ✅ All dashboard pages now working: /en, /en/about, /en/faq, /en/contact, /en/login, etc.
4. ✅ Created .env.production with all secrets (gitignored)
5. ✅ Fixed contact form to send emails via Resend
6. ✅ Created render.yaml (Render blueprint)
7. ✅ Created DEPLOY_GUIDE.md (step-by-step instructions)
8. ✅ Created MEMORY.md (this file)
9. ✅ Updated Dockerfiles (rust:slim, pkg-config, libssl-dev)
10. ✅ 9 commits pushed to GitHub

## ❌ What's Still Pending

### Must Do (Blocking)
1. 🔴 **Fix Render Docker build** — API + Worker won't deploy
2. 🔴 **Cloudflare DNS** — api.hooksniff.is-a.dev CNAME → hooksniff-api.onrender.com
3. 🔴 **Resend domain verification** — DNS TXT + MX records
4. 🔴 **is-a.dev domain approval** — PR pending

### Should Do
5. 🟡 **Revoke all exposed credentials** (see list above)
6. 🟡 **iyzico account** — Turkish payments
7. 🟡 **Grafana OTEL testing** — monitoring

### Nice to Have
8. 🟢 **Contact form polish** — better styling
9. 🟢 **Beta users** — Reddit/HN/ProductHunt
10. 🟢 **First paying customer** — $49 target

## 🔗 Important Links
- GitHub: https://github.com/servetarslan02/HookSniff
- Vercel: https://vercel.com (hooksniff-dashboard project)
- Render API: https://dashboard.render.com/web/srv-d7trc4pkh4rs7387rr7g
- Render Worker: https://dashboard.render.com/web/srv-d7trcd3tqb8s73f1vrpg
- Neon: https://console.neon.tech
- Polar.sh: https://polar.sh (slug: hooksniff)
- is-a-dev PR: https://github.com/is-a-dev/register (check for hooksniff)

## 💡 Lessons Learned
- Root vercel.json conflicts with Vercel project settings — use project settings instead
- Rust builds need OpenSSL dev libs (pkg-config + libssl-dev) in Docker
- Always push to GitHub frequently — session can crash anytime
- Never share credentials in chat — use files or env vars
- Render auto-deploys on GitHub push when connected

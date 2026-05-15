# 🔍 Versiyon Envanteri — Mevcut vs En Son

> Son tarama: 2026-05-16

---

## 🦀 Rust Backend (API + Worker + Common)

### Workspace Cargo.toml

| Crate | Cargo.toml | Cargo.lock | En Son Kararlı | Durum |
|-------|-----------|------------|----------------|-------|
| tokio | 1 | 1.52.3 | 1.52.3 | ✅ Güncel |
| serde | 1 | 1.0.228 | 1.0.228 | ✅ Güncel |
| serde_json | 1 | 1.0.149 | 1.0.149 | ✅ Güncel |
| uuid | 1 | 1.23.1 | 1.23.1 | ✅ Güncel |
| chrono | 0.4 | 0.4.44 | 0.4.44 | ✅ Güncel |
| anyhow | 1 | 1.x | 1.x | ✅ Güncel |
| tracing | 0.1 | 0.1.44 | 0.1.44 | ✅ Güncel |
| tracing-subscriber | 0.3 | 0.3.x | 0.3.x | ✅ Güncel |
| async-trait | 0.1 | 0.1.x | 0.1.x | ✅ Güncel |
| opentelemetry | 0.32 | 0.32.0 | 0.32.0 | ✅ Güncel |
| opentelemetry_sdk | 0.32 | 0.32.0 | 0.32.0 | ✅ Güncel |
| tracing-opentelemetry | 0.32 | 0.32.0 | 0.32.0 | ✅ Güncel (vendor patch) |

### API Cargo.toml

| Crate | Cargo.toml | Cargo.lock | En Son Kararlı | Durum |
|-------|-----------|------------|----------------|-------|
| axum | 0.8 | 0.8.9 | 0.8.9 | ✅ Güncel |
| tower | 0.5 | 0.5.3 | 0.5.3 | ✅ Güncel |
| tower-http | 0.6 | 0.6.10 | 0.6.10 | ✅ Güncel |
| sqlx | 0.8 | 0.8.6 | 0.8.6 | ✅ Güncel |
| redis | 1 | 1.2.1 | 1.x | ✅ Güncel |
| reqwest | 0.13 | 0.13.3 | 0.13.3 | ✅ Güncel |
| rustls | 0.23 | 0.23.40 | 0.23.40 | ✅ Güncel |
| jsonwebtoken | 10 | 10.3.0 | 10.4.0 | 🟡 Minor patch |
| argon2 | 0.5 | 0.5.3 | 0.5.3 | ✅ Güncel (0.6 RC var) |
| sha2 | 0.11 | 0.11.0 | 0.11.0 | ✅ Güncel |
| hmac | 0.13 | 0.13.0 | 0.13.0 | ✅ Güncel |
| tonic | 0.14 | 0.14.6 | 0.14.6 | ✅ Güncel |
| prometheus | 0.14 | 0.14.0 | 0.14.0 | ✅ Güncel |
| cookie | 0.18 | 0.18.1 | 0.18.1 | ✅ Güncel |
| dotenvy | 0.15 | 0.15.7 | 0.15.7 | ✅ Güncel |
| thiserror | 2 | 2.0.18 | 2.0.18 | ✅ Güncel |
| rand | 0.10 | 0.10.x | 0.10.x | ✅ Güncel |
| regex | 1 | 1.12.3 | 1.12.3 | ✅ Güncel |
| base64 | 0.22 | 0.22.1 | 0.22.1 | ✅ Güncel |
| aes-gcm | 0.10 | 0.10.x | 0.10.x | ✅ Güncel |
| totp-rs | 5 | 5.7.1 | 5.7.1 | ✅ Güncel |
| base32 | 0.5 | 0.5.x | 0.5.x | ✅ Güncel |
| urlencoding | 2 | 2.x | 2.x | ✅ Güncel |
| async-stream | 0.3 | 0.3.x | 0.3.x | ✅ Güncel |
| futures | 0.3 | 0.3.x | 0.3.x | ✅ Güncel |
| once_cell | 1 | 1.x | 1.x | ✅ Güncel |
| proptest | 1 | 1.x | 1.x | ✅ Güncel (dev) |
| criterion | 0.5 | 0.5.x | 0.5.x | ✅ Güncel (dev) |

### Worker Cargo.toml

| Crate | Cargo.toml | En Son | Durum |
|-------|-----------|--------|-------|
| reqwest | 0.13 | 0.13.3 | ✅ Güncel |
| axum | 0.8 | 0.8.9 | ✅ Güncel |
| sqlx | 0.8 | 0.8.6 | ✅ Güncel |
| dotenvy | 0.15 | 0.15.7 | ✅ Güncel |
| hmac | 0.13 | 0.13.0 | ✅ Güncel |
| sha2 | 0.11 | 0.11.0 | ✅ Güncel |
| hex | 0.4 | 0.4.x | ✅ Güncel |
| base64 | 0.22 | 0.22.1 | ✅ Güncel |
| jsonwebtoken | 10 | 10.4.0 | 🟡 Minor |
| rustls | 0.23 | 0.23.40 | ✅ Güncel |

### Common Cargo.toml

| Crate | Cargo.toml | En Son | Durum |
|-------|-----------|--------|-------|
| hmac | 0.13 | 0.13.0 | ✅ Güncel |
| sha2 | 0.11 | 0.11.0 | ✅ Güncel |
| base64 | 0.22 | 0.22.1 | ✅ Güncel |
| hex | 0.4 | 0.4.x | ✅ Güncel |
| chrono | 0.4 | 0.4.44 | ✅ Güncel |
| reqwest | 0.13 | 0.13.3 | ✅ Güncel |
| thiserror | 2 | 2.0.18 | ✅ Güncel |
| tokio | 1 | 1.52.3 | ✅ Güncel |
| serde | 1 | 1.0.228 | ✅ Güncel |
| serde_json | 1 | 1.0.149 | ✅ Güncel |

---

## ⚛️ Dashboard (Next.js + React)

| Paket | package.json | package-lock.json | En Son Kararlı | Durum |
|-------|-------------|-------------------|----------------|-------|
| next | ^15.5.15 | 15.5.18 | **16.2.6** | 🔴 Major |
| react | ^19.0.0 | 19.2.6 | 19.2.6 | ✅ Güncel |
| react-dom | ^19.0.0 | 19.2.6 | 19.2.6 | ✅ Güncel |
| typescript | ^5 | 5.9.3 | **6.0.3** | 🔴 Major |
| tailwindcss | ^3.4.0 | 3.4.19 | **4.3.0** | 🔴 Major |
| @tanstack/react-query | ^5.100.10 | 5.100.10 | 5.100.10 | ✅ Güncel |
| recharts | ^2.15.0 | 2.15.4 | **3.8.1** | 🔴 Major |
| zod | ^4.4.3 | 4.4.3 | 4.4.3 | ✅ Güncel |
| next-intl | ^4.0.0 | 4.11.1 | 4.12.0 | 🟡 Minor |
| eslint | ^9.0.0 | 9.39.4 | **10.4.0** | 🔴 Major |
| vitest | ^4.1.5 | 4.1.5 | 4.1.6 | 🟡 Patch |
| @playwright/test | ^1.52.0 | 1.60.0 | 1.60.0 | ✅ Güncel |
| postcss | ^8.5.10 | 8.5.14 | 8.5.14 | ✅ Güncel |
| @upstash/redis | ^1.38.0 | 1.38.0 | 1.38.0 | ✅ Güncel |
| dompurify | ^3.1.6 | 3.4.2 | 3.4.3 | 🟡 Patch |
| @vercel/analytics | ^2.0.1 | 2.0.1 | 2.0.1 | ✅ Güncel |
| @vercel/speed-insights | ^2.0.0 | 2.0.0 | 2.0.0 | ✅ Güncel |
| clsx | ^2.1.1 | 2.1.1 | 2.1.1 | ✅ Güncel |
| eslint-config-next | ^15.0.0 | 15.x | 16.x | 🔴 Major (Next.js ile) |

---

## 🐳 Altyapı (Docker / Deploy)

| Bileşen | Mevcut | En Son Kararlı | Durum |
|---------|--------|----------------|-------|
| Rust Docker image | rust:1.95-bookworm | rust:1.95-bookworm | ✅ Güncel |
| Debian runtime | debian:bookworm-slim | bookworm-slim | ✅ Güncel |
| Node.js Docker (dashboard) | node:20-alpine | **node:22-alpine** | 🟡 LTS güncelleme |
| PostgreSQL (local docker) | postgres:16-alpine | **postgres:17-alpine** | 🟡 Major |
| Cloud Build node image | node:20-slim | node:22-slim | 🟡 LTS güncelleme |

---

## 📦 SDK'lar

| SDK | Versiyon | Not |
|-----|----------|-----|
| Python | 0.3.0 | pydantic ≥2.11, Python ≥3.9 |
| Node.js | 0.4.0 | TypeScript SDK |
| Go | go 1.22 | gopkg.in/validator.v2 |
| Ruby | OpenAPI Generated | openapi-generator 7.22.0 |

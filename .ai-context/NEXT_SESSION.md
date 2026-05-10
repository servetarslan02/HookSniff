# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 22:54 GMT+8

---

## ✅ Tamamlanan Oturumlar

### Oturum 73-90 ✅
- Tüm P0 + P1 tamamlandı

### Oturum 91-93 ✅
- HS-019, HS-020, HS-021, HS-022, HS-023, HS-047, HS-067, HS-068, HS-077, HS-079, HS-080
- 15 commit, 1030/1030 test, ESLint v9, 6 branch silindi

---

## 🟡 Sıradaki Oturum: #94

### 1. Dependabot PR'ları (HS-078)
Önce Cargo (Rust) — daha az riskli:
```
dependabot/cargo/thiserror-2.0.18      ← major bump, dikkatli ol
dependabot/cargo/tower-http-0.6.10     ← major bump
dependabot/cargo/sha2-0.11.0           ← minor bump
dependabot/cargo/hmac-0.13.0           ← minor bump
dependabot/cargo/jsonwebtoken-10.3.0   ← major bump
dependabot/cargo/opentelemetry-0.31.0  ← major bump
dependabot/cargo/opentelemetry-otlp-0.31.1
dependabot/cargo/tracing-opentelemetry-0.32.1
```
Sonra npm (dashboard):
```
dependabot/npm_and_yarn/dashboard/eslint-10.3.0           ← ESLint 10, Next.js 15 uyumsuz!
dependabot/npm_and_yarn/dashboard/eslint-config-next-16.2.6 ← Next.js 16, şimdilik dokunma
dependabot/npm_and_yarn/dashboard/next-16.2.6              ← Next.js 16, şimdilik dokunma
dependabot/npm_and_yarn/dashboard/next/eslint-plugin-next-16.2.6
dependabot/npm_and_yarn/dashboard/react-19.2.6
dependabot/npm_and_yarn/dashboard/typescript-6.0.3
dependabot/npm_and_yarn/dashboard/tailwindcss-4.2.4
```

**⚠️ DİKKAT:**
- ESLint 10, Next.js 16, React 19 major bump — şimdilik dokunma
- Cargo minor bump'ları (sha2, hmac) güvenli, önce onları dene
- Her merge sonrası `cargo test` çalıştır

### 2. Kalan P2 Sorunları
| ID | Sorun | Zorluk |
|----|-------|--------|
| HS-065 | 920+ hardcoded string | 🔴 Büyük iş |
| HS-066 | 71 sayfada metadata eksik | 🟡 Orta |
| HS-081 | 11 SDK'da retry logic yok | 🟡 Orta |
| HS-082 | Kotlin version mismatch | 🟢 Kolay |
| HS-083 | OpenAPI schema mismatch | 🟡 Orta |
| HS-084 | Polar/iyzico fatura handler | 🟡 Orta |
| HS-085-089 | Test coverage (5 modül) | 🔴 Büyük iş |

### 3. Silinmeyen Branch'ler
- `feat/mobile-backend-features` — password reset, email verify, 2FA, push notifications var
- `ai-agent-layer` — PostgreSQL AI agents migration var
- Bu branch'lerdeki iş main'e merge edilmeli veya Servet'e sorulmalı

### 4. Çalışma Kuralları (hatırlatma)
- Conventional commits: `fix:`, `feat:`, `docs:`, `refactor:`, `test:`, `chore:`
- Her değişiklik sonrası `cargo test` + `cargo check` + `npm run lint`
- npm install çalıştırılmamışsa çalıştır
- Erteleme — yapılabilen hemen yapılsın

---

## 📊 İlerleme

| Kategori | Toplam | Tamamlanan | Kalan |
|----------|--------|-----------|-------|
| 🚨 P0 | 14 | 13 | 1 |
| 🔴 P1 | 44 | 46 | 0 |
| 🟡 P2 | 38 | 21 | 17 |
| 🟢 P3 | 13 | 1 | 12 |
| **TOPLAM** | **103** | **81** | **22** |

---

## 🔧 Zorunlu Kurallar (Her Oturum)

### Kurulum Kontrolü
```bash
source "$HOME/.cargo/env" && rustc --version && cargo --version
node --version && npm --version
```
Eğer Rust yoksa kur: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y`

### Her Değişiklik Sonrası Zorunlu
1. `cargo check` (compile)
2. `cargo test` (testler)
3. `npm run lint` (frontend)
4. `npx tsc --noEmit` (TypeScript)
5. `git push` (GitHub)

### Erteleme YASAK
- "Daha sonra yaparız" → ❌ Hemen yap
- "Riskli dokunmayalım" → ❌ Araştır, test et, yap
- "Büyük iş" → ❌ Parçala, başla

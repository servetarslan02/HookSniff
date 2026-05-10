# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 23:54 GMT+8

---

## ✅ Tamamlanan Oturumlar

### Oturum 73-93 ✅
- Tüm P0 + P1 tamamlandı

### Oturum 94 ✅ (2026-05-10 22:58 - 23:54)
**Major dependency güncellemeleri:**
- sha2 0.10→0.11, hmac 0.12→0.13
- thiserror 1→2, jsonwebtoken 9→10 (+ rust_crypto feature)
- axum 0.7→0.8, tower 0.4→0.5, tower-http 0.5→0.6
- opentelemetry 0.24→0.32, opentelemetry-otlp 0.17→0.32
- tonic 0.12→0.14, reqwest 0.12→0.13
- tracing-opentelemetry 0.25→0.32 (patched vendor — upstream 0.33 bekleniyor)
**Dashboard:**
- 63+85 TypeScript hataları düzeltildi (unused imports, type casts)
- ESLint: 0 hata
**Testler:** 999/999 (979 API + 20 worker)
**Commits:** `7d89aa1`, `c7d6236`, `815705d` — main branch

---

## 🟡 Sıradaki Oturum: #95

### 1. Kalan Major Dependency Güncellemeleri
| Paket | Mevcut | Güncel | Zorluk |
|---|---|---|---|
| sqlx | 0.7 | 0.8 | 🔴 Büyük — macro syntax, runtime değişiklikleri |
| redis | 0.25 | 1.2 | 🔴 Büyük — API tamamen değişmiş |
| rand | 0.8 | 0.10 | 🟡 Orta — `gen_range` API değişikliği |
| prometheus | 0.13 | 0.14 | 🟡 Orta — metric API değişikliği |

**⚠️ sqlx ve redis büyük migration — dikkatli ol, parça parça yap:**
- sqlx 0.8: `sqlx::query!` macro'ları, `PgPool` API, `runtime-tokio` feature adı değişmiş olabilir
- redis 1.x: `redis::Connection` → `redis::aio::Connection`, async API değişiklikleri
- İkisini aynı anda yapma, birini bitir test et sonra diğerine geç

### 2. Dependabot PR'ları (kalan)
npm tarafı hâlâ bekliyor:
```
dependabot/npm_and_yarn/dashboard/react-19.2.6        ← major, dikkatli ol
dependabot/npm_and_yarn/dashboard/typescript-6.0.3     ← major
dependabot/npm_and_yarn/dashboard/tailwindcss-4.2.4    ← major
dependabot/npm_and_yarn/dashboard/recharts-3.8.1       ← minor, güvenli
dependabot/npm_and_yarn/dashboard/types/node-25.6.2    ← minor, güvenli
```
**Dikkat:** Next.js 16, ESLint 10, React 19 major bump — şimdilik dokunma!

### 3. Kalan P2 Sorunları
| ID | Sorun | Zorluk |
|----|-------|--------|
| HS-065 | 920+ hardcoded string (i18n) | 🔴 Büyük iş |
| HS-066 | 71 sayfada metadata eksik | 🟡 Orta |
| HS-081 | 11 SDK'da retry logic yok | 🟡 Orta |
| HS-082 | Kotlin version mismatch | 🟢 Kolay |
| HS-083 | OpenAPI schema mismatch | 🟡 Orta |
| HS-084 | Polar/iyzico fatura handler | 🟡 Orta |
| HS-085-089 | Test coverage (5 modül) | 🔴 Büyük iş |

### 4. Silinmeyen Branch'ler
- `feat/mobile-backend-features` — password reset, email verify, 2FA, push notifications
- `ai-agent-layer` — PostgreSQL AI agents migration
- Bu branch'lerdeki iş main'e merge edilmeli veya Servet'e sorulmalı

### 5. tracing-opentelemetry Vendor Kaldırma
- Upstream `tracing-opentelemetry 0.33` çıktığında vendor patch'ini kaldır
- `vendor/tracing-opentelemetry/` klasörünü sil
- `[patch.crates-io]` section'ını workspace Cargo.toml'dan kaldır
- `tracing-opentelemetry = "0.33"` yap

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
2. `cargo test -p hooksniff-api --lib && cargo test -p hooksniff-worker` (testler)
3. `cd dashboard && npm run lint && npx tsc --noEmit` (frontend)
4. `git push` (GitHub)

### Erteleme YASAK
- "Daha sonra yaparız" → ❌ Hemen yap
- "Riskli dokunmayalım" → ❌ Araştır, test et, yap
- "Büyük iş" → ❌ Parçala, başla

### İş Kalite Kuralları (ZORUNLU)
- ❌ **Yarım iş yasak** — başladığın işi bitir, compile et, test et, push et
- ❌ **Hızlıya kaçmak yasak** — "çabuk bitireyim" diye adım atlanmaz
- ❌ **Üstün körü iş yasak** — "galiba doğru" yetmez, compile + test zorunlu
- ❌ **Erteleme yasak** — "daha sonra", "büyük iş", "riskli" kabul edilmez
- ✅ **Detaylı değerlendirme** — her iş titizlikle kontrol edilecek
- ✅ **Parça parça ilerle** — büyük işleri böl, her parçayı doğrula
- ✅ **Sor** — emin değilsen Servet'e sor, tahmin yürütme

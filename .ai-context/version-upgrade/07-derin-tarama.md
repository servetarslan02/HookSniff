# 🔍 Ek Bulgular — Derin Tarama

> Son tarama: 2026-05-16
> Bu dosya: İlk taramalarda atlanan TÜM bileşenler

---

## 1. Rust SDK — KRİTİK ESKİ VERSİYONLAR 🔴

`sdks/rust/Cargo.toml` — Ana projeyle ciddi uyumsuzluk var!

| Crate | Rust SDK | Ana Proje | En Son | Durum |
|-------|----------|-----------|--------|-------|
| reqwest | **0.12** | 0.13 | 0.13.3 | 🔴 Major uyumsuz |
| hmac | **0.12** | 0.13 | 0.13.0 | 🔴 Major uyumsuz |
| sha2 | **0.10** | 0.11 | 0.11.0 | 🔴 Major uyumsuz |
| serde | 1 | 1 | 1.0.228 | ✅ |
| serde_json | 1 | 1 | 1.0.149 | ✅ |
| base64 | 0.22 | 0.22 | 0.22.1 | ✅ |
| uuid | 1 | 1 | 1.23.1 | ✅ |
| chrono | 0.4 | 0.4 | 0.4.44 | ✅ |
| url | 2 | 2 | 2.x | ✅ |

**Risk:** 🔴 SDK kullanıcıları eski reqwest/hmac/sha2 sürümlerini kullanıyor. Ana projeyle API uyumsuzluğu olabilir.

---

## 2. Cloudflare Workers Edge Proxy 🔴

`workers/edge-proxy/package.json`

| Paket | Mevcut | En Son | Durum |
|-------|--------|--------|-------|
| wrangler | **3.114.17** | **4.92.0** | 🔴 Major |
| vitest | **3.2.4** | **4.1.6** | 🔴 Major |
| typescript | 5.9.3 | 6.0.3 | 🔴 Major |
| @cloudflare/workers-types | 4.20260515.1 | 4.x | ✅ Güncel |

**Not:** Edge proxy henüz deploy edilmemiş (MEMORY.md: "Cloudflare Workers deploy ertelendi"). Ama kod güncel tutulmalı.

---

## 3. SDK Docs (Docusaurus) 🟡

`docs-sdk/package.json`

| Paket | Mevcut | En Son | Durum |
|-------|--------|--------|-------|
| @docusaurus/core | **^3.7.0** | **3.10.1** | 🟡 Minor |
| @docusaurus/preset-classic | **^3.7.0** | **3.10.1** | 🟡 Minor |
| react | **^18.2.0** | **19.2.6** | 🔴 Major |
| react-dom | **^18.2.0** | **19.2.6** | 🔴 Major |
| @mdx-js/react | ^3.0.0 | 3.x | ✅ |
| prism-react-renderer | ^2.3.0 | 2.x | ✅ |

**Not:** Dashboard React 19 kullanıyor, docs-sdk hala React 18'de.

---

## 4. CLI Tool 🟡

`cli/package.json`

| Paket | Mevcut | En Son | Durum |
|-------|--------|--------|-------|
| commander | **^12.0.0** | **14.0.3** | 🔴 Major |

---

## 5. Monitoring Stack 🟡

`monitoring/docker-compose.monitoring.yml`

| Servis | Mevcut | En Son | Durum |
|--------|--------|--------|-------|
| prom/prometheus | **v3.4.1** | **v3.11.3** | 🟡 Minor |
| grafana/grafana | **12.0.2** | **13.0.1** | 🔴 Major |

---

## 6. GitHub Actions — Ek Action'lar 🟡

| Action | Mevcut | En Son | Durum |
|--------|--------|--------|-------|
| aquasecurity/trivy-action | **@master** | **v0.36.0** | 🔴 Pin gerekli |
| github/codeql-action | **v3** | v3 | ✅ |

**⚠️ Güvenlik riski:** `trivy-action@master` kullanmak yerine spesifik versiyon pin'lenmeli. `@master` herhangi bir commit'e referans eder, supply chain riski.

---

## 7. Dependabot — DEVRE DIŞI ⚠️

`.github/dependabot.yml`

```yaml
open-pull-requests-limit: 0  # DEVRE DIŞI
```

**Sebep:** Vercel Hobby plan günlük 100 deploy limiti aşılmış.
**Risk:** Güvenlik güncellemeleri otomatik gelmiyor.
**Öneri:** Sadece `security` label'lı PR'lar için limiti 3 yap.

---

## 8. OpenAPI Spec 🟢

`docs/openapi.yaml`

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| OpenAPI spec version | **3.0.3** | **3.1.0** | 🟡 Minor |
| API version | 1.0.0 | — | Proje version'ı |

---

## 9. Helm Chart 🟡

`deploy/helm/hooksniff/Chart.yaml`

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| apiVersion | v2 | v2 | ✅ |
| appVersion | **1.0.0** | **0.4.0** (proje) | 🟡 Uyumsuz |
| chart version | 0.1.0 | — | Proje version'ı |

**Not:** `appVersion` proje version'ı (0.4.0) ile uyumlu olmalı.

---

## 10. Ruby SDK — Eski Dev Dependencies 🔴

`sdks/ruby/Gemfile`

| Gem | Mevcut | En Son | Durum |
|-----|--------|--------|-------|
| rubocop | **~> 0.66.0** | **1.75+** | 🔴 Major (çok eski) |
| rake | ~> 13.0.1 | 13.x | ✅ |
| pry-byebug | (any) | latest | ✅ |

---

## 11. Python SDK Minimum Version 🟡

`sdks/python/pyproject.toml`

| Bileşen | Mevcut | Not |
|---------|--------|-----|
| requires-python | **>=3.9** | Python 3.9 **Ekim 2025'te EOL** oldu |

**Öneri:** Minimum `>=3.11` olarak güncelle.

---

## 12. Test Contract Dependencies 🟡

`tests/contract/requirements.txt`

| Paket | Mevcut | En Son | Durum |
|-------|--------|--------|-------|
| schemathesis | **>=3.28** | 3.28+ | ✅ |
| pytest | **>=8.0** | 8.x | ✅ |

---

## 13. Root package.json 🟢

`package.json` (repo root)

| Paket | Mevcut | En Son | Durum |
|-------|--------|--------|-------|
| pg | ^8.20.0 | 8.20.0 | ✅ Güncel |

**Not:** Sadece migration script'leri için kullanılıyor.

---

## 14. Dashboard Dev Dependencies — Kaçırılanlar 🟡

| Paket | Mevcut | En Son | Durum |
|-------|--------|--------|-------|
| @axe-core/react | ^4.9.0 | **4.11.3** | 🟡 Minor |
| @tailwindcss/forms | ^0.5.0 | **0.5.11** | 🟡 Patch |
| jest-axe | ^8.0.0 | **10.0.0** | 🔴 Major |
| jsdom | ^29.1.1 | 29.1.1 | ✅ Güncel |
| @testing-library/jest-dom | ^6.9.1 | 6.x | ✅ |
| @testing-library/react | ^16.3.2 | 16.x | ✅ |
| @vitest/coverage-v8 | ^4.1.5 | 4.1.6 | 🟡 Patch |
| @types/node | ^20 | **^22** | 🟡 (Node 22 LTS) |
| @eslint/eslintrc | ^3.0.0 | 3.x | ✅ |
| @next/eslint-plugin-next | ^15.0.0 | **16.x** | 🔴 Major (Next.js 16 ile) |

---

## 15. Vendor Patch Durumu 🟡

`vendor/tracing-opentelemetry/` — Upstream'den fork edilmiş.

| Bileşen | Vendor | Upstream | Durum |
|---------|--------|----------|-------|
| tracing-opentelemetry | 0.32.1 | 0.32.x | 🟡 Patch kontrol gerekli |

**Not:** Vendor patch'in neden yapıldığını kontrol et. Upstream'de düzeltilmiş olabilir.

---

## 16. Cargo.toml Workspace Edition 🟢

| Bileşen | Mevcut | En Son | Durum |
|---------|--------|--------|-------|
| Rust edition | 2021 | 2024 | 🟡 (2024 edition çıktı ama migration gerekli) |

**Not:** Edition 2024, Rust 1.85+ ile stabilize edildi. Henüz acil değil ama gelecekte düşünülmeli.

---

## 📊 TAM ÖZET — Tüm Bileşenler

### Güncelleme Gerekenler (Öncelik Sırasına Göre)

| # | Bileşen | Mevcut → En Son | Risk | Öncelik |
|---|---------|----------------|------|---------|
| 1 | Rust SDK (reqwest/hmac/sha2) | 0.12/0.12/0.10 → 0.13/0.13/0.11 | 🔴 | P1 |
| 2 | GitHub Actions (10 action) | v4-v5 → v6-v7 | 🟡 | P1 |
| 3 | trivy-action | @master → v0.36.0 | 🔴 | P1 |
| 4 | jest-axe | 8 → 10 | 🔴 | P2 |
| 5 | @next/eslint-plugin-next | 15 → 16 | 🔴 | P2 |
| 6 | Wrangler (edge proxy) | 3.x → 4.x | 🔴 | P2 |
| 7 | docs-sdk React | 18 → 19 | 🔴 | P2 |
| 8 | CLI commander | 12 → 14 | 🔴 | P2 |
| 9 | Ruby rubocop | 0.66 → 1.75+ | 🔴 | P2 |
| 10 | Grafana | 12.0.2 → 13.0.1 | 🔴 | P3 |
| 11 | Docusaurus | 3.7 → 3.10 | 🟡 | P3 |
| 12 | Prometheus | v3.4.1 → v3.11.3 | 🟡 | P3 |
| 13 | Python SDK minimum | 3.9 → 3.11 | 🟡 | P3 |
| 14 | Helm appVersion | 1.0.0 → 0.4.0 | 🟡 | P3 |
| 15 | @axe-core/react | 4.9 → 4.11 | 🟡 | P3 |
| 16 | @tailwindcss/forms | 0.5.0 → 0.5.11 | 🟡 | P3 |
| 17 | @types/node | 20 → 22 | 🟡 | P3 |
| 18 | OpenAPI spec | 3.0.3 → 3.1.0 | 🟡 | P4 |
| 19 | Dependabot | devre dışı → security-only | ⚠️ | P2 |
| 20 | Vendor patch kontrol | 0.32.1 → upstream? | 🟡 | P4 |

### Güncel Olanlar (Değişiklik Gerekmiyor)

- pg 8.20.0 ✅
- jsdom 29.1.1 ✅
- @testing-library/* ✅
- OpenAPI Generator 7.22.0 ✅
- @cloudflare/workers-types ✅
- Helm apiVersion v2 ✅
- Terraform >= 1.0 ✅

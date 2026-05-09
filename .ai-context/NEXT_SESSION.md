# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 05:52 GMT+8

---

## 🔴 ACİL — Servet'in Yapması Gereken

| Görev | Öncelik | Not |
|-------|---------|-----|
| GitHub PAT rotate | 🔴 ACİL | Eski token chat'te paylaşıldı |
| npm token rotate | 🔴 ACİL | Eski token paylaşıldı |
| GCP SA key rotate | 🔴 ACİL | Eski key paylaşıldı |
| Vercel token rotate | 🔴 ACİL | Eski token paylaşıldı |
| Login test | 🔴 | Deploy sonrası dashboard'da dene |
| iyzico hesap | ❌ | Vergi levhası + banka hesabı |

---

## ✅ SON OTURUMLAR (65a-65f) — TAM ÖZET

### Bugünkü Çalışma (2026-05-10 05:06 - 05:52 GMT+8)

**6 oturum, 37 yeni dosya, 13 modifikasyon, +7447 satır kod**

#### 1. Onboarding Sistemi (Oturum 65a)
- `/get-started` sayfası (6 adım, 5 SDK kod örneği)
- `OnboardingWizard` (6 interaktif adım, confetti)
- `SetupChecklist` (dashboard widget, progress bar)
- Event type catalog, embed portal, CLI quickstart
- Nav linkleri (landing, sidebar, footer, mobile)

#### 2. Rakip Özellikler (Oturum 65b)
- Signature Verifier (`/dashboard/signature-verifier`)
- API Spec Importer (`/dashboard/api-importer`)
- Rate Limiting Dashboard (`/dashboard/rate-limiting`)
- Portal Customization (`/dashboard/portal-customize`)
- 1-click test webhook (endpoint detail)

#### 3. 14 Eksik Özellik (Oturum 65c)
- Email Verification UI + Banner
- OAuth buttons (Google + GitHub) — coming soon
- Audit Log (`/dashboard/audit-log`)
- SSO/SAML (`/dashboard/sso`)
- Custom Domain (`/dashboard/custom-domain`)
- Webhook Builder (`/dashboard/webhook-builder`)
- Bulk Operations (endpoints)

#### 4. Altyapı (Oturum 65d)
- `docker-compose.staging.yml`
- `scripts/backup-hooksniff.sh`
- `scripts/deploy-staging.sh`
- `tests/load/run-tests.sh`
- Global Retry Policy (`/dashboard/retry-policy`)

#### 5. Terraform + MCP (Oturum 65e)
- Terraform Provider (`terraform/`)
- MCP Server (`mcp/`)

#### 6. Kod Denetimi (Oturum 65f)
- Build warnings düzeltildi (img→Image, useCallback)
- Graceful fallbacks (localStorage) for missing endpoints
- OAuth "coming soon" note
- Suspense wrapper for verify-email

### Dashboard Sayfaları (27+)
```
🚀 Get Started | 📊 Dashboard | 🔗 Endpoints | 📦 Deliveries
📋 Logs | 🔍 Search | 💓 Health | 🔔 Alerts | 🔑 API Keys
🧪 Playground | 📈 Analytics | 🔄 Transforms | 📨 Inbound
⚡ Rate Limiting | 🔐 Signature Tool | 📥 API Importer
🖼️ Portal Customize | 🔧 Webhook Builder | 📋 Audit Log
🔐 SSO/SAML | 🌐 Custom Domain | 🔄 Retry Policy
👥 Team | 🔔 Notifications | 💳 Billing | ⚙️ Settings
```

### Scripts
```
scripts/backup-hooksniff.sh    — PostgreSQL + Redis + R2 backup
scripts/deploy-staging.sh      — GCP Cloud Run staging deploy
tests/load/run-tests.sh        — k6 load test runner
```

### Build Durumu
- ✅ 0 error
- ✅ 0 warning (app code)
- ✅ 802 static pages
- ✅ 11 SDK published

---

## 🟡 YENİ OTURUMDA YAPILACAK

| # | Görev | Öncelik | Not |
|---|-------|---------|-----|
| 1 | Backend: OAuth endpoint'leri | 🔴 | /auth/oauth/google, /auth/oauth/github |
| 2 | Backend: /portal/config endpoint | 🟡 | Portal customization için |
| 3 | Backend: /settings/retry-policy | 🟡 | Global retry policy için |
| 4 | Backend: /audit-log endpoint | 🟡 | Audit log için |
| 5 | Backend: /sso/config endpoint | 🟡 | SSO için |
| 6 | Backend: /custom-domains endpoint | 🟡 | Custom domain için |
| 7 | Backend: /rate-limits endpoint | 🟡 | Rate limiting için |
| 8 | Test dosyaları temizliği | 🟢 | Unused import'lar |
| 9 | k6 load test çalıştırma | 🟢 | scripts/run-tests.sh ile |
| 10 | Staging deploy | 🟢 | scripts/deploy-staging.sh ile |

---

## ⚠️ Önemli Notlar

- **Oturumlar 1 saat** — planlı çalış, GitHub push sık yap
- **Hafıza GitHub'da kalıcı** — `.ai-context/`
- **Backend endpoint'ler eksik** — dashboard localStorage fallback kullanıyor
- **OAuth butonları** — "coming soon" notu ile gösteriliyor
- **Test dosyaları** — unused import'lar var ama production'ı etkilemez

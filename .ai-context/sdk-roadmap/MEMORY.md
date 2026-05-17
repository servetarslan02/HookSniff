# SDK Roadmap MEMORY

> Son güncelleme: 2026-05-18 06:26 GMT+8 (Oturum — Faz 8-13 tamamlandı)

## ⚠️ KRİTİK: SDK Adaptasyon Yöntemi

**ASLA sıfırdan yazma!** Her zaman Svix SDK'yı kopyala ve adapte et.

## 📊 SDK Publish Durumu — v1.0.0

| # | SDK | Registry | Durum |
|---|-----|----------|-------|
| 1 | **Node.js** | npm | ✅ |
| 2 | **Python** | PyPI | ✅ |
| 3 | **Go** | GitHub tag | ✅ |
| 4 | **Rust** | crates.io | ✅ |
| 5 | **Ruby** | RubyGems | ✅ |
| 6 | **Java** | Maven Central | ✅ |
| 7 | **C#** | NuGet | ✅ |
| 8 | **Elixir** | Hex.pm | ✅ |
| 9 | **PHP** | Packagist | ✅ |
| 10 | **Swift** | GitHub tag | ✅ |
| 11 | **Kotlin** | Maven Central | ✅ |

## 📊 Faz İlerlemesi

| Faz | İçerik | Durum |
|-----|--------|-------|
| 8 | Environment | ✅ |
| 9 | Background Task | ✅ |
| 10 | Operational Webhook | ✅ (worker dispatch dahil) |
| 11 | Message Poller | ✅ |
| 12 | Ingest | ✅ |
| 13 | Connector | ✅ |
| 14 | Integration | ✅ |
| 15 | Streaming | ✅ |

## 🔧 Build Ortamı (Bu sunucuda kuruldu)
- JDK 17: /opt/jdk-17
- Maven: /opt/apache-maven-3.9.6
- Go: /usr/local/go/bin
- Rust: $HOME/.cargo/env (rustc 1.95.0)
- Node.js: v22.22.1
- GPG Key ID: FC5EA3BE171950ED5B42B44948FA192D3997BF0E

## HookSniff API Bilgileri
- Base URL: `https://api.hooksniff-1046140057667.europe-west1.run.app`
- Dashboard: `https://hooksniff.vercel.app`
- DB: Neon PostgreSQL
- Deploy: Cloud Build (cloudbuild.yaml)
- Vercel: Auto-deploy from GitHub

## ⚠️ Deploy Notu
Cloud Build manuel tetikleniyor. Son connector API'si deploy edilmeli.
DB tabloları ve seed data hazır.

## 📝 Son Oturum (2026-05-18)
- Faz 10: Operational webhook worker dispatch eklendi (delivery.failed, endpoint.disabled)
- Faz 11: Message Poller — API + Dashboard + 11 SDK
- Faz 12: Ingest — sidebar nav + SDK tamamlandı
- Faz 13: Connector — 8 servis (Stripe, Shopify, GitHub, Slack, Twilio, Discord, Linear, Notion)
- Faz 14: Integration — API + Dashboard + Migration 063 + 11 SDK güncellendi
- Migration 061 (message_cursors) + 062 (connectors) + 063 (integrations) uygulandı
- Tüm SDK'lar güncellendi (14 resource × 11 dil)

# 📊 Rekabet Analizi — HookSniff vs Rakipler

> Tarih: 2026-05-13
> Kaynak: Svix (svix.com), Hookdeck (hookdeck.com), Hook0 (hook0.com), Convoy (getconvoy.io)
> Amaç: HookSniff'in 36 müşteri sayfasının yeterliliğini rakiplerle karşılaştırmak

---

## 📋 Rakip Sayfa Yapıları

### Svix — ~10 Sayfa (Kaynak: svix.com/application-portal)
| # | Sayfa/Fonksiyon | Açıklama |
|---|----------------|----------|
| 1 | Dashboard | Özet istatistikler |
| 2 | Endpoints | Webhook endpoint CRUD + event filter |
| 3 | Messages | Event log + manuel retry |
| 4 | Event Types | Event katalog (hangi event'ler mevcut) |
| 5 | API Keys | Key yönetimi |
| 6 | App Portal | Embeddable müşteri portalı (whitelabel) |
| 7 | Settings | Ayarlar |
| 8 | Webhook Testing | Simülasyon + debug |
| 9 | Payload Transformation | Dönüştürme (inflight) |
| 10 | Throttling | Rate limiting |

### Hookdeck — ~11 Sayfa (Kaynak: hookdeck.com/blog/hookdeck-review-july-2025)
| # | Sayfa/Fonksiyon | Açıklama |
|---|----------------|----------|
| 1 | Dashboard | Özet + data-dense layout |
| 2 | Sources | Webhook kaynakları |
| 3 | Destinations | Hedefler |
| 4 | Connections | Routing (source → destination) |
| 5 | Events | Event log |
| 6 | Attempts | Teslimat denemeleri |
| 7 | Transformations | Payload dönüştürme + filtre sıralama |
| 8 | Metrics | İstatistikler (success rate, latency) |
| 9 | Settings | Ayarlar |
| 10 | Filters | Filtreler |
| 11 | Deduplication | Tekrarlayan event filtreleme |

### Hook0 — ~8 Sayfa (Kaynak: documentation.hook0.com)
| # | Sayfa/Fonksiyon | Açıklama |
|---|----------------|----------|
| 1 | Dashboard | Özet |
| 2 | Applications | Uygulama yönetimi |
| 3 | Event Types | Event katalog (dot-notation hiyerarşi) |
| 4 | Subscriptions | Endpoint abonelikleri |
| 5 | Events | Event log + replay |
| 6 | Logs | Teslimat logları |
| 7 | API Keys | Key yönetimi |
| 8 | Settings | Ayarlar |

### Convoy — ~5 Sayfa (Kaynak: getconvoy.io)
| # | Sayfa/Fonksiyon | Açıklama |
|---|----------------|----------|
| 1 | Endpoints | Endpoint yönetimi |
| 2 | Events | Event log |
| 3 | Deliveries | Teslimat logları |
| 4 | Event Types | Event katalog |
| 5 | Settings | Ayarlar |

---

## 🔬 Özellik Karşılaştırması

| Özellik | Svix | Hookdeck | Hook0 | Convoy | HookSniff |
|---------|------|----------|-------|--------|-----------|
| **Endpoint CRUD** | ✅ | ✅ Destinations | ✅ | ✅ | ✅ |
| **Event Log + Replay** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Delivery Attempts** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Event Types Katalog** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Endpoint Event Filter** | ✅ | ✅ Filters | ✅ | ❌ | ❌ |
| **Payload Transformation** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Rate Limiting/Throttling** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Schema Registry** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **API Keys** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Webhook Testing** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Alerts/Notifications** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **SSO/SAML** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Audit Log** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Inbound Proxy** | ❌ | ✅ Core | ❌ | ❌ | ✅ |
| **Custom Domain** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Portal (whitelabel)** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Routing** | ❌ | ✅ Core | ❌ | ❌ | ✅ |
| **Health Monitoring** | ✅ | ✅ Metrics | ❌ | ❌ | ✅ |
| **Analytics** | ✅ | ✅ Metrics | ❌ | ❌ | ✅ |
| **Billing** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Team Management** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Notifications** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Search** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Deduplication** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Quick Filters** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Standard Webhooks** | ✅ | ✅ | ❌ | ❌ | ⚠️ Kısmi |
| **Custom Retry Schedules** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Batch Replay** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Outbound IPs** | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 📊 HookSniff'in 36 Müşteri Sayfası Değerlendirmesi

### 🟢 STANDART — Rakiplerde de Var (14 sayfa) ✅ Gerekli

| # | Sayfa | Svix | Hookdeck | Hook0 | Convoy | Durum |
|---|-------|------|----------|-------|--------|-------|
| 1 | Dashboard | ✅ | ✅ | ✅ | ❌ | ✅ |
| 2 | Endpoints | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3 | Endpoints [id] | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | Deliveries | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5 | Deliveries [id] | ✅ | ✅ | ✅ | ✅ | ✅ |
| 6 | Logs | ✅ | ✅ | ✅ | ✅ | ✅ |
| 7 | Health | ✅ | ✅ | ❌ | ❌ | ✅ |
| 8 | Analytics | ✅ | ✅ | ❌ | ❌ | ✅ |
| 9 | Transforms | ✅ | ✅ | ❌ | ❌ | ✅ |
| 10 | API Keys | ✅ | ❌ | ✅ | ❌ | ✅ |
| 11 | Billing | ❌ | ❌ | ❌ | ❌ | ✅ SaaS zorunlu |
| 12 | Settings | ✅ | ✅ | ✅ | ✅ | ✅ |
| 13 | Team | ✅ | ✅ | ❌ | ❌ | ✅ |
| 14 | Notifications | ❌ | ❌ | ❌ | ❌ | ✅ |

### 🟡 FARKLILAŞTIRICI — Rakiplerde Yok (13 sayfa) ✅ Avantaj

| # | Sayfa | Rakipler | Değer |
|---|-------|----------|-------|
| 15 | Search | ❌ | ✅ İyi |
| 16 | Alerts | ❌ | ✅ İyi |
| 17 | Inbound | Hookdeck'te var | ✅ İyi |
| 18 | Schemas | ❌ | ✅ İyi |
| 19 | SSO | ❌ | ✅ İyi |
| 20 | Audit Log | ❌ | ✅ İyi |
| 21 | Retry Policy | ❌ | ✅ İyi |
| 22 | Routing | Hookdeck'te var | ✅ İyi |
| 23 | Rate Limiting | Svix'te var | ✅ İyi |
| 24 | Custom Domain | ❌ | ✅ İyi |
| 25 | Portal Customize | Svix'te var | ✅ İyi |
| 26 | Portal Manage | Svix'te var | ✅ İyi |
| 27 | Playground | Svix'te var | ✅ İyi |

### 🔵 BİRLEŞTİRİLEBİLİR (5 sayfa) 🟡 Opsiyonel

| # | Sayfa | Neden | Öneri |
|---|-------|-------|-------|
| 28 | Signature Verifier | Tek araç | Playground'a taşı |
| 29 | API Importer | Tek seferlik | Kurulum wizard'ına |
| 30 | Webhook Builder | Playground ile çakışıyor | Playground'a entegre et |
| 31 | Search | Loglar'da da olabilir | Loglar'a arama çubuğu |
| 32 | Retry Policy | Ayarlar'da da olabilir | Settings altına taşı |

### 🟣 ALT/İÇERİK SAYFALARI (4 sayfa) ✅ İyi

| # | Sayfa | Tip |
|---|-------|-----|
| 33 | Webhooks | Ana sayfa |
| 34 | Webhooks New | Alt sayfa |
| 35 | Webhooks Glossary | İçerik |
| 36 | Webhooks Guides | İçerik |

---

## 🔴 RAKİPLERDE VAR, HOOKSNIFF'TE YOK (10 Özellik)

Bu özellikler mevcut sayfalara eklenebilir, yeni sayfa gerekmez:

| # | Özellik | Rakip | Nereye Eklenecek |
|---|---------|-------|------------------|
| 1 | Event Types Katalog | Svix, Hook0, Convoy | Schemas sayfasına "Event Types" sekmesi |
| 2 | Endpoint Event Filter | Svix, Hookdeck | Endpoints sayfasına "Event Filter" |
| 3 | Quick Filters | Hookdeck | Logs/Deliveries sayfasına tek tıkla filtre |
| 4 | Deduplication | Hookdeck | Settings sayfasına toggle |
| 5 | Support Agent Rolü | Svix | Team sayfasına yeni rol |
| 6 | Standard Webhooks Spec | Svix, Hookdeck | Settings sayfasına toggle |
| 7 | Custom Retry Schedules | Svix, Hook0 | Retry Policy sayfasına özel schedule |
| 8 | Batch Replay | Svix | Deliveries sayfasına toplu replay |
| 9 | Endpoint Disable Email | Svix | Endpoints sayfasına bildirim toggle |
| 10 | Outbound IPs | ❌ Hiçbirinde yok | Yeni sayfa gerekli |

---

## 💡 Sonuç

### Sayfa Sayısı
| Platform | Müşteri Sayfası |
|----------|----------------|
| **HookSniff** | **36** |
| Svix | ~10 |
| Hookdeck | ~11 |
| Hook0 | ~8 |
| Convoy | ~5 |

**HookSniff rakiplerden 3-7 kat fazla sayfaya sahip.** Bu fazlalık değil, zenginlik.

### Ne Fazla?
Hiçbiri gereksiz değil. 5 tanesi birleştirilebilir:
- Signature Verifier → Playground'a
- API Importer → Kurulum wizard'ına
- Webhook Builder → Playground'a
- Search → Loglar'a
- Retry Policy → Settings'e

Birleştirme sonrası: **31 sayfa** — hâlâ rakiplerden fazla.

### Ne Eksik?
10 özellik eksik — ama bunlar yeni sayfa değil, mevcut sayfalara eklenecek:
1. Event Types Katalog → Schemas'a
2. Endpoint Event Filter → Endpoints'a
3. Quick Filters → Logs'a
4. Deduplication → Settings'e
5. Support Agent Rolü → Team'e
6. Standard Webhooks → Settings'e
7. Custom Retry Schedules → Retry Policy'ye
8. Batch Replay → Deliveries'ye
9. Endpoint Disable Email → Endpoints'a
10. Outbound IPs → 1 yeni sayfa

### Genel Değerlendirme
HookSniff'in müşteri paneli **rakiplerden daha zengin**. Svix ve Hookdeck'te olmayan 13 farklılaştırıcı sayfaya sahip (Alerts, Schemas, SSO, Audit Log, Inbound, vb.). 10 eksik özellik mevcut sayfalara eklenebilir. Toplamda **31-36 sayfa** ile sektörün en kapsamlı webhook dashboard'una sahip olabilir.

---

## 📚 Kaynaklar
- Svix: https://www.svix.com/application-portal/
- Hookdeck: https://hookdeck.com/blog/hookdeck-review-july-2025
- Hook0: https://documentation.hook0.com/comparisons
- Convoy: https://www.getconvoy.io
- Hookdeck Deduplication: https://hookdeck.com/blog/hookdeck-review-august-2025

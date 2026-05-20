# HookSniff Kullanıcı Paneli — Tam Dökümantasyon

> Tarih: 2026-05-21
> Dashboard: Next.js 15, 41+ sayfa, i18n (EN/TR), dark mode desteği

---

## 📋 İçindekiler

1. [Dashboard Overview (Ana Sayfa)](#1-dashboard-overview)
2. [Endpoints (Uç Noktalar)](#2-endpoints)
3. [Deliveries (Teslimatlar)](#3-deliveries)
4. [Analytics (Analitik)](#4-analytics)
5. [Logs (Loglar)](#5-logs)
6. [Search (Arama)](#6-search)
7. [Applications (Uygulamalar)](#7-applications)
8. [API Keys (API Anahtarları)](#8-api-keys)
9. [Webhooks](#9-webhooks)
10. [Webhook Builder](#10-webhook-builder)
11. [Playground / Sandbox](#11-playground--sandbox)
12. [Signature Verifier](#12-signature-verifier)
13. [Routing (Yönlendirme)](#13-routing)
14. [Retry Policy (Yeniden Deneme Politikası)](#14-retry-policy)
15. [Rate Limiting (Hız Sınırı)](#15-rate-limiting)
16. [Schemas (Şemalar)](#16-schemas)
17. [Templates (Şablonlar)]#17-templates)
18. [Transforms (Dönüşümler)](#18-transforms)
19. [Inbound Webhooks](#19-inbound-webhooks)
20. [Alerts (Uyarılar)](#20-alerts)
21. [Notifications (Bildirimler)](#21-notifications)
22. [Team (Ekip Yönetimi)](#22-team)
23. [Organization (Organizasyon)](#23-organization)
24. [Billing (Faturalandırma)](#24-billing)
25. [Settings (Ayarlar)](#25-settings)
26. [Security Section](#26-security-section)
27. [SSO (Tek Oturum Açma)](#27-sso)
28. [Health Monitoring](#28-health-monitoring)
29. [Observability (Gözlemlenebilirlik)](#29-observability)
30. [Audit Log (Denetim Günlüğü)](#30-audit-log)
31. [Custom Domain (Özel Alan Adı)](#31-custom-domain)
32. [Portal (Müşteri Portalı)](#32-portal)
33. [Integrations (Entegrasyonlar)](#33-integrations)
34. [Connectors (Bağlayıcılar)](#34-connectors)
35. [Environments (Ortamlar)](#35-environments)
36. [Service Tokens](#36-service-tokens)
37. [Background Tasks](#37-background-tasks)
38. [Operational Webhooks](#38-operational-webhooks)
39. [Message Poller](#39-message-poller)
40. [Streaming](#40-streaming)
41. [API Importer](#41-api-importer)

---

## 1. Dashboard Overview

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/DashboardOverview.tsx`
**URL:** `/core` (ana sayfaya redirect)

### Özellikler:
- **Sürükle-bırak widget sistemi**: Kullanıcı dashboard widget'larını istediği sıraya dizip gizleyebilir
- **Stat Cards** (4 adet):
  - Toplam teslimat sayısı
  - Başarı oranı (%)
  - Aktif endpoint sayısı
  - Başarısız teslimat sayısı
- **Teslimat Trend Grafiği**: Area chart (24h, 7d, 30d, 90d zaman aralığı seçici)
- **Hızlı İstatistikler**: Delivered, Pending, Failed, Endpoint sayıları
- **Son Teslimatlar Tablosu**: ID, Event, Status, Attempts, Time
- **Hızlı Erişim Linkleri**: Endpoints, Deliveries, Playground, Analytics
- **React Query**: Otomatik veri yenileme + cache
- **Hata Banner'ı**: API hatalarında retry butonu
- **Dark Mode**: Tam destek

### Teknik Detaylar:
- Widget konfigürasyonu localStorage'da saklanır
- Drag & drop ile yeniden sıralama
- Her widget ayrı ayrı gizlenebilir/gösterilebilir

---

## 2. Endpoints

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/EndpointsContent.tsx`
**URL:** `/endpoints`

### Özellikler:
- **Endpoint Listesi**: Tüm endpoint'lerin tablo görünümü
- **Endpoint Oluşturma**: URL + açıklama ile yeni endpoint
- **Endpoint Silme**: Tekli + toplu silme (bulk delete)
- **Endpoint Açma/Kapatma**: Toggle ile aktif/pasif
- **Secret Rotation**: Endpoint secret'ını yenileme
- **Endpoint Detay Sayfası** (`/endpoints/[id]`):
  - Rate Limit Kartı
  - Retry Policy Kartı
  - Signature Kartı (HMAC bilgileri)
  - Test Webhook Kartı

### Teknik Detaylar:
- React Query ile veri yönetimi
- Toplu seçim (checkbox) + bulk actions
- Confirm dialog ile silme onayı

---

## 3. Deliveries

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/DeliveriesContent.tsx`
**URL:** `/deliveries`

### Özellikler:
- **URL-driven state**: Sayfa ve filtre URL'de saklanır (bookmarklenebilir)
- **Durum Filtresi**: All, Delivered, Failed, Pending
- **Arama**: Debounced (300ms) arama
- **Otomatik Yenileme**: Auto-refresh toggle
- **Replay**: Tekli webhook replay
- **Toplu Replay**: Feature flag ile kontrol edilen bulk replay
- **Canlı Stream**: SSE ile real-time delivery update
- **Teslimat Detay Sayfası** (`/deliveries/[id]`):
  - Attempt Timeline (zaman çizelgesi)
  - Delivery Info Panel
  - Delivery Overview Cards
  - Request Details Panel (headers, body, response)

### Teknik Detaylar:
- `useDeliveryStream` hook'u ile SSE bağlantısı
- URL search params ile state yönetimi
- Pagination desteği

---

## 4. Analytics

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/analytics/page.tsx`
**URL:** `/analytics`

### Özellikler:
- **Stat Cards** (3 adet):
  - Başarı oranı (%)
  - Toplam başarılı teslimat
  - Toplam başarısız teslimat
- **Teslimat Trend Grafiği**: Area chart (başarılı + başarısız)
- **Başarı Oranı Pasta Grafiği**: Donut chart (successful/failed/pending)
- **Gecikme Trend Grafiği**: Avg ve P95 gecikme süreleri
- **Zaman Aralığı Seçici**: 24h, 7d, 30d, 90d

### Teknik Detaylar:
- `useDeliveryTrend`, `useSuccessRate`, `useLatencyTrend` hook'ları
- Recharts (LazyCharts) ile grafikler
- Tremor tabanlı StatCard ve ChartCard bileşenleri

---

## 5. Logs

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/logs/LogsContent.tsx`
**URL:** `/logs`

### Özellikler:
- Teslimat loglarının detaylı görünümü
- Filtreleme ve arama
- Otomatik yenileme

---

## 6. Search

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/search/page.tsx`
**URL:** `/search`

### Özellikler:
- Global arama (webhook, endpoint, event)
- Sunucu taraflı arama (debounced)

---

## 7. Applications

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/applications/page.tsx`
**URL:** `/applications`

### Özellikler:
- **Uygulama Listesi**: Tüm uygulamaların görünümü
- **Uygulama Detay Sayfası** (`/applications/[id]`):
  - AppDetailContent bileşeni
  - Endpoint yönetimi
  - Event type yönetimi

### Not:
Bu sayfa Hook0'daki "Application" konseptine benzer. Her uygulama kendi endpoint'lerini ve event type'larını yönetebilir.

---

## 8. API Keys

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/api-keys/page.tsx`
**URL:** `/api-keys`

### Özellikler:
- **API Key Listesi**: Tüm anahtarların görünümü
- **Yeni Key Oluşturma**: CreateKeyForm bileşeni
- **Key Silme**: ConfirmActionModal ile onay
- **Key Detayları**: NewKeyAlert ile yeni key gösterimi
- **İşlemler**: Oluşturma, silme, yenileme

---

## 9. Webhooks

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/webhooks/page.tsx`
**URL:** `/webhooks`

### Özellikler:
- Webhook listesi ve yönetimi
- Yeni webhook oluşturma (`/webhooks/webhooks/new`)
- Webhook Glossary (`/webhooks/glossary`)
- Webhook Guides (`/webhooks/guides`)

---

## 10. Webhook Builder

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/webhook-builder/page.tsx`
**URL:** `/webhook-builder`

### Özellikler:
- **Görsel Webhook Oluşturucu**: Form tabanlı webhook payload oluşturma
- **Hazır Şablonlar**:
  - `order.created` (order_id, total, currency, customer_id)
  - `payment.completed` (payment_id, amount, status, method)
  - `user.created` (user_id, email, plan)
- **Alan Tipleri**: string, number, boolean, object, array
- **Endpoint Seçimi**: Hedef endpoint seçme
- **Canlı Önizleme**: JSON payload önizleme
- **Gönderim**: Direkt API'ye webhook gönderme

---

## 11. Playground / Sandbox

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/sandbox/playground/page.tsx`
**URL:** `/sandbox/playground`

### Özellikler:
- **API Playground**: REST API'yi test etme ortamı
- **HTTP Method Seçici**: GET, POST, PUT, DELETE, PATCH
- **Path Seçimi**: Hazır endpoint path'leri
- **Request Body Editörü**: JSON editör
- **Preset Templates**: Hazır payload şablonları
- **AI Payload Generator**: AI destekli payload oluşturma
- **Response Inspector**: Status, headers, body, duration
- **History Panel**: Geçmiş isteklerin listesi
- **Live Request Viewer**: Canlı istek görünümü

### Teknik Detaylar:
- `loadHistory` / `saveHistory` ile localStorage persistence
- API key otomatik header'a eklenir

---

## 12. Signature Verifier

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/signature-verifier/page.tsx`
**URL:** `/signature-verifier`

### Özellikler:
- **HMAC İmza Doğrulama**: SHA-256 ve SHA-512 desteği
- **Timing-safe karşılaştırma**: Timing saldırısı koruması
- **Payload Input**: Webhook payload'ı yapıştırma
- **Secret Input**: Gizli anahtar (gizleme/gösterme toggle)
- **Signature Input**: Doğrulanacak imza
- **Sonuç Gösterimi**: Valid / Invalid
- **Kod Örnekleri**: Node.js, Python, Go ile imza doğrulama kodu

### Teknik Detaylar:
- `timingSafeEqual` fonksiyonu ile constant-time comparison
- Web Crypto API kullanımı

---

## 13. Routing

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/routing/page.tsx`
**URL:** `/routing`

### Özellikler:
- **Yönlendirme Stratejileri** (4 çeşit):
  - **Round-Robin**: Sırayla dağıtım
  - **Failover**: Birincil başarısız olursa yedek
  - **Weighted**: Ağırlıklı dağıtım
  - **Random**: Rastgele dağıtım
- **Fallback URL**: Başarısız durumda alternatif URL
- **Endpoint Bazlı Konfigürasyon**: Her endpoint için ayrı strateji
- **Düzenleme Modal'ı**: Strateji + fallback URL düzenleme

---

## 14. Retry Policy

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/retry-policy/page.tsx`
**URL:** `/retry-policy`

### Özellikler:
- **Backoff Seçenekleri** (3 çeşit):
  - **Exponential**: Üstel artış (varsayılan)
  - **Linear**: Doğrusal artış
  - **Fixed**: Sabit aralık
- **Konfigürasyon Parametreleri**:
  - Max attempts (varsayılan: 3)
  - Initial delay (varsayılan: 10 saniye)
  - Max delay (varsayılan: 3600 saniye)
- **Dead Letter Queue Kartı**: Başarısız teslimatların listesi
- **Delay Preview Kartı**: Gecikme önizleme tablosu
- **Status Codes Kartı**: Hangi HTTP kodlarında yeniden deneme
- **Varsayılana Sıfırlama**: Reset butonu

---

## 15. Rate Limiting

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/rate-limiting/page.tsx`
**URL:** `/rate-limiting`

### Özellikler:
- **Endpoint Bazlı Rate Limit**: Her endpoint için ayrı limit
- **Konfigürasyon**:
  - Requests per second (RPS)
  - Burst size
  - Enabled/Disabled toggle
- **İstatistikler**:
  - Toplam endpoint sayısı
  - Ortalama RPS
  - Peak RPS
- **Düzenleme Modal'ı**: RPS ve burst ayarlama
- **Silme**: Rate limit kaldırma

---

## 16. Schemas

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/schemas/page.tsx`
**URL:** `/schemas`

### Özellikler:
- **JSON Schema Oluşturma**: Ad + açıklama + JSON Schema
- **Schema Listesi**: Tüm şemaların görünümü
- **Schema Görüntüleme**: JSON Schema detayı
- **Payload Doğrulama**: Schema ile payload test etme
- **Versiyonlama**: Schema versiyon takibi
- **Doğrulama Sonucu**: Valid/Invalid + hata detayları

---

## 17. Templates

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/templates/page.tsx`
**URL:** `/templates`

### Özellikler:
- **Hazır Şablonlar**: Sektörel webhook şablonları
- **Şablon Bilgileri**:
  - Ad, açıklama, sektör
  - Event type listesi
  - Endpoint sayısı
  - Agent listesi (AI agent'lar)
  - Tahmini günlük hacim
  - Etiketler
- **Şablon Uygulama**: Endpoint URL girerek şablonu uygulama
- **Agent Yönetimi**: Enabled/disabled agent seçimi

---

## 18. Transforms

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/transforms/page.tsx`
**URL:** `/transforms`

### Özellikler:
- **Transform Rules**: Endpoint bazlı dönüşüm kuralları
- **Filtreleme**:
  - Include filter (dahil et)
  - Exclude filter (hariç tut)
- **Haritalama** (Map):
  - Kaynak alan → hedef alan dönüştürme
- **Zenginleştirme** (Enrich):
  - Key-value çiftleri ekleme
- **Test Etme**: Test payload ile dönüşüm sonucu görme
- **Kural Oluşturma/Düzenleme/Silme**

---

## 19. Inbound Webhooks

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/inbound/InboundContent.tsx`
**URL:** `/inbound`

### Özellikler:
- **Harici Webhook Alma**: Stripe, GitHub, Shopify gibi servislerden webhook alma
- **Provider Desteği**: Çoklu provider desteği
- **Webhook Yönlendirme**: Gelen webhook'ları kendi endpoint'lerine yönlendirme

### Not:
Bu özellik rakiplerde (Svix, Hook0) yok — HookSniff'e özgü bir avantaj.

---

## 20. Alerts

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/alerts/page.tsx`
**URL:** `/alerts`

### Özellikler:
- Alert listesi ve yönetimi
- Alert oluşturma
- Bildirim kanalı seçimi

---

## 21. Notifications

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/notifications/page.tsx`
**URL:** `/notifications`

### Özellikler:
- Bildirim listesi
- Okundu/okunmadı durumu
- Bildirim ayarları

---

## 22. Team

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/team/page.tsx`
**URL:** `/team`

### Özellikler:
- **Ekip Listesi**: Tüm ekiplerin görünümü
- **Ekip Oluşturma**: CreateTeamModal
- **Üye Davet Etme**: InviteMemberModal (email ile)
- **Üye Çıkarma**: Onaylı silme
- **Rol Değiştirme**: Üye rolü güncelleme
- **Sahiplik Transferi**: TransferOwnershipModal
- **Davet Kabul/Red**: Davet linki ile
- **Davet İptali**: RevokeInvite
- **Davet Yeniden Gönderme**: ResendInvite
- **Ekip Düzenleme**: Ekip adı ve açıklama
- **Ekip Silme**: Onaylı silme
- **Ekipten Ayrılma**: LeaveTeam

---

## 23. Organization

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/organization/page.tsx`
**URL:** `/organization`

### Özellikler:
- Organizasyon ayarları
- Organizasyon adı düzenleme
- TransferOwnership

---

## 24. Billing

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/billing/page.tsx`
**URL:** `/billing`

### Özellikler:
- **Plan Kartları**: Mevcut plan ve yükseltme seçenekleri
- **Abonelik Detayları**: SubscriptionDetails bileşeni
- **Fatura Tablosu**: InvoiceTable ile fatura listesi
- **Kullanım Grafiği**: UsageChart
- **Aşım Ayarları**: OverageSettings
- **Plan Değişikliği**: Yükseltme/düşürme
- **İptal Modal'ı**: Abonelik iptali
- **Duraklatma Modal'ı**: Abonelik duraklatma (gün sayısı seçimi)
- **İndirim Kodu**: Discount code uygulama
- **Fatura Durumu**: InvoiceStatusBadge

---

## 25. Settings

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/page.tsx`
**URL:** `/settings`

### Sekmeler (5):
1. **Profile**: Ad, email, avatar, profil bilgileri
2. **Security**: Şifre değiştirme, 2FA (TOTP) kurulumu
3. **Notifications**: Bildirim tercihleri
4. **Privacy**: Gizlilik onayları (KVKK/GDPR)
5. **Danger Zone**: Hesap silme, veri dışa aktarma

### Bileşenler:
- ProfileSection
- PasswordSection
- TwoFactorSection
- NotificationSection
- PrivacyConsentSection (ConsentToggle)
- DangerZoneSection
- ApiKeySection

---

## 26. Security Section

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/security-section/page.tsx`
**URL:** `/security-section`

### Özellikler:
- Güvenlik ayarları görünümü
- Güvenlik olayları

---

## 27. SSO

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/sso/page.tsx`
**URL:** `/sso`

### Özellikler:
- Single Sign-On yapılandırması
- SSO provider seçimi
- Enterprise kimlik doğrulama

---

## 28. Health Monitoring

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/health/page.tsx`
**URL:** `/health`

### Özellikler:
- Endpoint sağlık durumu
- Uptime monitoring
- Sağlık kontrolü sonuçları

---

## 29. Observability

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/observability/page.tsx`
**URL:** `/observability`

### Özellikler:
- OpenTelemetry entegrasyonu
- Dağınık izleme (distributed tracing)
- Performans metrikleri
- Grafana Cloud entegrasyonu

---

## 30. Audit Log

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/audit-log/page.tsx`
**URL:** `/audit-log`

### Özellikler:
- Kullanıcı işlem logları
- Filtreleme ve arama
- Güvenlik denetimi

---

## 31. Custom Domain

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/custom-domain/CustomDomainContent.tsx`
**URL:** `/custom-domain`

### Özellikler:
- Özel alan adı yapılandırması
- DNS doğrulama
- SSL sertifikası

---

## 32. Portal

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/portal-customize/` ve `portal-manage/`
**URL:** `/portal-customize`, `/portal-manage`

### Özellikler:
- **Portal Özelleştirme**:
  - Renk tema ayarları
  - Logo ve marka bilgileri
  - Embed kodu oluşturma (EmbedCodePanel)
  - Canlı önizleme (PortalPreview)
- **Portal Yönetimi**:
  - Müşteri portalı ayarları
  - Erişim kontrolü

### Not:
Embeddable portal widget — rakiplerde olmayan özellik.

---

## 33. Integrations

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/integrations/IntegrationsContent.tsx`
**URL:** `/integrations`

### Özellikler:
- Üçüncü parti entegrasyonlar
- Entegrasyon listesi ve yapılandırma

---

## 34. Connectors

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/connectors/ConnectorsContent.tsx`
**URL:** `/connectors`

### Özellikler:
- Bağlayıcı yönetimi
- Veri kaynağı/hedefi yapılandırması

---

## 35. Environments

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/environments/EnvironmentsContent.tsx`
**URL:** `/environments`

### Özellikler:
- Ortam yönetimi (development, staging, production)
- Ortam bazlı konfigürasyon
- Environment variables

---

## 36. Service Tokens

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/service-tokens/page.tsx`
**URL:** `/service-tokens`

### Özellikler:
- Servis token yönetimi
- Token oluşturma ve silme
- Yetki ayarları

---

## 37. Background Tasks

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/background-tasks/page.tsx`
**URL:** `/background-tasks`

### Özellikler:
- Arka plan görevleri görünümü
- Görev durumu takibi
- Görev geçmişi

---

## 38. Operational Webhooks

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/operational-webhooks/`
**URL:** `/operational-webhooks`

### Özellikler:
- Operasyonel webhook yönetimi
- Sistem olayları için webhook'lar
- Webhook listesi ve yapılandırma

---

## 39. Message Poller

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/message-poller/MessagePollerContent.tsx`
**URL:** `/message-poller`

### Özellikler:
- Mesaj polling yapılandırması
- Polling aralığı ayarı
- Kaynak yapılandırma

---

## 40. Streaming

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/streaming/StreamingContent.tsx`
**URL:** `/streaming`

### Özellikler:
- SSE (Server-Sent Events) yapılandırması
- WebSocket streaming
- Canlı veri akışı

---

## 41. API Importer

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/api-importer/page.tsx`
**URL:** `/api-importer`

### Özellikler:
- **OpenAPI/Swagger İçe Aktarma**: API spec dosyasından otomatik endpoint oluşturma
- **Spec Input Panel**: URL veya dosya yükleme
- **Parsed Results Panel**: Ayrıştırılmış sonuçlar
- **Otomatik Endpoint Oluşturma**: Import edilen spec'ten endpoint

---

## 🎯 Rakip Karşılaştırma Özeti

### HookSniff'te Olup Rakiplerde Olmayan Özellikler:

| Özellik | Svix | Hook0 | HookSniff |
|---------|------|-------|-----------|
| Inbound Webhook Proxy | ❌ | ❌ | ✅ |
| Embeddable Portal | ❌ | ❌ | ✅ |
| Webhook Builder (Visual) | ❌ | ❌ | ✅ |
| AI Payload Generator | ❌ | ❌ | ✅ |
| Signature Verifier Tool | ❌ | ❌ | ✅ |
| API Importer (OpenAPI) | ❌ | ❌ | ✅ |
| 11 SDK | 10+ | 2 | ✅ |
| Multi-destination (HTTP+WS+Email) | HTTP | HTTP | ✅ |
| Smart Routing (4 strateji) | ❌ | ❌ | ✅ |
| FIFO Delivery | ❌ | ❌ | ✅ |
| Endpoint Throttling | ❌ | ❌ | ✅ |
| Schema Registry | ❌ | ❌ | ✅ |
| CloudEvents v1.0 | ❌ | ❌ | ✅ |
| $0/ay Hosting | ❌ | ❌ | ✅ |

---

## 📊 Dashboard Sayfa Sayıları

| Kategori | Sayfa Sayısı |
|----------|-------------|
| Core (Dashboard, Endpoints, Deliveries, Analytics, Logs, Search) | 6 |
| Webhook Yönetimi (Webhooks, Builder, Playground, Signature) | 4 |
| Yapılandırma (Routing, Retry, Rate Limit, Schemas, Templates, Transforms) | 6 |
| Inbound + Integrations (Inbound, Integrations, Connectors) | 3 |
| Bildirimler (Alerts, Notifications) | 2 |
| Ekip & Organizasyon (Team, Organization) | 2 |
| Faturalandırma (Billing) | 1 |
| Ayarlar (Settings, Security, SSO) | 3 |
| Monitoring (Health, Observability, Audit Log) | 3 |
| Portal (Custom Domain, Portal Customize, Portal Manage) | 3 |
| Altyapı (Environments, Service Tokens, Background Tasks, Operational Webhooks, Message Poller, Streaming) | 6 |
| API Importer | 1 |
| **Toplam** | **40+** |

---

> Bu dosya `.ai-context/` dizininde GitHub'da saklanır.
> Her oturum başında okunmalı, değişiklikler sonrası güncellenmeli.

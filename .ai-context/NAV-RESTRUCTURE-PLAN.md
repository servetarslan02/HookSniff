# 🗂️ Navigation Restructure Plan

> Tarih: 2026-05-15
> Durum: PLANLANAN — uygulanmadı

## Amaç
Mevcut sidebar ve tab yapısını müşteri gözünden yeniden düzenlemek.

## Mevcut Sorunlar
- API Keys → Billing'in içinde (fatura ile alakasız)
- Applications → Team'in içinde (uygulama ≠ takım)
- Service Tokens → Settings'in içinde (geliştirici aracı)
- Content → Monitoring altında (şema ≠ monitoring)
- Search → Core'da (delivery araması)
- Notifications → Team'de (bildirim ≠ takım)

## Final Kararı: 8 Sidebar Section

```
📊 Core
  └─ Dashboard
  └─ Endpoints
  └─ Applications          ← Team'den taşındı
  └─ API Keys              ← Billing'den taşındı

🔗 Deliveries              ← YENİ sayfa (birleştirildi)
  └─ Webhook Logs          ← Observability/Logs'dan
  └─ Deliveries            ← Core/Deliveries'dan
  └─ Search                ← Core/Search'dan

📐 Schema & Content        ← Kalır (zaten doğru)
  └─ Schemas
  └─ Templates
  └─ Inbound
  └─ Transforms

🛠️ DevTools                ← Kalır
  └─ Playground
  └─ Signature Tool
  └─ Webhook Builder
  └─ API Importer

📡 Observability            ← Sadece monitoring kalır
  └─ Health
  └─ Alerts
  └─ Analytics

🔒 Security                ← Routing'den ayrılır
  └─ Rate Limiting
  └─ Audit Log
  └─ SSO

🔀 Routing                 ← Security'den ayrılır
  └─ Retry Policy
  └─ Routing
  └─ Custom Domain

👥 Account                 ← Birleştirildi
  └─ Team & Notifications  ← Team + Notifications
  └─ Billing               ← Billing (API Keys çıkarıldı)
  └─ Settings              ← Settings + Service Tokens
  └─ Portal                ← Portal-section'dan taşındı
```

## Taşınacak Tab'lar

| Tab | Eski Yer | Yeni Yer |
|-----|----------|----------|
| Applications | team-mgmt | core |
| API Keys | billing-overview | core |
| Search | core | deliveries |
| Logs | observability | deliveries |
| Portal | portal-section | account |

## Uygulama Adımları

### 1. layout.tsx — Sidebar sections güncelle
- `dashboard/src/app/[locale]/(dashboard)/layout.tsx`
- 8 section tanımla

### 2. Yeni sayfa oluştur: /deliveries
- `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx`
- Logs + Deliveries + Search tab'larını birleştir

### 3. Mevcut sayfaları güncelle
- `/core` → Applications + API Keys tab ekle
- `/observability` → Logs tab çıkar
- `/account` → Yeni sayfa (Team + Notifications + Billing + Settings + Portal)

### 4. Eski sayfaları sil veya redirect et
- `/team-mgmt` → `/account` redirect
- `/billing-overview` → `/account` redirect
- `/settings-section` → `/account` redirect
- `/portal-section` → `/account` redirect

### 5. Middleware redirect'leri güncelle
- `dashboard/src/middleware.ts` — ROUTE_REDIRECTS

### 6. i18n key'leri güncelle
- Yeni nav key'leri ekle
- Eski key'leri koru (redirect için)

## Notlar
- Mevcut TabbedSection component'i aynen kullanılacak
- Component'ler taşınmayacak, sadece import yolları değişecek
- Her sayfa kendi tab'ını kendi yönetiyor (independent)

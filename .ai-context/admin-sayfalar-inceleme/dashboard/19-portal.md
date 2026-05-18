# 👤 Portal (Portal Manage)

> Sayfa: `dashboard/src/app/[locale]/dashboard/portal-manage/page.tsx`
> Route: `/dashboard/portal-manage`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- PortalProfile — Kullanıcı profili (email, plan, limit)
- PortalUsage — Kullanım istatistikleri

### PortalProfile
- email, name, plan, webhook_limit, webhook_count, created_at

### PortalUsage
- webhooks_used, api_calls_today, total_deliveries
- delivered, failed, success_rate, endpoints_count

## Özellikler
- ✅ Profil bilgileri
- ✅ Kullanım istatistikleri
- ✅ Plan bilgisi
- ✅ Webhook limit/sayı
- ✅ Success rate
- ✅ Error state
- ✅ Loading state

## Tespit Edilen Durumlar
### ⚠️ Potansiyel Sorunlar
- **Portal URL yok** — Embed link gösterimi eksik
- **Portal ayarlarına yönlendirme yok** — portal-customize'a link

### 🔴 Eksiklikler
- Portal paylaşma (link)
- Portal activity log
- Portal kullanıcı yönetimi

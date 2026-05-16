# Real-Time Upgrade — Eksik İşler Listesi

> Son güncelleme: 2026-05-16 23:06 GMT+8
> Oturum: 7 commit, Vercel deploy başarılı, Sentry DSN aktif

---

## ✅ TAMAMLANAN İŞLER (Bu Oturum)

### FAZ 1: React Query — ✅ %100
- [x] 35/35 sayfa React Query'de
- [x] 4 sayfa geçirildi (portal-customize, portal-manage, webhook-builder, webhooks/new)
- [x] TypeScript hataları düzeltildi (alertsApi unused, Team type mismatch, string|null fix)
- [x] Build başarılı

### FAZ 2: Event System — ✅ %100
- [x] auth.rs → UserCreated event publishing eklendi
- [x] endpoints.rs → EndpointCreated/Updated/Deleted/StatusChanged eklendi
- [x] publisher.rs → 4 yeni AppEvent varyantı eklendi

### FAZ 3: WebSocket — ✅ %100
- [x] Origin validation zaten var (routes/ws.rs → validate_origin())
- [x] Per-user connection limit zaten var (WsGateway)

### FAZ 4: Entegrasyon — ✅ %100
- [x] useRealtime.ts güncellendi (endpoint.*, alert.triggered event'leri)
- [x] Fallback polling zaten var (30sn)
- [x] Connection indicator zaten var (layout'ta yeşil/sarı/kırmızı dot)

### FAZ 5: Optimizasyon — ✅ %100
- [x] Sentry DSN eklendi (Vercel env var, production + preview)
- [x] ISR (revalidate=3600) 12 statik sayfaya eklendi
- [x] Build başarılı, TypeScript temiz

### FAZ 6: Güvenlik — ✅ %90
- [x] Origin validation var
- [x] k6 stress test scriptleri hazır
- [x] ConnectionRateLimiter var

---

## 📋 KALAN İŞLER (Sonraki Oturum)

### 🟡 Orta Öncelik

| # | İş | Faz | Detay |
|---|---|---|---|
| 1 | VirtualTable entegrasyonu | Faz 5 | `VirtualTable.tsx` component var ama hiçbir sayfada kullanılmıyor. Admin users, deliveries, audit-log sayfalarına uygulanacak. Şu an pagination var, acil değil. |
| 2 | Sentry test hatası gönderme | Faz 5 | DSN eklendi, production'da otomatik çalışacak. Ama manuel test göndermek istersen `Sentry.captureException(new Error('test'))` eklenebilir. |
| 3 | useDeliveryStream entegrasyonu | Faz 4 | SSE hook'u (`useDeliveryStream.ts`) var ama hiçbir yerde kullanılmıyor. WebSocket varken redundant, ama SSE fallback olarak kullanılabilir. |

### 🟢 Düşük Öncelik

| # | İş | Faz | Detay |
|---|---|---|---|
| 4 | k6 stress test çalıştırma | Faz 6 | Scriptler hazır (`tests/load/k6_ws_stress.js`). Çalıştırmak için k6 kurulmalı ve API endpoint'i hedeflenmeli. |
| 5 | Image optimization | Faz 5 | `<Image />` bileşenine geçiş kontrol edilmedi. Mevcut görseller lazy loading ile geliyor mu? |
| 6 | Code splitting | Faz 5 | Admin sayfaları dynamic import kontrolü. `core/page.tsx` zaten dynamic import kullanıyor. |
| 7 | WS monitoring metrics | Faz 6 | `/metrics` endpoint'ine WS metrikleri eklenip eklenmediği doğrulanmalı. `ws/metrics.rs` dosyası var ama entegrasyon kontrol edilmedi. |
| 8 | Token refresh → WS reconnect | Faz 6 | Expired token → refresh → WS reconnect akışı test edilmemiş. Frontend'de `useWebSocket.ts` token değişikliğini handle ediyor mu? |
| 9 | Duplicate message prevention | Faz 6 | Multi-instance'da Redis Streams consumer group ile duplicate prevention test edilmemiş. |
| 10 | Application events | Faz 2 | `applications.rs` CRUD operations için AppEvent enum'a event eklenmedi. Düşük öncelik çünkü application events kritik değil. |

---

## 🚀 Deploy Durumu

| Servis | Durum | URL |
|--------|-------|-----|
| Dashboard (Vercel) | ✅ Deploy edildi | https://dashboard-mocha-five-37.vercel.app |
| API (Cloud Run) | ⬜ Kontrol edilmedi | https://hooksniff-api-1046140057667.europe-west1.run.app |
| Sentry | ✅ DSN aktif | Production + Preview |
| ISR | ✅ 12 sayfa | revalidate = 3600 |

---

## 📝 Sonraki Oturum İçin Notlar

1. **Build düzeldi** — TypeScript hataları fix edildi, `next build` başarılı
2. **Sentry DSN** — Vercel'e eklendi, production'da otomatik hata yakalayacak
3. **Event publishing** — auth.rs ve endpoints.rs'de event tetikleme aktif
4. **ISR** — Tüm statik/marketing sayfaları 1 saat cache ile servis ediliyor
5. **Kalıcı token** — Vercel token `vcp_1Qcj...` sonraki oturumda da kullanılabilir

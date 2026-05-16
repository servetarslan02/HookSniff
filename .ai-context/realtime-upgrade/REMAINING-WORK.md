# Real-Time Upgrade — Eksik İşler Listesi

> Son güncelleme: 2026-05-16 22:45 GMT+8
> Kapsamlı tarama + düzeltmeler sonrası güncel durum

---

## FAZ 1: React Query — Durum: ✅ TAMAMLANDI

### Eski Kalıp Görünen Ama Aslında Uygun Olan Sayfalar
- [x] `custom-domain/page.tsx` — mutation-only sayfa, apiFetch uygun ✅
- [x] `sso/page.tsx` — okuma useSsoConfig ile, POST mutation apiFetch ile uygun ✅
- [x] `settings/ConsentToggle.tsx` — küçük self-contained bileşen ✅
- [x] `settings/DangerZoneSection.tsx` — küçük self-contained bileşen ✅
- [x] `settings/NotificationSection.tsx` — küçük self-contained bileşen ✅
- [x] `settings/TwoFactorSection.tsx` — twoFactorApi direkt kullanım uygun ✅
- [x] `admin/email/page.tsx` — form submission sayfası ✅
- [x] `admin/layout.tsx` — fetch çağrısı yok ✅
- [x] `admin/revenue/page.tsx` — hook kullanıyor, fetch CSV export için ✅
- [x] `admin/users/[id]/page.tsx` — hook kullanıyor ✅

### Kullanılmayan Bileşen/Hook'lar
- [ ] 11. `VirtualTable.tsx` — hiçbir sayfada kullanılmıyor (admin users, deliveries, audit-log'da kullanılmalı)
- [ ] 12. `useDeliveryStream.ts` — hiçbir sayfada kullanılmıyor

---

## FAZ 2: Event System — Durum: ✅ TAMAMLANDI

### Event Tetiklenen Route'lar
- [x] `auth.rs` → UserCreated ✅
- [x] `endpoints.rs` → EndpointCreated/Updated/Deleted/StatusChanged ✅
- [x] `webhooks.rs` → DeliveryCreated ✅ (zaten vardı)

### İptal Edilen / Uygulanabilir Olmayan
- `alerts.rs` → AlertTriggered — background worker yok, iptal
- `delivery_details.rs` → read-only route, worker'da tetiklenmeli
- `applications.rs` → Düşük öncelik, şu an gerekli değil

---

## FAZ 3: WebSocket — Durum: %80

- [ ] 18. Origin validation — ws_handler'da kontrol yok
- [ ] 19. Per-user connection limit doğrulanmamış

---

## FAZ 4: Entegrasyon — Durum: ✅ TAMAMLANDI

- [x] 20. Fallback polling — 30sn polling mevcut ✅
- [x] 21. useRealtime.ts güncellendi — endpoint.* ve alert.triggered event'leri ✅
- [ ] 22. useDeliveryStream (SSE) hiçbir yerde kullanılmıyor

---

## FAZ 5: Optimizasyon — Durum: %50

- [ ] 23. NEXT_PUBLIC_SENTRY_DSN env var ayarlanmamış
- [ ] 24. Sentry test hatası gönderilip doğrulanmamış
- [ ] 25. VirtualTable — admin users, deliveries, audit-log sayfalarına uygulanmalı
- [ ] 26. ISR (revalidate = 3600) statik sayfalara uygulanmamış
- [ ] 27. Image optimization kontrol edilmedi
- [ ] 28. Code splitting / lazy loading kontrol edilmedi

---

## FAZ 6: Güvenlik — Durum: %70

- [ ] 29. Token refresh → WS reconnect akışı test edilmemiş
- [ ] 30. WS monitoring metrics /metrics endpoint doğrulanmamış
- [ ] 31. Duplicate message prevention test edilmemiş
- [ ] 32. Graceful shutdown timeout test edilmemiş

---

## Öncelik Sırası (Güncel)

### 🟡 Yapılacak
1. VirtualTable uygulama (#11, #25) — performans
2. Origin validation (#18) — güvenlik
3. ISR statik sayfalar (#26) — performans
4. Sentry DSN (#23-24) — monitoring

### 🟢 Nice-to-have
5. useDeliveryStream entegrasyonu (#22)
6. Test'ler (#29-32)
7. Image optimization (#27)
8. Code splitting (#28)

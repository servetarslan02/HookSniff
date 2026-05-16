# Real-Time Upgrade — Eksik İşler Listesi

> Oluşturulma: 2026-05-16 22:30 GMT+8
> Kapsamlı tarama sonrası tespit edilen tüm eksikler

---

## FAZ 1: React Query — Eksikler

### Eski Kalıp Kullanan Sayfalar (apiFetch + useState + useEffect)
- [ ] 1. `custom-domain/page.tsx` — 3× apiFetch, hook yok
- [ ] 2. `sso/page.tsx` — POST hâlâ apiFetch (okuma hook ile)
- [ ] 3. `settings/ConsentToggle.tsx` — dynamic apiFetch import
- [ ] 4. `settings/DangerZoneSection.tsx` — dynamic apiFetch import
- [ ] 5. `settings/NotificationSection.tsx` — dynamic apiFetch import
- [ ] 6. `settings/TwoFactorSection.tsx` — twoFactorApi direkt
- [ ] 7. `admin/email/page.tsx` — adminApi direkt, React Query yok
- [ ] 8. `admin/layout.tsx` — fetch çağrısı var
- [ ] 9. `admin/revenue/page.tsx` — raw fetch .then() zinciri
- [ ] 10. `admin/users/[id]/page.tsx` — .then() zinciri, raw fetch

### Kullanılmayan Bileşen/Hook'lar
- [ ] 11. `VirtualTable.tsx` — hiçbir sayfada kullanılmıyor (admin users, deliveries, audit-log'da kullanılmalı)
- [ ] 12. `useDeliveryStream.ts` — hiçbir sayfada kullanılmıyor

---

## FAZ 2: Event System — Eksikler

### Event Tetiklenmeyen Route'lar
- [ ] 13. `auth.rs` → UserCreated event'i tetiklenmiyor
- [ ] 14. `endpoints.rs` → EndpointStatusChanged event'i tetiklenmiyor
- [ ] 15. `alerts.rs` → AlertTriggered event'i tetiklenmiyor
- [ ] 16. `delivery_details.rs` → DeliveryStatusChanged event'i tetiklenmiyor
- [ ] 17. `applications.rs` → Application event'leri yok

---

## FAZ 3: WebSocket — Eksikler

- [ ] 18. Origin validation — ws_handler'da kontrol yok
- [ ] 19. Per-user connection limit (WS_MAX_CONNECTIONS_PER_USER) doğrulanmamış

---

## FAZ 4: Entegrasyon — Eksikler

- [ ] 20. Fallback polling — useRealtime.ts'te WS yoksa 30sn polling eksik
- [ ] 21. Toast bildirimleri — UserCreated ve AlertTriggered için toast eksik
- [ ] 22. useDeliveryStream (SSE) hiçbir yerde kullanılmıyor

---

## FAZ 5: Optimizasyon — Eksikler

- [ ] 23. NEXT_PUBLIC_SENTRY_DSN env var ayarlanmamış
- [ ] 24. Sentry test hatası gönderilip doğrulanmamış
- [ ] 25. VirtualTable — admin users, deliveries, audit-log sayfalarına uygulanmalı
- [ ] 26. ISR (revalidate = 3600) statik sayfalara uygulanmamış (docs, landing, pricing)
- [ ] 27. Image optimization — <Image /> bileşenine geçiş kontrol edilmedi
- [ ] 28. Code splitting / lazy loading — admin sayfaları dynamic import kontrolü

---

## FAZ 6: Güvenlik — Eksikler

- [ ] 29. Token refresh → WS reconnect akışı test edilmemiş
- [ ] 30. WS monitoring metrics /metrics endpoint'ine eklenip eklenmediği doğrulanmamış
- [ ] 31. Duplicate message prevention (multi-instance) test edilmemiş
- [ ] 32. Graceful shutdown timeout test edilmemiş

---

## Öncelik Sırası

### 🔴 Kritik (hemen yapılacak)
1. Event tetikleme eksikleri (#13-17) — WS'e event gelmezse real-time çalışmaz
2. Fallback polling (#20) — WS koparsa sistem çöker
3. Eski kalıp sayfalar (#1-10) — tutarsızlık, cache bozulması

### 🟡 Önemli (sonraki)
4. VirtualTable uygulama (#11, #25) — performans
5. Toast bildirimleri (#21) — UX
6. Origin validation (#18) — güvenlik

### 🟢 Nice-to-have
7. Sentry DSN (#23-24) — monitoring
8. ISR (#26) — performans
9. Test'ler (#29-32) — doğrulama

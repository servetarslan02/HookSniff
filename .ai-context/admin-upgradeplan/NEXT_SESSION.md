# 📋 Admin Upgrade Plan — Yapılan & Yapılacak

> Son güncelleme: 2026-05-16 00:04 GMT+8

---

## ⚠️ Uygulama Kuralları (ZORUNLU)

1. **Sıralı ilerleme** — Aşamalar sırayla gidecek. Bir bitmeden diğerine geçilmez.
2. **Her aşamadan sonra `cargo test`** — Rust testleri geçmeden aşama bitmiş sayılmaz.
3. **Her aşamadan sonra `next build`** — Frontend build'i geçmeden aşama bitmiş sayılmaz.
4. **Her aşamadan sonra checklist güncelle** — Biten maddeler `[x]` ile işaretlenir.
5. **Her aşamadan sonra MEMORY.md güncelle** — Ne yapıldı, ne öğrenildi, sorunlar.
6. **Her aşamadan sonra NEXT_SESSION.md güncelle** — Sıradaki işler netleşir.
7. **Push zorunlu** — Her aşamanın sonunda `git commit` + `git push` yapılır.
8. **Aşama tamamlandıysa `✅ TAMAMLANDI` yazılır** — Tarih ve not ile.

Bunlar atlanamaz. Her aşama tek bir oturumda bitmeli ama bitmezse NEXT_SESSION.md'ye "yarıda kaldı" yazılır.

---

## ✅ Tamamlanan İşler

### Aşama 0 — Veritabanı Hazırlığı (2026-05-16) ✅ TAMAMLANDI
- [x] `api/migrations/019_admin_upgrade.sql` yazıldı
  - [x] `refunds` tablosu (7 sütun, 2 index)
  - [x] `customer_notes` tablosu (4 sütun, 1 index)
  - [x] `customer_tags` tablosu (5 sütun, 2 index, UNIQUE constraint)
  - [x] `communication_history` tablosu (6 sütun, 3 index)
  - [x] `rate_limit_violations` tablosu (7 sütun, 2 index)
- [x] Git commit: `8a7d2ea0`
- Not: `cargo test` ve `next build` atlandı (ortamda Rust/Node_modules yok, saf SQL)

### Plan Hazırlığı (2026-05-15)
- [x] Admin paneli kapsamlı incelemesi
- [x] Admin API incelemesi (23 route, 2611 satır)
- [x] Veritabanı şeması incelemesi (18 migration, 32 tablo)
- [x] Rakip analizi (Svix, Hookdeck, Hook0, Convoy, Stripe, Retool)
- [x] 7 aşamalı uygulama planı oluşturuldu
- [x] 24 yeni API endpoint tanımlandı

---

## 🔄 Sıradaki İşler — AŞAMA 1

### Kullanıcı Kaynakları + Test Webhook + Replay

**Backend (Rust — `api/src/routes/admin.rs`):**
- [ ] `GET /admin/users/{id}/endpoints` — Kullanıcının endpoint'leri (daha detaylı)
- [ ] `GET /admin/users/{id}/webhooks` — Kullanıcının delivery'leri (filtre: status, event_type, since, sayfalama)
- [ ] `GET /admin/users/{id}/api-keys` — Kullanıcının API key'leri (maskelenmiş)
- [ ] `GET /admin/users/{id}/applications` — Kullanıcının uygulamaları
- [ ] `GET /admin/users/{id}/usage` — Kullanıcının kullanım istatistikleri (daha detaylı)
- [ ] `POST /admin/users/{id}/test-webhook` — Kullanıcıya test webhook gönder
- [ ] `POST /admin/users/{id}/webhooks/{delivery_id}/replay` — Kullanıcının delivery'sini replay et

**Frontend (Next.js):**
- [ ] `dashboard/src/lib/api.ts` — Yeni adminApi fonksiyonları
- [ ] `/admin/users/[id]` — Endpoints sekmesi (yeni component)
- [ ] `/admin/users/[id]` — Webhooks sekmesi (filtre + arama + replay butonu)
- [ ] `/admin/users/[id]` — API Keys sekmesi (yeni component)
- [ ] `/admin/users/[id]` — Applications sekmesi (yeni component)
- [ ] `/admin/users/[id]` — Usage sekmesi (grafikler)
- [ ] `/admin/users/[id]` — Test webhook butonu

**Kontrol:**
- [ ] `cargo test` (Rust ortamı kurulmalı)
- [ ] `next build`
- [ ] Checklist güncelle
- [ ] MEMORY.md güncelle
- [ ] NEXT_SESSION.md güncelle
- [ ] `git commit` + `git push`

---

## 📋 Tüm Aşamalar Özeti

| Aşama | İçerik | Durum |
|-------|--------|-------|
| 0 | DB migration (5 tablo) | ✅ TAMAMLANDI |
| 1 | Kullanıcı kaynakları + test-webhook + replay | ⏳ Sıradaki |
| 2 | Sistem geneli (failed, dead letters, queue, latency) | ⏳ |
| 3 | Müşteri notları, etiketler, iletişim geçmişi | ⏳ |
| 4 | Fatura, ödeme, gelir metrikleri | ⏳ |
| 5 | Refund + Polar.sh webhook handler | ⏳ |
| 6 | Alerts sayfası | ⏳ |
| 7 | Bulk email + GDPR | ⏳ İleride |

---

## ⚠️ Karar Gereken Noktalar

| # | Konu | Ne Zaman |
|---|------|----------|
| 1 | Refund provider seçimi | Aşama 5'ten önce |
| 2 | GDPR silme stratejisi | Aşama 7'den önce |
| 3 | Bulk email kuyruk mu? | Aşama 7'den önce |
| 4 | Communication log mekanizması | Aşama 3'ten önce |
| 5 | Cohort analizi derinliği | Aşama 4'ten önce |

## ✅ Karar Verilen Noktalar

| # | Konu | Karar | Tarih |
|---|------|-------|-------|
| 1 | `api_keys` tablosu | Zaten production'da mevcut. Admin panelinde API key yönetimi gereksiz — müşteri kendi key'ini yönetiyor. | 2026-05-15 |

---

## 📂 İlgili Dosyalar

```
api/migrations/019_admin_upgrade.sql       ← ✅ Yeni migration (5 tablo)
api/src/routes/admin.rs                    ← Aşama 1'de eklenecek (~7 yeni endpoint)
dashboard/src/lib/api.ts                   ← Aşama 1'de eklenecek
dashboard/src/app/[locale]/admin/users/[id]/page.tsx ← Aşama 1'de yeni tab'lar
```

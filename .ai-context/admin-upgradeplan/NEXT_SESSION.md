# 📋 Admin Upgrade Plan — Yapılan & Yapılacak

> Son güncelleme: 2026-05-15

---

## ✅ Tamamlanan İşler

### Plan Hazırlığı (2026-05-15)
- [x] Admin paneli kapsamlı incelemesi (7 sayfa, tüm kod satırları)
- [x] Admin API incelemesi (23 route, 2611 satır Rust kodu)
- [x] Müşteri paneli incelemesi (36+ sayfa)
- [x] Veritabanı şeması incelemesi (18 migration, 32 tablo)
- [x] Rakip analizi (Svix, Hookdeck, Hook0, Convoy, Stripe, Retool)
- [x] Eksiklerin tespiti ve belgelenmesi
- [x] Veritabanı tutarsızlıklarının tespiti (api_keys, invoices, rate_limit_violations)
- [x] Mevcut bug'ların tespiti (5 adet)
- [x] ADMIN-PANEL-UPGRADE-PLAN.md yazımı (884 satır)
- [x] 7 aşamalı uygulama planı oluşturuldu
- [x] 24 yeni API endpoint tanımlandı
- [x] 6 yeni DB tablosu migration'ı tasarlandı
- [x] Aşama sıralaması optimize edildi
- [x] Kontrol listesi oluşturuldu (75 madde)
- [x] Karar noktaları belgelendi (6 konu)

---

## 🔄 Sıradaki İşler — AŞAMA 0

### Veritabanı Hazırlığı + Bug Fix

**Backend:**
- [ ] `api/migrations/019_admin_upgrade.sql` yaz
  - `refunds` tablosu
  - `customer_notes` tablosu
  - `customer_tags` tablosu
  - `communication_history` tablosu
  - `rate_limit_violations` tablosu
  - `api_keys` tablosu (karar gerekli)
- [ ] `cargo test` ile doğrula

**Bug Fix (Frontend):**
- [ ] `dashboard/src/app/[locale]/admin/page.tsx` — pie chart hardcoded pct düzelt
- [ ] `dashboard/src/app/[locale]/admin/page.tsx` — trend negatif Math.abs düzelt
- [ ] `dashboard/src/app/[locale]/admin/layout.tsx` — profile dropdown group-hover → click
- [ ] `dashboard/src/app/[locale]/admin/page.tsx` — currency ₺ hardcoded → platform_settings'den oku

**Push:**
- [ ] `git add` + `git commit` + `git push`

---

## 📋 Tüm Aşamalar Özeti

| Aşama | İçerik | Durum |
|-------|--------|-------|
| 0 | DB migration + bug fix | ⏳ Sıradaki |
| 1 | Kullanıcı kaynakları + test-webhook + replay | ⏳ |
| 2 | Sistem geneli (failed, dead letters, queue, latency) | ⏳ |
| 3 | Müşteri notları, etiketler, iletişim geçmişi | ⏳ |
| 4 | Fatura, ödeme, gelir metrikleri | ⏳ |
| 5 | Refund + Polar.sh webhook handler | ⏳ |
| 6 | Alerts sayfası | ⏳ |
| 7 | Bulk email + GDPR | ⏳ İleride |

---

## ⚠️ Karar Gereken Noktalar (Aşama 0'dan önce)

| # | Konu | Ne Zaman |
|---|------|----------|
| 1 | `api_keys` tablosu aktif mi? | Aşama 0'dan önce |
| 2 | Refund provider seçimi | Aşama 5'ten önce |
| 3 | GDPR silme stratejisi | Aşama 7'den önce |
| 4 | Bulk email kuyruk mu? | Aşama 7'den önce |
| 5 | Communication log mekanizması | Aşama 3'ten önce |
| 6 | Cohort analizi derinliği | Aşama 4'ten önce |

---

## 📂 İlgili Dosyalar

```
api/src/routes/admin.rs                    ← Ana admin API dosyası
api/migrations/019_admin_upgrade.sql       ← YENİ oluşturulacak
dashboard/src/app/[locale]/admin/page.tsx  ← Overview (bug fix gerekli)
dashboard/src/app/[locale]/admin/layout.tsx ← Layout (bug fix gerekli)
dashboard/src/app/[locale]/admin/users/[id]/page.tsx ← User detail (yeni tab'lar eklenecek)
dashboard/src/app/[locale]/admin/system/page.tsx ← System (yeni section'lar eklenecek)
dashboard/src/app/[locale]/admin/revenue/page.tsx ← Revenue (yeni metrikler eklenecek)
dashboard/src/lib/api.ts                   ← adminApi fonksiyonları (yeni eklenecek)
```

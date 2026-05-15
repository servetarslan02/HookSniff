# 🧠 Admin Upgrade Plan — Hafıza

> Son güncelleme: 2026-05-16 02:10 GMT+8

---

## Aşama İlerleme

| Aşama | İçerik | Durum | Tarih |
|-------|--------|-------|-------|
| 0 | DB migration (5 tablo, 11 index) | ✅ TAMAMLANDI | 2026-05-16 |
| 1 | Kullanıcı kaynakları (7 endpoint, 6 sekme) | ✅ TAMAMLANDI | 2026-05-16 |
| 2 | Sistem geneli (failed, dead letters, queue, latency) | ✅ TAMAMLANDI | 2026-05-16 |
| 3 | Müşteri notları, etiketler, iletişim geçmişi | ✅ TAMAMLANDI | 2026-05-16 |
| 4 | Fatura, ödeme, gelir metrikleri | ✅ TAMAMLANDI | 2026-05-16 |
| 5 | Refund + Polar.sh webhook handler | ✅ TAMAMLANDI | 2026-05-16 |
| 6 | Alerts sayfası | ⏳ | |
| 7 | Bulk email + GDPR | ⏳ İleride | |

---

## Karar Verilen Noktalar

| # | Konu | Karar | Tarih |
|---|------|-------|-------|
| 1 | `api_keys` tablosu | Production'da mevcut. Admin panelinde yönetim gereksiz. | 2026-05-15 |
| 2 | Refund provider | Mevcut `billing/refund.rs` + `billing/polar.rs` kullanıldı. Admin panelinden manuel refund. | 2026-05-16 |

## Karar Gereken Noktalar

| # | Konu | Ne Zaman |
|---|------|----------|
| 1 | GDPR silme stratejisi | Aşama 7'den önce |
| 2 | Bulk email kuyruk mu? | Aşama 7'den önce |

---

## Son Yapılan İş

### Aşama 5 — Refund + Polar.sh (2026-05-16) ✅ TAMAMLANDI

**Backend (admin.rs — +345 satır):**
- [x] `POST /admin/users/{id}/refund` — Admin refund oluştur (amount_cents, reason, currency)
  - Kullanıcı var mı + plan kontrolü (free/developer reddedilir)
  - Son paid invoice'ı bulur, amount'u invoice'ı aşamaz
  - refunds tablosuna kayıt + invoice status → refunded + customer → free plan
  - log_communication() + audit log
- [x] `GET /admin/users/{id}/refunds` — Kullanıcının refund geçmişi (sayfalama)
- [x] `GET /admin/refunds` — Sistem geneli refund listesi (status filtre + sayfalama)
- [x] 8 yeni test (AdminRefundRequest, RefundQuery, RefundRow serialization)

**Frontend (users/[id]/page.tsx — +141 satır):**
- [x] Billing sekmesinde "Process Refund" butonu (sadece paid planlarda görünür)
- [x] Refund onay dialogu (miktar USD + sebep textarea)
- [x] Refund History tablosu (amount kırmızı, reason, status badge, provider, date)
- [x] handleRefund() — validation + adminApi.refundUser + toast + tab refresh

**Frontend (revenue/page.tsx — +58 satır):**
- [x] Sistem geneli Refund History section'ı (customer_id, amount, reason, status, date)
- [x] getAllRefunds() entegrasyonu

**API (api.ts — +21 satır):**
- [x] refundUser(token, userId, amount_cents, reason, currency?)
- [x] getUserRefunds(token, userId, params?)
- [x] getAllRefunds(token, params?)

**Router:**
- [x] 3 yeni route eklendi (users/{id}/refund POST, users/{id}/refunds GET, refunds GET)

**Git:**
- [x] Commit: `3fbc6be8`
- [x] Push: main → origin ✅

### Aşama 4 — Fatura, Ödeme, Gelir Metrikleri (2026-05-16) ✅ TAMAMLANDI

**Backend (admin.rs — +280 satır):**
- [x] `GET /admin/users/{id}/invoices` — Fatura listesi (status filtre + sayfalama)
- [x] `GET /admin/users/{id}/payments` — Ödeme geçmişi (sayfalama)
- [x] `GET /admin/revenue/metrics` — ARPU, LTV, NRR, expansion revenue, churn rate, avg retention
- [x] `GET /admin/revenue/cohorts` — Aylık cohort analizi (signup, active, retention, revenue)
- [x] 6 yeni test (InvoiceQuery, PaymentQuery, CohortQuery, serialization)

**Frontend:**
- [x] Billing sekmesi (users/[id]): invoices tablosu (status badge, filtre), payments tablosu
- [x] Revenue sayfası: ARPU, LTV, NRR, Expansion kartları + müşteri breakdown
- [x] Revenue sayfası: Cohort analiz tablosu (retention bar, revenue)
- [x] 5 yeni adminApi fonksiyonu (getUserInvoices, getUserPayments, getRevenueMetrics, getRevenueCohorts)

### Aşama 3 — Müşteri İlişkileri (2026-05-16) ✅ TAMAMLANDI

**Backend (admin.rs — +220 satır):**
- [x] `POST /admin/users/{id}/notes` — Not ekle (communication_history'ye otomatik log)
- [x] `GET /admin/users/{id}/notes` — Notları listele
- [x] `POST /admin/users/{id}/tags` — Etiket ekle (UNIQUE constraint, upsert)
- [x] `DELETE /admin/users/{id}/tags/{tag}` — Etiket kaldır
- [x] `GET /admin/users/{id}/tags` — Etiketleri listele
- [x] `GET /admin/users/{id}/communications` — İletişim geçmişi (type filtre + sayfalama)
- [x] `log_communication()` helper — mevcut aksiyonlara otomatik log eklendi
- [x] 7 yeni test

**Frontend:**
- [x] Notes & Tags sekmesi: tag CRUD, not listesi + ekleme
- [x] Communications sekmesi: type badge, filtre dropdown, sayfalama
- [x] 6 yeni adminApi fonksiyonu

---

## Ortam Notları

- **Rust 1.95.0** kurulu (sub-agent tarafından) — bu ortamda kurulu değil, son oturumda kurulacak
- `cargo check` ve `cargo test` çalışır durumda
- `next build` için node_modules gerekli — bu ortamda install yasak
- `cargo check` süresi: ~7 sn (cache ile), ilk çalışma ~2 dk

---

## Öğrenilenler

1. `deliveries` tablosunda `error_message` yok — `delivery_attempts` tablosunda
2. `deliveries` tablosunda `event` yok — doğrusu `event_type`
3. `api_keys` tablosu migration'da yok ama `inbound.rs`'de aktif sorgu var
4. `invoices`/`payment_transactions` tabloları boş — Polar.sh webhook handler gerekli
5. `applications` tablosu migration 013'te mevcut
6. Admin mevcut: 23 route → şimdi 33 route (10 yeni eklendi)
7. `refunds` tablosu zaten migration 019'da mevcut — yeni migration gerekmedi
8. `billing/refund.rs` modülü zaten var (14 gün pencere, provider cancel) — admin endpoint'leri bu modülü kullandı
9. `billing/polar.rs` Polar.sh entegrasyonu zaten var — webhook handler da mevcut
10. JSX'te `&& (...)` içinde tek root element olmalı, birden fazla kardeş varsa `<>...</>` ile sar

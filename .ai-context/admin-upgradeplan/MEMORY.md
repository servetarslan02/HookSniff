# 🧠 Admin Upgrade Plan — Hafıza

> Son güncelleme: 2026-05-16 00:40 GMT+8

---

## Aşama İlerleme

| Aşama | İçerik | Durum | Tarih |
|-------|--------|-------|-------|
| 0 | DB migration (5 tablo, 11 index) | ✅ TAMAMLANDI | 2026-05-16 |
| 1 | Kullanıcı kaynakları (7 endpoint, 6 sekme) | ✅ TAMAMLANDI | 2026-05-16 |
| 2 | Sistem geneli (failed, dead letters, queue, latency) | ✅ TAMAMLANDI | 2026-05-16 |
| 3 | Müşteri notları, etiketler, iletişim geçmişi | ✅ TAMAMLANDI | 2026-05-16 |
| 4 | Fatura, ödeme, gelir metrikleri | ⏳ | |
| 5 | Refund + Polar.sh webhook handler | ⏳ | |
| 6 | Alerts sayfası | ⏳ | |
| 7 | Bulk email + GDPR | ⏳ İleride | |

---

## Karar Verilen Noktalar

| # | Konu | Karar | Tarih |
|---|------|-------|-------|
| 1 | `api_keys` tablosu | Production'da mevcut. Admin panelinde yönetim gereksiz. | 2026-05-15 |

## Karar Gereken Noktalar

| # | Konu | Ne Zaman |
|---|------|----------|
| 1 | Refund provider seçimi | Aşama 5'ten önce |
| 2 | GDPR silme stratejisi | Aşama 7'den önce |
| 3 | Bulk email kuyruk mu? | Aşama 7'den önce |
| 4 | Communication log mekanizması | Aşama 3'ten önce |
| 5 | Cohort analizi derinliği | Aşama 4'ten önce |

---

## Son Yapılan İş

### Aşama 3 — Müşteri İlişkileri (2026-05-16) ✅ TAMAMLANDI

**Backend (admin.rs — +220 satır):**
- [x] `POST /admin/users/{id}/notes` — Not ekle (communication_history'ye otomatik log)
- [x] `GET /admin/users/{id}/notes` — Notları listele
- [x] `POST /admin/users/{id}/tags` — Etiket ekle (UNIQUE constraint, upsert)
- [x] `DELETE /admin/users/{id}/tags/{tag}` — Etiket kaldır
- [x] `GET /admin/users/{id}/tags` — Etiketleri listele
- [x] `GET /admin/users/{id}/communications` — İletişim geçmişi (type filtre + sayfalama)
- [x] `log_communication()` helper — mevcut aksiyonlara otomatik log eklendi:
  - `send_user_email` → "email" tipinde log
  - `change_status` → "ban"/"activated" tipinde log
  - `change_plan` → "plan_change" tipinde log
  - `impersonate_user` → "impersonate" tipinde log
- [x] 7 yeni test (CreateNoteRequest, CreateTagRequest, CommunicationQuery, serialization)

**Frontend (api.ts + users/[id]/page.tsx — +180 satır):**
- [x] 6 yeni adminApi fonksiyonu (addNote, getNotes, addTag, removeTag, getTags, getCommunications)
- [x] Notes & Tags sekmesi: tag CRUD (renkli badge, silme butonu), not listesi + ekleme
- [x] Communications sekmesi: type badge (renk kodlu), filtre dropdown, sayfalama
- [x] TabKey type güncellendi ('notes' | 'communications')

**Router:**
- [x] 5 yeni route eklendi (notes GET/POST, tags GET/POST/DELETE, communications GET)

### Vercel Build Fix — 2026-05-16 00:40 GMT+8
- **Hata:** `Expected '</', got '{'` — users/[id]/page.tsx satır 416
- **Sebep:** `{activeTab === "overview" && (...)}` bloğunda birden fazla kardeş JSX elementi (grid, plan history, recent deliveries, analytics charts) ama fragment ile sarılmamış
- **Fix:** `<>...</>` fragment eklendi — sadece 2 satır değişti
- **Commit:** a907d0c6, push edildi
- **Ders:** JSX'te `&& (...)` içinde tek root element olmalı, birden fazla kardeş varsa `<>...</>` ile sar

---

## Ortam Notları

- **Rust 1.95.0** kurulu (sub-agent tarafından)
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
6. Admin mevcut: 23 route → şimdi 30 route (7 yeni eklendi)

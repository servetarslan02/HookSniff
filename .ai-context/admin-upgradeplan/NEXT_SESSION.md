# 📋 Admin Upgrade Plan — Yapılan & Yapılacak

> Son güncelleme: 2026-05-16 00:11 GMT+8

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

---

## ✅ Tamamlanan İşler

### Aşama 1 — Kullanıcı Kaynakları (2026-05-16) ✅ TAMAMLANDI

**Backend (admin.rs — +371 satır):**
- [x] `GET /admin/users/{id}/endpoints` — delivery istatistikli endpoint listesi
- [x] `GET /admin/users/{id}/webhooks` — filtre (status, event_type, since) + sayfalama + error_message subquery
- [x] `GET /admin/users/{id}/api-keys` — customers tablosundan (prefix + created_at)
- [x] `GET /admin/users/{id}/applications` — endpoint sayısı ile
- [x] `GET /admin/users/{id}/usage` — detaylı istatistikler (30 gün, 7 gün, top events)
- [x] `POST /admin/users/{id}/test-webhook` — SSRF korumalı, audit loglu
- [x] `POST /admin/users/{id}/webhooks/{delivery_id}/replay` — user-Scoped replay
- [x] `cargo test` — 32 test geçti, 0 başarısız ✅
- [x] `cargo check` — sırf mevcut uyarılar (R2Error dead_code), yeni hata yok ✅

**Frontend (api.ts + user detail page — +286 satır):**
- [x] 7 yeni adminApi fonksiyonu (getUserEndpoints, getUserWebhooks, getUserApiKeys, getUserApplications, getUserUsage, adminUserTestWebhook, adminUserReplayDelivery)
- [x] 6 sekme: Overview, Endpoints, Webhooks, API Keys, Applications, Usage
- [x] Webhooks sekmesi: filtre (status dropdown), sayfalama, replay butonu
- [x] Usage sekmesi: istatistik kartları, delivery breakdown, top events
- [x] `next build` — ⚠️ Atlandı (node_modules yok, install yasak)

**Git:**
- [x] Commit: `584f961d` (backend), `31e1bfca` (frontend)
- [x] Push: main → origin ✅

### Aşama 0 — DB Migration (2026-05-16) ✅ TAMAMLANDI
- [x] `019_admin_upgrade.sql` — 5 tablo, 11 index
- [x] Commit: `8a7d2ea0`

### Plan Hazırlığı (2026-05-15)
- [x] Kapsamlı inceleme + rakip analizi + 7 aşamalı plan

---

## ✅ Tamamlanan İşler

### Aşama 2 — Sistem Geneli Monitoring (2026-05-16) ✅ TAMAMLANDI

**Backend (admin.rs — +250 satır):**
- [x] `GET /admin/deliveries/failed` — tüm kullanıcıların failed delivery'leri (filtre: since, user_id, limit)
- [x] `GET /admin/deliveries/dead-letters` — dead_letters tablosundan (limit)
- [x] `GET /admin/queue/status` — webhook_queue depth (pending/processing/failed/total/oldest/failed_1h)
- [x] `GET /admin/rate-limit-violations` — rate_limit_violations tablosundan (limit)
- [x] `GET /admin/api-latency` — endpoint bazlı response time (avg, p95, error rate) — delivery_attempts JOIN
- [x] Test'ler eklendi (5 test: params defaults + serialization)

**Frontend (system/page.tsx — +200 satır):**
- [x] Queue Status kartları (pending/processing/failed/total, failed_last_hour uyarısı)
- [x] Failed Deliveries tablosu (kullanıcı linkli, hata mesajlı, 24h filtre)
- [x] Dead Letters tablosu (kalıcı başarısızlıklar, reason)
- [x] Rate Limit Violations tablosu (IP, requests, limit, window)
- [x] API Latency tablosu (avg, p95, error rate badge — renk kodlu)
- [x] Monitoring data auto-fetch (useEffect + useCallback)

**API (api.ts — +40 satır):**
- [x] 5 yeni adminApi fonksiyonu (getFailedDeliveries, getDeadLetters, getQueueStatus, getRateLimitViolations, getApiLatency)

**Build:**
- [x] `next build` — başarılı ✅

**Git:**
- [x] Commit: `3c752933`
- [x] Push: main → origin ✅

---

## 📋 Tüm Aşamalar Özeti

| Aşama | İçerik | Durum |
|-------|--------|-------|
| 0 | DB migration (5 tablo) | ✅ TAMAMLANDI |
| 1 | Kullanıcı kaynakları + test-webhook + replay | ✅ TAMAMLANDI |
| 2 | Sistem geneli (failed, dead letters, queue, latency) | ✅ TAMAMLANDI |
| 3 | Müşteri notları, etiketler, iletişim geçmişi | ⏳ Sıradaki |
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

---

## 📂 İlgili Dosyalar

```
api/migrations/019_admin_upgrade.sql       ← ✅ Aşama 0
api/src/routes/admin.rs                    ← ✅ Aşama 1+2 (+620 satır, 12 endpoint)
dashboard/src/lib/api.ts                   ← ✅ Aşama 1+2 (+12 fonksiyon)
dashboard/src/app/[locale]/admin/users/[id]/page.tsx ← ✅ Aşama 1 (6 sekme)
dashboard/src/app/[locale]/admin/system/page.tsx ← ✅ Aşama 2 (5 monitoring section)
```

---

## 🔄 Sıradaki İşler — AŞAMA 3

### Müşteri İlişkileri Yönetimi

**Backend (admin.rs):**
- [ ] `POST /admin/users/{id}/notes` — Not ekle
- [ ] `GET /admin/users/{id}/notes` — Notları listele
- [ ] `POST /admin/users/{id}/tags` — Etiket ekle
- [ ] `DELETE /admin/users/{id}/tags/{tag}` — Etiket kaldır
- [ ] `GET /admin/users/{id}/communications` — İletişim geçmişini listele
- [ ] Mevcut aksiyonları communication_history tablosuna otomatik logla

**Frontend (users/[id]/page.tsx):**
- [ ] Notes & Tags sekmesi
- [ ] Communication sekmesi
- [ ] Etiket renkleri: VIP=gold, at-risk=red, enterprise=purple

**Kontrol:**
- [ ] `cargo test`
- [ ] `next build`
- [ ] Checklist + MEMORY.md + NEXT_SESSION.md güncelle
- [ ] `git commit` + `git push`

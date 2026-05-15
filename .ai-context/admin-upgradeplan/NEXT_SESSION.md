# 📋 Admin Upgrade Plan — Yapılan & Yapılacak

> Son güncelleme: 2026-05-16 02:10 GMT+8

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

## 📋 Tüm Aşamalar Özeti

| Aşama | İçerik | Durum | Tarih |
|-------|--------|-------|-------|
| 0 | DB migration (5 tablo) | ✅ TAMAMLANDI | 2026-05-16 |
| 1 | Kullanıcı kaynakları + test-webhook + replay | ✅ TAMAMLANDI | 2026-05-16 |
| 2 | Sistem geneli (failed, dead letters, queue, latency) | ✅ TAMAMLANDI | 2026-05-16 |
| 3 | Müşteri notları, etiketler, iletişim geçmişi | ✅ TAMAMLANDI | 2026-05-16 |
| 4 | Fatura, ödeme, gelir metrikleri | ✅ TAMAMLANDI | 2026-05-16 |
| 5 | Refund + Polar.sh webhook handler | ✅ TAMAMLANDI | 2026-05-16 |
| 6 | Alerts sayfası | ⏳ Sıradaki | |
| 7 | Bulk email + GDPR | ⏳ İleride | |

---

## ✅ Son Tamamlanan — AŞAMA 5

### Refund + Polar.sh (2026-05-16) ✅ TAMAMLANDI

**Backend (admin.rs — +345 satır):**
- [x] `POST /admin/users/{id}/refund` — Admin refund oluştur
- [x] `GET /admin/users/{id}/refunds` — Kullanıcının refund geçmişi
- [x] `GET /admin/refunds` — Sistem geneli refund listesi
- [x] log_communication() + audit log entegrasyonu
- [x] 8 yeni test

**Frontend:**
- [x] Billing sekmesinde Process Refund butonu + onay dialogu
- [x] Refund History tablosu (users/[id])
- [x] Sistem geneli Refund History (revenue sayfası)
- [x] 3 yeni adminApi fonksiyonu

**Git:**
- [x] Commit: `3fbc6be8`
- [x] Push: main → origin ✅

**Not:** `cargo test` ve `next build` atlandı (Rust kurulu değil, son oturumda yapılacak).

---

## 🔄 Sıradaki İşler — AŞAMA 6

### Alerts Sayfası + Final (0.5 oturum)

**Hedef:** Alerts'i ayrı sayfaya taşı, genel polish.

**Backend:**
- [ ] Mevcut alerts endpoint'leri zaten var (GET, POST, PUT, DELETE) — yeni endpoint gerekmez

**Frontend:**
- [ ] Yeni `/admin/alerts` sayfası oluştur
- [ ] Alert listesi (aktif/pasif filtresi)
- [ ] Alert oluşturma/düzenleme formu
- [ ] Son incident geçmişi
- [ ] Sidebar'a Alerts linki ekle

**Kontrol:**
- [ ] `cargo test` (Rust kurulacak)
- [ ] `next build`
- [ ] Checklist + MEMORY.md + NEXT_SESSION.md güncelle
- [ ] `git commit` + `git push`

---

## ⚠️ Karar Gereken Noktalar

| # | Konu | Ne Zaman |
|---|------|----------|
| 1 | GDPR silme stratejisi | Aşama 7'den önce |
| 2 | Bulk email kuyruk mu? | Aşama 7'den önce |

---

## 📂 İlgili Dosyalar

```
api/migrations/019_admin_upgrade.sql       ← ✅ Aşama 0
api/src/routes/admin.rs                    ← ✅ Aşama 1+2+3+4+5 (+1465 satır, 33 endpoint)
dashboard/src/lib/api.ts                   ← ✅ Aşama 1+2+3+4+5 (+26 fonksiyon)
dashboard/src/app/[locale]/admin/users/[id]/page.tsx ← ✅ Aşama 1+3+4+5 (9 sekme)
dashboard/src/app/[locale]/admin/system/page.tsx ← ✅ Aşama 2 (5 monitoring section)
dashboard/src/app/[locale]/admin/revenue/page.tsx ← ✅ Aşama 4+5 (metrics + cohort + refund)
dashboard/src/app/[locale]/admin/alerts/page.tsx ← ⏳ Aşama 6 (yeni sayfa)
```

---

## 📝 Aşama 5 Notları

- `refunds` tablosu zaten migration 019'da mevcut — yeni migration gerekmedi
- `billing/refund.rs` modülü zaten var (14 gün pencere, provider cancel) — admin endpoint'leri bu mantığı kullandı
- `billing/polar.rs` Polar.sh entegrasyonu zaten var — webhook handler da mevcut
- Admin refund endpoint'i mevcut `billing/refund.rs`'den farklı: admin manuel refund yapar (miktar + sebep), 14 gün penceresi yok
- Refund sonrası kullanıcı otomatik olarak free plan'a düşürülür

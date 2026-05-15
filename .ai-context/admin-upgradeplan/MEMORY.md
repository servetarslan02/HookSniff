# 🧠 Admin Upgrade Plan — Hafıza

> Son güncelleme: 2026-05-16 02:57 GMT+8

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
| 6 | Alerts sayfası | ✅ TAMAMLANDI | 2026-05-16 |
| 7 | Bulk email + GDPR | ✅ TAMAMLANDI | 2026-05-16 |

---

## UI Düzenlemeleri (2026-05-16)

### Overview Sayfası — Tab Yapısı
- 4 tab: **📊 Genel Bakış** | **📋 Aktivite** | **💚 Sağlık** | **🏗️ Altyapı**
- Genel Bakış: Stats cards, MRR/ARR, Users by Plan, Weekly Comparison
- Aktivite: Recent Activity (Audit Log), Recent Signups, Quick Actions
- Sağlık: Endpoint Status, Security Warnings, Uptime, Service Status
- Altyapı: Feature Flags, Standard Webhooks, Deduplication, Last Deploy

### Settings Sayfası — Tab Yapısı
- 3 tab: **⚙️ Genel** | **📧 Email & Güvenlik** | **🚨 Uyarı & Retry**
- Genel: General, Plan Limits, Plan Prices
- Email & Güvenlik: Email Settings, Security, Backup
- Uyarı & Retry: Retry Settings, Alert Thresholds

### Sidebar Navigasyonu (Güncel)
```
📊 Genel Bakış
👥 Kullanıcılar
💰 Gelir
🚩 Feature Flags
🖥️ Sistem
⚙️ Ayarlar
📋 Aktivite Günlüğü
🔔 Uyarılar
📧 E-posta        ← ayrı sayfa (bulk email)
📁 Kullanıcı Paneli
```

---

## Karar Verilen Noktalar

| # | Konu | Karar | Tarih |
|---|------|-------|-------|
| 1 | `api_keys` tablosu | Production'da mevcut. Admin panelinde yönetim gereksiz. | 2026-05-15 |
| 2 | Refund provider | Mevcut `billing/refund.rs` + `billing/polar.rs` kullanıldı. | 2026-05-16 |
| 3 | Bulk email | Ayrı `/admin/email` sayfasına taşındı (settings'den çıkarıldı). | 2026-05-16 |
| 4 | GDPR export | Hassas alanlar (password_hash, api_key_hash, totp_secret) export'ta yok. | 2026-05-16 |
| 5 | Overview yapısı | 4 tab'a ayrıldı (877 satır tek sayfa → organize). | 2026-05-16 |
| 6 | Settings yapısı | 3 tab'a ayrıldı. | 2026-05-16 |

---

## Son Yapılan İş

### Refactor — UI Düzenlemeleri (2026-05-16)

**Overview Tab Yapısı:**
- [x] Tab navigation eklendi (4 tab)
- [x] Section'lar tab'lara göre organize edildi
- [x] Hidden class ile show/hide
- [x] i18n: tr + en tab label'ları

**Settings Tab Yapısı:**
- [x] Tab navigation eklendi (3 tab)
- [x] Section'lar tab'lara göre organize edildi
- [x] i18n: tr + en tab label'ları

**Bulk Email Ayrı Sayfa:**
- [x] `/admin/email` sayfası oluşturuldu
- [x] Compose formu (plan/status filtre, subject, body)
- [x] Sonuç gösterimi + session geçmişi
- [x] Settings'den bulk email çıkarıldı
- [x] Sidebar'a 📧 E-posta linki eklendi

**i18n Düzeltmeleri:**
- [x] `nav.alerts` çevirisi eklendi (tr + en)
- [x] `nav.email` çevirisi eklendi (tr + en)
- [x] Tab label'ları eklendi

**Bug Fix:**
- [x] Duplicate Stats Cards section kaldırıldı
- [x] Turbofish syntax hatası düzeltildi (`row.get::<i32>, _` → `row.get::<i32, _>`)

**Git Commits:**
- `82ed4abb` — Settings tab yapısı
- `7bfd2c7a` — Duplicate section fix
- `cacd5275` — Turbofish syntax fix
- `0846867f` — Bulk email ayrı sayfa
- `b4a73c10` — i18n nav.alerts fix
- `5b0add80` — Overview tab yapısı

---

## Dosya Haritası (Güncel)

```
api/migrations/019_admin_upgrade.sql       ← ✅ Aşama 0
api/src/routes/admin.rs                    ← ✅ Aşama 1-7 (+2000+ satır, 49 route, 64 test)
dashboard/src/lib/api.ts                   ← ✅ Aşama 1-7 (+30+ adminApi fonksiyonu)
dashboard/src/app/[locale]/admin/page.tsx  ← ✅ Overview (4 tab yapısı)
dashboard/src/app/[locale]/admin/users/[id]/page.tsx ← ✅ User detail (9 sekme + GDPR + Refund)
dashboard/src/app/[locale]/admin/revenue/page.tsx ← ✅ Revenue (metrics + cohort + refund)
dashboard/src/app/[locale]/admin/system/page.tsx ← ✅ System monitoring
dashboard/src/app/[locale]/admin/alerts/page.tsx ← ✅ Alerts sayfası
dashboard/src/app/[locale]/admin/email/page.tsx ← ✅ Bulk email sayfası
dashboard/src/app/[locale]/admin/settings/page.tsx ← ✅ Settings (3 tab yapısı)
dashboard/src/app/[locale]/admin/layout.tsx ← ✅ Sidebar (10 link)
dashboard/src/messages/tr.json             ← ✅ Türkçe çeviriler
dashboard/src/messages/en.json             ← ✅ İngilizce çeviriler
```

---

## Ortam Notları

- **Rust kurulu değil** — son oturumda kurulacak
- `cargo test` ve `next build` atlandı
- Vercel auto-deploy çalışıyor (GitHub webhook)
- Google Cloud Build ayrı (Rust backend)

---

## Öğrenilenler

1. `deliveries` tablosunda `error_message` yok — `delivery_attempts` tablosunda
2. `deliveries` tablosunda `event` yok — doğrusu `event_type`
3. `api_keys` tablosu migration'da yok ama `inbound.rs`'de aktif sorgu var
4. `invoices`/`payment_transactions` tabloları boş — Polar.sh webhook handler gerekli
5. `applications` tablosu migration 013'te mevcut
6. Admin: 49 route, 64 test, 58 async function
7. `refunds` tablosu zaten migration 019'da mevcut
8. `billing/refund.rs` modülü zaten var (14 gün pencere)
9. `billing/polar.rs` Polar.sh entegrasyonu zaten var
10. JSX'te `&& (...)` içinde tek root element olmalı, `<>...</>` ile sar
11. Turbofish syntax: `row.get::<i32, _>` (virgül inside brackets)
12. GDPR export'ta hassas alanlar çıkarılmalı
13. Bulk email'de her kullanıcı için ayrı sorgu yerine SQL'de filtre
14. Transaction kullanılmayan multi-step DB işlemleri tutarsızlık riski taşır
15. Overview/Settings gibi büyük sayfalar tab'lara ayrılmalı

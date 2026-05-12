# 🎯 HookSniff Admin Panel — Uygulama Planı

> **Tarih:** 2026-05-12 15:46 GMT+8
> **Kural:** Her adım sırayla yapılır, biri bitmeden diğerine geçilmez
> **Süre:** 3 oturum (her biri ~1 saat)

---

## AKIŞ DİYAGRAMI

```
OTURUM 1 (Şimdi)
│
├── 1.1  stats API düzelt          ← EN KRİTİK, her şey buna bağlı
├── 1.2  revenue API düzelt        ← İkinci kritik
├── 1.3  Eksik migration'ları yaz  ← audit_log, alert_rules, notifications, teams, team_members, notification_preferences, portal_configs
├── 1.4  Overview'ye audit özeti   ← Backend'de var, frontend'e ekle
├── 1.5  User Detail'ye replay     ← Backend'de var, buton ekle
├── 1.6  Users + Revenue'ya export ← Backend endpoint + buton
├── 1.7  Test et + push            ← cargo test + next build
└── 1.8  MEMORY.md güncelle

OTURUM 2
│
├── 2.1  Audit log sayfası         ← Yeni sayfa: /admin/activity
├── 2.2  Kullanıcı taklidi         ← Backend endpoint + buton
├── 2.3  Alert eşikleri (Settings) ← Mevcut alert_rules backend'ini kullan
├── 2.4  Test et + push
└── 2.5  MEMORY.md güncelle

OTURUM 3
│
├── 3.1  Müşteri grafikleri        ← User Detail'ye 3 grafik kartı
├── 3.2  Webhook Test Console      ← System sayfasına test kartı
├── 3.3  Churn analizi             ← Revenue'ya churn listesi
├── 3.4  Test et + push
└── 3.5  MEMORY.md güncelle
```

---

## OTURUM 1 — ADIM ADIM

### 1.1 stats API Düzelt
**Dosya:** `api/src/routes/admin.rs` → `system_stats()` fonksiyonu
**Sorun:** Neon DB'de SQL uyumsuzluğu
**Ne yap:**
- [ ] SQL sorgusunu kontrol et, Neon DB syntax'ına uygun hale getir
- [ ] `cargo test` ile doğrula
- [ ] Frontend'de Overview sayfasının veri gösterdiğini doğrula

### 1.2 revenue API Düzelt
**Dosya:** `api/src/routes/admin.rs` → `revenue_by_month()` fonksiyonu
**Sorun:** `generate_series` + subquery Neon DB'de çalışmıyor
**Ne yap:**
- [ ] SQL sorgusunu basitleştir (iki ayrı sorgu yap)
- [ ] `cargo test` ile doğrula
- [ ] Frontend'de Revenue sayfasının veri gösterdiğini doğrula

### 1.3 Eksik Migration'ları Yaz
**Dosya:** `api/migrations/008_admin_missing_tables.sql` (yeni)
**Ne yap:**
- [ ] `audit_log` tablosu CREATE TABLE
- [ ] `alert_rules` tablosu CREATE TABLE
- [ ] `notifications` tablosu CREATE TABLE
- [ ] `teams` tablosu CREATE TABLE
- [ ] `team_members` tablosu CREATE TABLE
- [ ] `notification_preferences` tablosu CREATE TABLE
- [ ] `portal_configs` tablosu CREATE TABLE
- [ ] Index'ler ve trigger'lar

### 1.4 Overview'ye Audit Özeti Ekle
**Dosya:** `dashboard/src/app/[locale]/admin/page.tsx`
**Ne yap:**
- [ ] `adminApi`'ye `getAuditLogs` fonksiyonu ekle (`/audit-log?limit=5`)
- [ ] Overview sayfasına "Son Aktiviteler" kartı ekle
- [ ] i18n key'leri ekle (EN + TR)
- [ ] `next build` ile doğrula

### 1.5 User Detail'ye Replay Ekle
**Dosya:** `dashboard/src/app/[locale]/admin/users/[id]/page.tsx`
**Ne yap:**
- [ ] Backend: `POST /v1/admin/deliveries/:id/replay` endpoint'i ekle (admin.rs)
- [ ] Frontend: Son Teslimatlar tablosuna "↩ Tekrar Gönder" butonu ekle
- [ ] i18n key'leri ekle (EN + TR)
- [ ] `next build` ile doğrula

### 1.6 Export Ekle
**Dosya:** `dashboard/src/app/[locale]/admin/users/page.tsx` + `revenue/page.tsx`
**Ne yap:**
- [ ] Backend: `GET /v1/admin/users/export` endpoint'i ekle (CSV format)
- [ ] Backend: `GET /v1/admin/revenue/export` endpoint'i ekle (CSV format)
- [ ] Frontend: Users sayfasına "⬇ CSV" butonu ekle
- [ ] Frontend: Revenue sayfasına "⬇ Rapor İndir" butonu ekle
- [ ] i18n key'leri ekle (EN + TR)
- [ ] `next build` ile doğrula

### 1.7 Test Et + Push
- [ ] `cargo test --lib` — tüm Rust testleri geçmeli
- [ ] `cargo clippy` — 0 uyarı
- [ ] `cd dashboard && npm run build` — Next.js build başarılı
- [ ] `git add . && git commit && git push`

### 1.8 MEMORY.md Güncelle
- [ ] Yapılan işleri `.ai-context/MEMORY.md`'ye ekle
- [ ] `.ai-context/NEXT_SESSION.md`'yi güncelle

---

## OTURUM 2 — ADIM ADIM

### 2.1 Audit Log Sayfası
**Dosya:** `dashboard/src/app/[locale]/admin/activity/page.tsx` (yeni)
**Ne yap:**
- [ ] Yeni sayfa oluştur
- [ ] Tablo: tarih, aksiyon, kaynak tip, detay, IP
- [ ] Filtre: aksiyon tipi, tarih aralığı
- [ ] Sayfalama
- [ ] Sidebar'a "📋 Aktivite" menüsü ekle (layout.tsx)
- [ ] i18n key'leri ekle (EN + TR)
- [ ] `next build` ile doğrula

### 2.2 Kullanıcı Taklidi
**Dosya:** `api/src/routes/admin.rs` + `dashboard/src/app/[locale]/admin/users/page.tsx`
**Ne yap:**
- [ ] Backend: `POST /v1/admin/users/:id/impersonate` endpoint'i ekle
- [ ] Backend: Kısa ömürlü token oluştur (15 dk)
- [ ] Frontend: Users tablosuna "👁️ Taklit" butonu ekle
- [ ] Frontend: User Detail sayfasına da buton ekle
- [ ] Audit log'a kaydet
- [ ] i18n key'leri ekle
- [ ] `next build` ile doğrula

### 2.3 Alert Eşikleri (Settings)
**Dosya:** `dashboard/src/app/[locale]/admin/settings/page.tsx`
**Ne yap:**
- [ ] Settings sayfasına "🚨 Alert Eşikleri" kartı ekle
- [ ] Mevcut `alert_rules` backend'ini kullan
- [ ] Eşikler: success_rate, latency, queue_depth
- [ ] Bildirim kanalları: email, slack, webhook
- [ ] i18n key'leri ekle
- [ ] `next build` ile doğrula

### 2.4 Test Et + Push
- [ ] `cargo test --lib`
- [ ] `cargo clippy`
- [ ] `cd dashboard && npm run build`
- [ ] `git add . && git commit && git push`

### 2.5 MEMORY.md Güncelle
- [ ] Yapılan işleri `.ai-context/MEMORY.md`'ye ekle
- [ ] `.ai-context/NEXT_SESSION.md`'yi güncelle

---

## OTURUM 3 — ADIM ADIM

### 3.1 Müşteri Grafikleri
**Dosya:** `dashboard/src/app/[locale]/admin/users/[id]/page.tsx`
**Ne yap:**
- [ ] Backend: `GET /v1/admin/users/:id/analytics` endpoint'i ekle
- [ ] Frontend: Günlük teslimat line chart (son 30 gün)
- [ ] Frontend: Event dağılımı pie chart
- [ ] Frontend: Endpoint sağlık bar chart
- [ ] i18n key'leri ekle
- [ ] `next build` ile doğrula

### 3.2 Webhook Test Console
**Dosya:** `dashboard/src/app/[locale]/admin/system/page.tsx`
**Ne yap:**
- [ ] Backend: `POST /v1/admin/test-webhook` endpoint'i ekle
- [ ] Frontend: System sayfasına "🧪 Webhook Test" kartı ekle
- [ ] Endpoint URL, event type, payload input'ları
- [ ] Sonuç gösterimi (status code, yanıt, süre)
- [ ] i18n key'leri ekle
- [ ] `next build` ile doğrula

### 3.3 Churn Analizi
**Dosya:** `dashboard/src/app/[locale]/admin/revenue/page.tsx`
**Ne yap:**
- [ ] Backend: `GET /v1/admin/churn` endpoint'i ekle
- [ ] Frontend: Revenue sayfasına churn listesi kartı ekle
- [ ] Tablo: kullanıcı, plan, tutar, churn tarihi
- [ ] i18n key'leri ekle
- [ ] `next build` ile doğrula

### 3.4 Test Et + Push
- [ ] `cargo test --lib`
- [ ] `cargo clippy`
- [ ] `cd dashboard && npm run build`
- [ ] `git add . && git commit && git push`

### 3.5 MEMORY.md Güncelle
- [ ] Yapılan işleri `.ai-context/MEMORY.md`'ye ekle
- [ ] `.ai-context/NEXT_SESSION.md`'yi güncelle
- [ ] `.ai-context/SESSION-PLAN.md`'yi güncelle

---

## KURALLAR

1. **Her adımı sırayla yap** — biri bitmeden diğerine geçme
2. **Her adımdan sonra test et** — `cargo test` + `next build`
3. **Sık commit yap** — her 2-3 adımda bir commit + push
4. **i18n unutma** — her yeni metin için EN + TR key ekle
5. **1 saat dolunca dur** — yarım kalırsa NEXT_SESSION.md'ye yaz

---

*Bu dosya her oturum sonunda güncellenmeli.*

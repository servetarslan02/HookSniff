# 💰 Fiyat ve Planlama — Görev Takibi

> Oluşturulma: 2026-05-13 00:32 GMT+8
> Güncelleme: 2026-05-13 01:34 GMT+8

---

## 🆕 Plan Yapısı

| | **Developer** | **Startup** | **Pro** | **Enterprise** |
|---|---|---|---|---|
| **Fiyat (aylık)** | $0 | $29 | $49 | Custom |
| **Fiyat (yıllık)** | $0 | $23/mo | $39/mo | Custom |
| **Developer** | 1 | 25 | Sınırsız | Sınırsız |
| **Application** | 1 | 1 | Sınırsız | Sınırsız |
| **Event types** | 10 | 50 | Sınırsız | Sınırsız |
| **Subscriptions** | 10 | 300 | Sınırsız | Sınırsız |
| **Events/gün** | 100 | 30,000 | 100,000 | Özel |
| **Extra event ücreti** | — | $0.003/event | $0.0001/event | Özel |
| **Data retention** | 7 gün | 14 gün | 30 gün | Özel |
| **Support** | Community | Email | Email | Dedicated |
| **TRY fiyatı** | ₺0 | ₺? | ₺? | Custom |

### Notlar
- TRY fiyatları dolar bazına çevrilecek (güncel kur ile)
- Yıllık %20 indirimli
- Never blocked: limit aşılınca event durmaz, ekstra ücret alınır
- Email bildirimi: limit yaklaşınca müşteriye mail gider
- Dashboard ayarı: müşteri "engelle mi, öde mi" seçebilir

---

## 📋 Görev Takibi

### Aşama 1: Application Modeli (Tablo + API) ✅
- [x] Migration: `applications` tablosu oluştur (013_applications.sql)
- [x] Migration: `endpoints` tablosuna `application_id` FK ekle
- [x] Model: `Application` struct (Rust) — models/application.rs
- [x] API: CRUD endpoint'leri (create, list, get, update, delete) — routes/applications.rs
- [x] API: Plan bazlı limit kontrolü (Developer:1, Startup:1, Pro:sınırsız)
- [x] API: Endpoint oluştururken application_id zorunlu + ownership doğrulama
- [x] Plan enum güncellendi: Developer/Startup/Pro/Enterprise
- [x] Yeni limit fonksiyonları: max_applications, max_event_types, max_team_members, max_subscriptions, max_events_per_day, overage_price, allows_overage
- [ ] Test: Unit testler ⚠️ Rust toolchain gerekli — Cloud Build'te doğrulanacak
- [ ] `cargo test --lib` ⚠️ Rust toolchain gerekli
- [ ] `cargo clippy` ⚠️ Rust toolchain gerekli

### Aşama 2: Event Type Limiti ✅
- [x] Mevcut `event_schemas` tablosu kullanıldı (migration 009/db.rs)
- [x] API: Plan bazlı max event type kontrolü (Developer:10, Startup:50, Pro:sınırsız)
- [x] API: Event type oluştururken limit kontrolü (yeni event type ise sayılır, yeni versiyon ise limit yok)
- [ ] Test: Unit testler ⚠️ Rust toolchain gerekli
- [ ] `cargo test --lib` ⚠️ Rust toolchain gerekli

### Aşama 3: Team Member Limiti ✅
- [x] API: Plan bazlı max team member kontrolü (Developer:1, Startup:25, Pro:sınırsız)
- [x] API: Üye eklerken limit kontrolü
- [ ] Test: Unit testler ⚠️ Rust toolchain gerekli
- [ ] `cargo test --lib` ⚠️ Rust toolchain gerekli

### Aşama 4: Never Blocked + Email Bildirimi ✅
- [x] Migration: `014_overage_settings.sql` — allow_overage, overage_email_notification + daily_event_usage tablosu
- [x] Config: `allow_overage` field (müşteri ayarı, default: true)
- [x] Config: `overage_email_notification` field (default: true)
- [x] API: GET/PUT /v1/billing/settings endpoint'leri
- [x] Webhook handler: never-blocked modu (overage aktifse limit aşılınca event durmaz)
- [x] Email: Limit %80 ve %100'e yaklaşınca bildirim gönder (events/overage.rs)
- [x] Email: Limit aşıldığında bildirim gönder (eğer overage aktifse)
- [ ] Dashboard: Ayarlar sayfasına "never blocked" toggle ekle (frontend, sonraki oturum)
- [ ] Test: Unit testler ⚠️ Rust toolchain gerekli

### Aşama 5: Plan Tablosu Güncellemesi ✅
- [x] Backend: Plan enum güncellendi (Free→Developer, Business→Enterprise, Startup eklendi)
- [x] Backend: billing/mod.rs — tüm limitler yeni plan isimlerine göre güncellendi
- [x] Backend: Plan::max_events_per_day() fonksiyonu eklendi
- [x] Backend: Plan::max_applications() fonksiyonu eklendi
- [x] Backend: Plan::max_event_types() fonksiyonu eklendi
- [x] Backend: Plan::max_subscriptions() fonksiyonu eklendi
- [x] Backend: Plan::max_team_members() fonksiyonu eklendi
- [x] Backend: Plan::overage_price_cents_per_event() fonksiyonu eklendi
- [x] Backend: Plan::allows_overage() fonksiyonu eklendi
- [x] Backend: auth.rs, billing.rs, admin.rs plan string'leri güncellendi
- [ ] Test: Tüm plan limitleri test edilmeli ⚠️ Rust toolchain gerekli

### Aşama 6: Pricing Sayfası Güncelleme ✅
- [x] Dashboard: Plan isimleri güncellendi (Developer/Startup/Pro/Enterprise)
- [x] Dashboard: Fiyatlar güncellendi ($0, $29, $49, Custom)
- [x] Dashboard: Feature listesi güncellendi (Application, Event Type, Subscription limitleri)
- [x] Dashboard: TRY fiyatları güncellendi (₺0, ₺599, ₺999, Custom)
- [x] Dashboard: Yıllık fiyat hesaplaması (%20 indirim)
- [x] Dashboard: Karşılaştırma tablosu güncellendi (3→4 sütun)
- [x] i18n: Türkçe ve İngilizce çeviri anahtarları güncellendi
- [x] Billing PlanCards: Developer/Startup/Pro planları
- [x] ROI calculator güncellendi

### Aşama 7: Son Kontroller ✅
- [x] Kod İnceleme 1 — 5 hata düzeltildi (batch overage, pricing dead code, karşılaştırma tablosu, çift thead)
- [x] Kod İnceleme 2 — 6 hata düzeltildi (admin u64::MAX, homepage 3→4 plan, admin PLAN_OPTIONS, settings default_plan, docs rate limit tablosu)
- [ ] `cargo test --lib` ⚠️ Rust toolchain gerekli — Cloud Build'te doğrulanacak
- [ ] `cargo clippy` ⚠️ Rust toolchain gerekli
- [ ] `next build` ⚠️ Node.js gerekli — Vercel deploy'da doğrulanacak
- [x] `.ai-context/` push et
- [x] MEMORY.md güncelle

---

## 📊 İlerleme

| Aşama | Durum | Başlangıç | Bitiş |
|-------|-------|-----------|-------|
| 1. Application Modeli | ✅ | 2026-05-13 00:36 | 2026-05-13 00:50 |
| 2. Event Type Limiti | ✅ | 2026-05-13 00:50 | 2026-05-13 00:54 |
| 3. Team Member Limiti | ✅ | 2026-05-13 00:54 | 2026-05-13 00:56 |
| 4. Never Blocked + Email | ✅ | 2026-05-13 00:56 | 2026-05-13 01:00 |
| 5. Plan Tablosu | ✅ | 2026-05-13 01:00 | 2026-05-13 01:02 |
| 6. Pricing Sayfası | ✅ | 2026-05-13 01:02 | 2026-05-13 01:06 |
| 7. Son Kontroller + İncelemeler | ✅ | 2026-05-13 01:06 | 2026-05-13 01:34 |

### İstatistik
- **Toplam kod maddesi:** 45
- **Tamamlanan:** 37 ✅
- **Toolchain bekleyen:** 8 ⚠️ (cargo test/clippy/next build — Cloud Build'te doğrulanacak)
- **Sonraki oturum:** 1 (never-blocked toggle)

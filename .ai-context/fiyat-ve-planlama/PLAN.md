# 💰 Fiyat ve Planlama — Görev Takibi

> Oluşturulma: 2026-05-13 00:32 GMT+8
> Güncelleme: 2026-05-13 00:32 GMT+8

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
- [ ] Test: Unit testler (cargo test — Rust toolchain gerekli)
- [ ] `cargo test --lib` — tüm testler geçmeli
- [ ] `cargo clippy` — 0 uyarı

### Aşama 2: Event Type Limiti ⬜
- [ ] Migration: `event_types` tablosu oluştur (veya mevcut `event_schemas` kullan)
- [ ] API: Plan bazlı max event type kontrolü (Developer:10, Startup:50, Pro:sınırsız)
- [ ] API: Event type oluştururken limit kontrolü
- [ ] Test: Unit testler
- [ ] `cargo test --lib` — tüm testler geçmeli

### Aşama 3: Team Member Limiti ⬜
- [ ] API: Plan bazlı max team member kontrolü (Developer:1, Startup:25, Pro:sınırsız)
- [ ] API: Üye eklerken limit kontrolü
- [ ] Test: Unit testler
- [ ] `cargo test --lib` — tüm testler geçmeli

### Aşama 4: Never Blocked + Email Bildirimi ⬜
- [ ] Config: `allow_overage` field (müşteri ayarı, default: true)
- [ ] Config: `overage_email_notification` field (default: true)
- [ ] API: Kullanıcı bu ayarı değiştirebilmeli (PUT /settings)
- [ ] Worker: Event limiti aşılınca engelleme, overage ücreti uygula
- [ ] Email: Limit %80 ve %100'e yaklaşınca bildirim gönder
- [ ] Email: Limit aşıldığında bildirim gönder (eğer overage aktifse)
- [ ] Dashboard: Ayarlar sayfasına "never blocked" toggle ekle
- [ ] Test: Unit testler

### Aşama 5: Plan Tablosu Güncellemesi ⬜
- [ ] Backend: Plan enum'ını güncelle (Free→Developer, Pro→Pro, Business→Enterprise)
- [ ] Backend: `billing/mod.rs` — tüm limitleri yeni plan isimlerine göre güncelle
- [ ] Backend: `Plan::max_webhooks_per_month()` → günlük event limiti
- [ ] Backend: `Plan::max_events_per_day()` yeni fonksiyon
- [ ] Backend: `Plan::max_applications()` yeni fonksiyon
- [ ] Backend: `Plan::max_event_types()` yeni fonksiyon
- [ ] Backend: `Plan::max_subscriptions()` yeni fonksiyon
- [ ] Backend: `Plan::overage_price_cents_per_event()` yeni fonksiyon
- [ ] Test: Tüm plan limitleri test edilmeli

### Aşama 6: Pricing Sayfası Güncelleme ⬜
- [ ] Dashboard: Plan isimlerini güncelle (Free→Developer, Pro→Pro, Business→Enterprise)
- [ ] Dashboard: Fiyatları güncelle ($0, $29, $49, Custom)
- [ ] Dashboard: Feature listesini güncelle (Application, Event Type, Subscription limitleri)
- [ ] Dashboard: TRY fiyatlarını dolar kurundan çevir
- [ ] Dashboard: Yıllık fiyat hesaplaması (%20 indirim)
- [ ] Dashboard: "Never blocked" bilgisi ekle
- [ ] Dashboard: ROI calculator güncelle
- [ ] Dashboard: Karşılaştırma tablosu güncelle
- [ ] i18n: Türkçe ve İngilizce çeviri anahtarları

### Aşama 7: Son Kontroller ⬜
- [ ] `cargo test --lib` — tüm testler geçmeli
- [ ] `cargo clippy` — 0 uyarı
- [ ] `next build` — hatasız build
- [ ] `.ai-context/` push et
- [ ] MEMORY.md güncelle

---

## 📊 İlerleme

| Aşama | Durum | Başlangıç | Bitiş |
|-------|-------|-----------|-------|
| 1. Application Modeli | ✅ | 2026-05-13 00:36 | 2026-05-13 00:50 |
| 2. Event Type Limiti | ⬜ | — | — |
| 3. Team Member Limiti | ⬜ | — | — |
| 4. Never Blocked + Email | ⬜ | — | — |
| 5. Plan Tablosu | ⬜ | — | — |
| 6. Pricing Sayfası | ⬜ | — | — |
| 7. Son Kontroller | ⬜ | — | — |

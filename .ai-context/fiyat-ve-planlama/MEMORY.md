# 🧠 Fiyat ve Planlama — Hafıza

> Son güncelleme: 2026-05-13 01:26 GMT+8

---

## Kararlar

### 2026-05-13 — Plan Yapısı Kararı
- **Eski:** Free / Pro ($49) / Business ($99) / Enterprise
- **Yeni:** Developer ($0) / Startup ($29) / Pro ($49) / Enterprise (Custom)
- **Kaynak:** Hook0 ile aynı feature set, daha uygun fiyat
- **TRY:** Dolar bazına çevrilecek, kaldırılmayacak
- **Yıllık:** %20 indirimli
- **Never blocked:** Limit aşılınca event durmaz, ekstra ücret ($0.003/event Startup, $0.0001/event Pro)
- **Email bildirimi:** Limit yaklaşınca müşteriye mail gider
- **Dashboard ayarı:** Müşteri "engelle mi, öde mi" seçebilir

### 2026-05-13 — Feature Kararı
- **Application modeli eklenecek** — müşteri → application → endpoint hiyerarşisi
- **Event type limiti eklenecek** — plan bazlı max
- **Team member limiti eklenecek** — plan bazlı max
- **Statik IP ertelendi** — şimdilik gerek yok
- **SOC 2 ertelendi** — pahalı, şimdilik gerek yok

### 2026-05-13 — Mevcut Feature Kontrolü
- Event Replay ✅ zaten var (webhooks.rs, admin.rs)
- Plan bazlı dashboard upsell ✅ zaten var (billing page, admin settings)

---

## Sorunlar / Notlar

- Rust toolchain bu ortamda yok — cargo test/clippy çalıştırılamıyor
- `transforms.rs` ve `webhooks.rs`'deki endpoint SELECT sorguları farklı kolon seti kullanıyor, compile'da sorun çıkabilir
- Dashboard plan isimleri ✅ Aşama 6'da güncellendi
- Email bildirimleri placeholder — Resend entegrasyonu sonraki oturumda yapılacak
- Startup planı için Polar.sh/Stripe product ID henüz eklenmedi

---

## Oturum Logları

### Oturum 1 (2026-05-13 00:00 - 00:32 GMT+8)
- Servet ile fiyat ve planlama konuşması
- Hook0 karşılaştırması yapıldı
- Yeni plan yapısı belirlendi: Developer / Startup / Pro / Enterprise
- Feature ekleme kararları alındı
- Görev takip dosyası oluşturuldu (PLAN.md)

### Oturum 2 (2026-05-13 00:36 - 01:06 GMT+8)
- OpenClaw oturumu — **TÜM 7 AŞAMA TAMAMLANDI**
- **Aşama 1:** Application Modeli — migration 013, CRUD API, plan bazlı limit
- **Aşama 2:** Event Type Limiti — schemas route'ta limit kontrolü
- **Aşama 3:** Team Member Limiti — teams route'ta limit kontrolü
- **Aşama 4:** Never Blocked — migration 014, overage settings API, webhook handler never-blocked modu
- **Aşama 5:** Plan Tablosu — Developer/Startup/Pro/Enterprise enum, tüm limit fonksiyonları
- **Aşama 6:** Pricing Sayfası — dashboard pricing/billing güncellendi, i18n EN+TR
- **Aşama 7:** Son Kontroller — GitHub push, PLAN.md güncellendi
- **Commits:** 7+ commit, main branch
- **Not:** Rust toolchain yok, cargo test/clippy çalıştırılamadı — Cloud Build'te doğrulanacak

### Oturum 3 (2026-05-13 01:10 - 01:26 GMT+8)
- **Kod incelemesi** — satır satır tüm değişiklikler kontrol edildi
- **5 hata bulundu ve düzeltildi:**
  1. Batch webhook handler'da overage mantığı eklenmemişti
  2. Pricing'de `plan.key !== 'free'` kalmış → `'developer'` yapıldı
  3. Pricing'de `plan.key === 'business'` dead code kaldırıldı
  4. Karşılaştırma tablosu 3 sütun → 4 sütun (Developer/Startup/Pro/Enterprise)
  5. Çift `<thead>` tag'ı kaldırıldı
- **Pricing kartları güncellendi** — yeni özellikler eklendi:
  - Developer: 10 özellik (HMAC, 2FA, exponential backoff, subscriptions)
  - Startup: 12 özellik (never-blocked, overage, CloudEvents, secret rotation, DLQ)
  - Pro: 12 özellik (FIFO, IP whitelist, analytics, schema registry)
  - Enterprise: 8 özellik (custom SLA, SSO, dedicated manager, on-call)
- **Billing PlanCards** aynı feature listeleriyle güncellendi
- **CTA buton metinleri** düzeltildi (dead code kaldırıldı)
- **i18n EN+TR** comprehensive feature listeleri güncellendi
- **Commits:** 2 commit (fix + feat), main branch

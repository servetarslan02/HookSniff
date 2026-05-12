# 🧠 Fiyat ve Planlama — Hafıza

> Son güncelleme: 2026-05-13 01:47 GMT+8

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

### Oturum 4 (2026-05-13 01:28 - 01:34 GMT+8)
- **İkinci kod incelemesi** — 44 dosya tekrar tarandı
- **Bulunan sorunlar:**
  1. ⚠️ Admin.rs enterprise limit `u32::MAX` → `u64::MAX` düzeltildi
  2. ⚠️ Homepage content.tsx hâlâ 3 plan (free/pro/business) → 4 plan yapıldı
  3. ⚠️ admin/users/page.tsx PLAN_OPTIONS eski → güncellendi
  4. ⚠️ admin/users/[id]/page.tsx PLAN_OPTIONS eski → güncellendi
  5. ⚠️ admin/settings/page.tsx default_plan 'free' → 'developer'
  6. ⚠️ docs/page.tsx rate limit tablosu 3 plan → 4 plan
- **Commits:** 2 commit, main branch
- **Sonraki oturum:** cargo test çalıştır, Cloud Build doğrula

### Oturum 5 (2026-05-13 01:43 - 01:50 GMT+8)
- **Eski plan ismi kalıntıları temizlendi** — 7 dosyada düzeltme:
  1. ⚠️ Pricing `customIntegrations` satırı hâlâ `free`/`business` → `developer`/`enterprise` yapıldı
  2. ⚠️ Pricing support section `t('free')`/`t('business')` → `t('developer')`/`t('enterprise')`
  3. ⚠️ i18n EN: `supportFreeFeatures` → `supportDeveloperFeatures`, `supportBusinessFeatures` → `supportEnterpriseFeatures`
  4. ⚠️ i18n TR: Aynı key rename
  5. ⚠️ `refund.rs`: `plan == "free"` → `plan == "developer"`
  6. ⚠️ `stripe.rs`: plan mapping `"business"` → `"enterprise"`, `"free"` → `"developer"` (3 yer)
  7. ⚠️ `admin.rs` churn SQL: `WHEN 'business'` → `WHEN 'enterprise'`
- **Düzeltildi — PLAN.md ve NEXT_SESSION.md tutarlılığı:**
  - PLAN.md Aşama 3: ⬜ → ✅ (MEMORY.md ile uyumlu)
  - Test/clippy items'a toolchain notu eklendi
  - İlerleme tablosu ve istatistikler eklendi
- **Commits:** 2 commit, main branch

### Oturum 6 (2026-05-13 01:50 - 01:55 GMT+8)
- **Tüm eski plan ismi kalıntıları temizlendi** — 15 dosya, 113 satır eklendi, 97 silindi
- **Backend düzeltmeleri:**
  - PlatformSettings struct: alan isimleri güncellendi (`max_endpoints_free`→`max_endpoints_developer`, `plan_price_business`→`plan_price_enterprise` vb.) — `serde(alias)` ile backward-compat
  - auth.rs, jwt.rs, customer.rs, db.rs, billing.rs: test verileri `free`→`developer`, `business`→`enterprise`
  - admin.rs churn SQL + settings field refs güncellendi
- **Frontend düzeltmeleri:**
  - admin/page.tsx: PLAN_COLORS 4 plan, chart bar'ları developer/startup/pro/enterprise
  - admin/revenue/page.tsx: planPrices state `enterprise` olarak güncellendi
  - admin/settings/page.tsx: TypeScript interface, defaults, form field isimleri güncellendi
  - admin/users/page.tsx: bulkPlan default `'developer'`
  - store.tsx: User plan type `'developer' | 'startup' | 'pro' | 'enterprise'`
  - playground/constants.ts: mock data `'developer'` → `'pro'`
  - docs/dlq/page.tsx: 4 plan tablosu (developer/startup/pro/enterprise)
  - pricing/content.tsx: customIntegrations + support section düzeltildi
- **i18n:**
  - `supportFreeFeatures`→`supportDeveloperFeatures`, `supportBusinessFeatures`→`supportEnterpriseFeatures` (EN+TR)
  - `developerPlan`, `startupPlan`, `enterprisePlan` key'leri eklendi (EN+TR)
  - Pricing section: `free`→`developer`, `business`→`enterprise` display names
- **Commits:** 2 commit, main branch

### Oturum 7 (2026-05-13 02:00 - 02:10 GMT+8)
- **Hook0 tarzı plan açıklamaları eklendi** — 4 dosya
- **Plan açıklamaları (Hook0 benzeri):**
  - Developer: "Perfect for trying out HookSniff..."
  - Startup: "Enhance your webhook experience..."
  - Pro: "Unleash your data connectivity..."
  - Enterprise: "Need more? Need something different?..."
- **Homepage plan kartları:** açıklama metni eklendi (plan adının altında)
- **Pricing sayfası plan kartları:** açıklama metni eklendi
- **proFeatures güncellendi:** webhooks/month → events/day formatı (12 özellik)
- **enterpriseFeatures güncellendi:** Hook0 tarzı, excluded items kaldırıldı (custom SLA, static IP, priority email support kaldırıldı)
- **Orphaned key'ler kaldırıldı:** freeFeatures, businessFeatures (landing.pricing)
- **Commits:** 1 commit, main branch

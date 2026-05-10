# 🐛 01 — Routing Hataları

> Durum: 🔴 KRİTİK — Sayfaların çoğu yanlış içerik gösteriyor
> Etkilenen sayfa: ~20+
> Tahmini düzeltme süresi: 2-3 saat

---

## Sorun Tanımı

Dashboard'daki routing mekanizması çökmüş durumda. Kullanıcı A sayfasına gitmek istiyor, B sayfasını görüyor. Bazı sayfalar farklı ziyaretlerde farklı içerik yüklüyor (tutarsız/non-deterministik).

---

## Yanlış İçerik Gösteren Sayfalar

### Public Sayfalar

| URL | Göstermesi Gereken | Gerçekten Gösterdiği | Severity |
|-----|-------------------|---------------------|----------|
| `/tr/pricing` | Fiyatlandırma | ShopFlow müşteri hikayesi | 🔴 Critical |
| `/tr/login` | Giriş formu | Svix karşılaştırması | 🔴 Critical |
| `/tr/get-started` | Başlangıç rehberi | Blog sayfası | 🔴 Critical |
| `/tr/about` | Hakkımızda | Hook0 karşılaştırması | 🔴 Critical |
| `/tr/faq` | SSS | Customers sayfası | 🔴 Critical |
| `/tr/security` | Güvenlik | Landing page | 🔴 Critical |
| `/tr/terms` | Kullanım şartları | Fiyatlandırma sayfası | 🔴 Critical |
| `/tr/startups` | Startup indirimi | Landing page | 🔴 Critical |
| `/tr/status` | Servis durumu | Login sayfası | 🔴 Critical |
| `/tr/playground` | API playground | Svix karşılaştırması | 🔴 Critical |
| `/tr/use-cases` | Kullanım senaryoları | Customers sayfası | 🔴 Critical |
| `/tr/build-vs-buy` | Build vs Buy | Blog sayfası | 🔴 Critical |

### Dokümantasyon Sayfaları

| URL | Göstermesi Gereken | Gerçekten Gösterdiği | Severity |
|-----|-------------------|---------------------|----------|
| `/tr/docs/quickstart` | Hızlı başlangıç | Blog sayfası | 🔴 Critical |
| `/tr/docs/concepts` | Temel kavramlar | Login sayfası | 🔴 Critical |
| `/tr/docs/api` | API referansı | 404 sayfası | 🔴 Critical |
| `/tr/docs/retries` | Retry mekanizması | Login sayfası | 🔴 Critical |
| `/tr/docs/idempotency` | İdempotency | ShopFlow müşteri hikayesi | 🔴 Critical |
| `/tr/docs/event-types` | Event türleri | Login'e yönlendirme | 🔴 Critical |
| `/tr/docs/integrations` | Entegrasyonlar | Svix karşılaştırması | 🔴 Critical |

### Alternatives Sayfaları

| URL | Göstermesi Gereken | Gerçekten Gösterdiği | Severity |
|-----|-------------------|---------------------|----------|
| `/tr/alternatives/hook0` | Hook0 karşılaştırması | İletişim sayfası | 🔴 Critical |

### Blog Sayfaları

| URL | Göstermesi Gereken | Gerçekten Gösterdiği | Severity |
|-----|-------------------|---------------------|----------|
| `/tr/blog/hooksniff-vs-svix` | Blog yazısı | SDK dokümantasyonu | 🔴 Critical |

### Customers Sayfaları

| URL | Göstermesi Gereken | Gerçekten Gösterdiği | Severity |
|-----|-------------------|---------------------|----------|
| `/tr/customers` → "Read story" | Müşteri hikayesi detay | `/tr/docs/dlq` sayfası | 🔴 Critical |

---

## Tutarsız/Nondeterministik Sayfalar

Bazı sayfalar farklı ziyaretlerde farklı içerik yüklüyor:

| URL | Durum | Not |
|-----|-------|-----|
| `/tr/blog` | Tutarsız | İlk ziyarette homepage, ikincisinde FAQ, üçüncüsünde doğru blog |
| `/tr/changelog` | Tutarsız | Bazen homepage'e, bazen docs security sayfasına yönlendiriyor |
| `/tr/docs` | Tutarsız | İlk ziyarette alternatives/svix gösteriyor |

---

## Muhtemel Nedenler

1. **Next.js dynamic routing çakışması** — `[locale]` parametresi ile sayfa rotaları çakışıyor olabilir
2. **Middleware yönlendirme hatası** — `middleware.ts` içindeki locale detection yanlış eşleşiyor olabilir
3. **i18n routing configuration** — `i18n/routing.ts` veya `navigation.ts` ayarları hatalı olabilir
4. **Vercel build cache** — Eski build cache'i yeni rotalarla çakışıyor olabilir
5. **SSG/ISR conflict** — Static generation ile dynamic route'lar çakışıyor olabilir

---

## Önerilen Düzeltme Adımları

1. `dashboard/src/middleware.ts` dosyasını incele — locale redirect mantığı doğru mu?
2. `dashboard/src/i18n/routing.ts` dosyasını incele — route tanımları doğru mu?
3. `dashboard/src/app/[locale]/` klasör yapısını kontrol et — çakışan route var mı?
4. Vercel'de build loglarını kontrol et — build sırasında hata var mı?
5. `next.config.js` içindeki redirect/rewrite kurallarını kontrol et
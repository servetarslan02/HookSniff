# 🐛 09 — Blog, Changelog, Customers Hataları

> Durum: 🟡 ORTA — Routing tutarsızlığı, eksik footer, çeviri
> Etkilenen sayfa: ~15
> Tahmini düzeltme süresi: 1-2 saat

---

## Blog Sayfaları

### `/tr/blog` — Blog Listing

| # | Sorun | Severity | Açıklama |
|---|-------|----------|----------|
| 1 | Routing tutarsızlığı | 🔴 Critical | İlk ziyarette homepage, ikincisinde FAQ, üçüncüsünde doğru blog yüklüyor. Sayfa içeriği nondeterministik. |
| 2 | Dark mode toggle yok | 🟡 Medium | Nav'da sadece dil değiştirici var |
| 3 | Footer yok | 🟡 Medium | Sayfa blog kartları ile bitiyor, footer section yok |
| 4 | Aktif nav highlight yok | 🟡 Medium | Blog link'i vurgulanmamış |
| 5 | Tüm içerik İngilizce | 🟡 Medium | Türkçe locale'de İngilizce blog başlıkları ve içerikleri |

**Doğru yüklendiğinde:** Temiz layout — newsletter kutusu, arama çubuğu, kategori filtreleri, featured post kartı.

### `/tr/blog/hooksniff-vs-svix` — Blog Post (YANLIŞ İÇERİK)

| # | Sorun | Severity | Açıklama |
|---|-------|----------|----------|
| 1 | Yanlış sayfa | 🔴 Critical | Blog yazısı yerine SDK Dokümantasyon sayfası (Python SDK, Node.js SDK) gösteriyor |
| 2 | Farklı layout | 🟡 Medium | Blog post layout'u yerine docs layout (sidebar) kullanılıyor |

### `/tr/blog/hooksniff-vs-svix-vs-hookdeck` — Blog Post Detail

| # | Sorun | Severity | Açıklama |
|---|-------|----------|----------|
| 1 | Dark mode toggle yok | 🟡 Medium |
| 2 | Footer yok | 🟡 Medium |
| 3 | İçerik İngilizce | 🟡 Medium |
| 4 | Tablo responsive değil | 🟡 Medium | Karşılaştırma tabloları mobilde taşabilir |

**Doğru yüklendiğinde:** İyi yapılandırılmış — heading hierarchy, code blocks with copy, comparison tables, CTA section.

---

## Changelog Sayfaları

### `/tr/changelog` — Changelog Listing

| # | Sorun | Severity | Açıklama |
|---|-------|----------|----------|
| 1 | Routing tutarsızlığı | 🔴 Critical | Bir ziyarette homepage'e, başka bir ziyarette docs security sayfasına yönlendiriyor |
| 2 | Footer yok | 🟡 Medium |
| 3 | Dark mode toggle yok | 🟡 Medium |
| 4 | RSS link hatası | 🟡 Medium | RSS linki `/blog/rss`'e gidiyor (doğrusu `/changelog/rss`) |

**Doğru yüklendiğinde:** İyi — versiyon navigasyon sidebar'ı, filtre butonları (type ve area), newsletter subscription, renk kodlu badge'ler (Feature, Fix, Improvement, Security).

---

## Customers Sayfaları

### `/tr/customers` — Customer Stories

| # | Sorun | Severity | Açıklama |
|---|-------|----------|----------|
| 1 | Link kırık | 🔴 Critical | "Read story →" linkleri `/tr/docs/dlq`'ya gidiyor (doğrusu `/tr/customers/[slug]`) |
| 2 | Tüm içerik İngilizce | 🟡 Medium |
| 3 | Footer yok | 🟡 Medium |
| 4 | Dark mode toggle yok | 🟡 Medium |
| 5 | Infrastructure logoları metin | 🟡 Medium | GC, NP, UR, C, V, P, R, N kısaltmaları yerine gerçek logo olmalı |

**Doğru yüklendiğinde:** İyi layout — istatistik barı, infrastructure badge'leri, featured stories, filtreli kart grid, CTA.

### `/tr/customers/ecommerce-platform` — Customer Story Detail

| # | Sorun | Severity | Açıklama |
|---|-------|----------|----------|
| 1 | Footer yok | 🟡 Medium |
| 2 | Dark mode toggle yok | 🟡 Medium |
| 3 | İçerik İngilizce | 🟡 Medium |
| 4 | Direkt URL çalışıyor ama linkler kırık | 🟡 Medium | Listing'den tıklayınca yanlış yere gidiyor |

**Doğru yüklendiğinde:** İyi — şirket header, challenge/solution/results sections, stats cards, CTA.

---

## Global Sorun (Tüm Content Sayfaları)

### Footer Eksikliği
Hiçbir content sayfasında footer yok:
- ❌ Blog (listing + detail)
- ❌ Changelog
- ❌ Customers (listing + detail)
- ❌ Alternatives (8 sayfa)
- ❌ Providers (4 sayfa)

Sadece landing page'de footer var.

### İki Farklı Nav Yapısı
Content sayfaları minimal breadcrumb nav kullanıyor. Landing page full nav bar. Kullanıcı content sayfasındaysa ana bölümlere geçiş yapamıyor.

### Dark Mode Toggle Eksik
Content sayfalarında dark mode toggle yok. Sadece landing page'de var.

---

## Önerilen Düzeltme Adımları

1. **Routing fix** — Blog ve changelog sayfalarının doğru içerik göstermesini sağla
2. **Footer ekle** — Layout component'inde her sayfada footer render et
3. **Customer link fix** — "Read story →" linklerini `/tr/customers/[slug]`'e düzelt
4. **RSS link fix** — Changelog RSS linkini `/changelog/rss` olarak düzelt
5. **Dark mode toggle** — Nav component'ine toggle ekle
6. **Infrastructure logosu** — Metin kısaltmaları yerine SVG logolar kullan
# 🐛 04 — Navigasyon ve Footer Hataları

> Durum: 🔴 YÜKSEK — Tutarlısız nav yapısı, eksik footer
> Etkilenen sayfa: ~60+
> Tahmini düzeltme süresi: 2-3 saat

---

## 1. İki Farklı Navigasyon Yapısı

### Landing Page Nav
- Tam nav bar: Logo, linkler (Özellikler, Fiyatlandırma, Başlayın, Dokümanlar, Durum)
- Dark mode toggle butonu
- "Panel →" butonu
- Dil değiştirici

### İçerik Sayfaları Nav (Blog, Changelog, Customers, Alternatives)
- Sadece breadcrumb (örn: "HookSniff / Blog")
- Dil değiştirici
- ❌ Link yok
- ❌ Dark mode toggle yok
- ❌ "Panel" butonu yok

### Doc Sayfaları Nav
- Sol sidebar navigasyonu
- Breadcrumb
- Dil değiştirici
- ❌ Dark mode toggle yok

**Sorun:** Kullanıcı bir içerik sayfasındaysa ana bölümlere geçiş yapamıyor. Sadece breadcrumb'daki "HookSniff" linkine tıklayıp landing page'e dönmesi gerekiyor.

---

## 2. Footer Eksik (Tüm İçerik Sayfaları)

### Footer Olan Sayfalar
- ✅ Landing page (`/tr`) — 4 sütunlu footer (Product, Compare, Resources, Company)

### Footer OLMAYAN Sayfalar
- ❌ `/tr/blog`
- ❌ `/tr/blog/[slug]`
- ❌ `/tr/changelog`
- ❌ `/tr/customers`
- ❌ `/tr/customers/[slug]`
- ❌ `/tr/alternatives/*` (8 sayfa)
- ❌ `/tr/providers/*` (4 sayfa)
- ❌ `/tr/docs/*` (15 sayfa — kendi footer'ı var ama farklı)

**Etki:** Kullanıcı sayfanın sonunda hiçbir link görmez. Copyright, sosyal medya, iletişim bilgileri yok.

---

## 3. Footer Tutarsızlığı

### Landing Page Footer
```
Product          Compare           Resources        Company
─────────────    ─────────────     ─────────────    ─────────────
Özellikler       Svix              Blog             Hakkımızda
Fiyatlandırma    Hookdeck          Docs             İletişim
Başlayın         Hook0             Status           Kariyer
Dokümanlar       Convoy            SDKs             Gizlilik
Durum            Webhook Relay     FAQ              Şartlar
```

### Doc Sayfaları Footer (Farklı Yapı)
- Farklı footer yapısı
- Daha basit, tek sütun
- Link yapısı farklı

**Sorun:** İki farklı footer var. Tutarlı değil.

---

## 4. Aktif Sayfa Highlight Eksik

Hiçbir navigation item'ı mevcut sayfayı vurgulamıyor. Kullanıcı hangi sayfada olduğunu sadece breadcrumb'dan anlayabilir.

---

## 5. Footer Touch Targets (Mobil)

Footer linkleri 20px yüksekliğinde. WCAG minimum touch target: 44px. Mobilde tıklamak zor.

---

## 6. Breadcrumb Sorunları

### "Alternatives" Breadcrumb Linki Kendini İşaret Ediyor
`/tr/alternatives/svix` sayfasındaki breadcrumb:
```
HookSniff / Alternatives / Svix
```
"Alternatives" linki `/tr/alternatives/svix`'e gidiyor (kendisi). Olması gereken: `/tr/alternatives` (ana sayfa).

### Karışık Dil
Breadcrumb'da "Alternatives" İngilizce, "HookSniff" marka adı. Türkçe locale'de "Alternatifler" olmalı.

---

## 7. Language Switcher Sorunları

- Her zaman "TR Türkçe" gösteriyor
- İçerik tamamen İngilizce olsa bile Türkçe seçili görünüyor
- Dil değiştirince içerik değişmeyebilir (sayfalar zaten İngilizce)

---

## Önerilen Düzeltme Adımları

1. **Tek nav yapısı oluştur** — Tüm sayfalarda aynı nav bar olmalı
2. **Footer'ı tüm sayfalara ekle** — Layout component'inde footer her zaman render edilmeli
3. **Aktif sayfa highlight** — Nav linklerinde `aria-current="page"` ve CSS vurgusu
4. **Touch target büyüt** — Footer linkleri minimum 44px yüksekliğinde olmalı
5. **Breadcrumb fix** — "Alternatives" linki parent sayfaya işaret etmeli
6. **Dil tutarlılığı** — Türkçe locale'de breadcrumb da Türkçe olmalı
# HookSniff — Görsel QA Raporu (Footer & Navigasyon)

**Tarih:** 2026-05-12  
**Kontrol:** 16 sayfanın tamamı tarandı, screenshot ile doğrulandı

---

## 🚨 SORUN 1: 14/16 Sayfada Footer Yok

Sadece `/tr` (ana sayfa) ve `/tr/docs` sayfalarında footer var. Diğer 14 sayfada sayfa aniden bitiyor — boş beyaz alan, footer yok.

**Etkilenen sayfalar:**
- `/tr/pricing` — CTA'dan sonra boşluk, footer yok
- `/tr/about` — "Start Free" butonundan sonra sayfa bitiyor
- `/tr/contact` — Form'dan sonra sayfa bitiyor
- `/tr/status` — "Version 0.1.0" tek satır, gerçek footer değil
- `/tr/faq` — "Destek ile İletişim" linkinden sonra bitiyor
- `/tr/terms` — 16. bölümden sonra bitiyor
- `/tr/privacy` — 13. bölümden sonra bitiyor
- `/tr/get-started` — "Playground'ı Dene" butonundan sonra bitiyor
- `/tr/what-is-a-webhook` — "Get started →" linkinden sonra bitiyor
- `/tr/startups` — "Apply now →" linkinden sonra bitiyor
- `/tr/security` — "Kaynak kodu görüntüle" linkinden sonra bitiyor
- `/tr/providers/stripe` — "Start for free →" linkinden sonra bitiyor
- `/tr/providers/github` — "Start for free →" linkinden sonra bitiyor
- `/tr/providers/shopify` — "Start for free →" linkinden sonra bitiyor

**Sonuç:** Kullanıcı herhangi bir alt sayfaya gelirse site terk etme olasılığı yüksek. Footer'da iletişim, şartlar, gizlilik linkleri yok → güven düşürücü.

---

## 🚨 SORUN 2: Navbar 3 Farklı Varyanta Bölünmüş

### Varyant A — Tam Navbar (sadece ana sayfa)
```
🪝 HookSniff | Özellikler | Fiyatlandırma | Başlayın | Dokümanlar | Durum | [Dil] | [🌙] | [Panel →]
```
✅ Tüm navigasyon öğeleri mevcut

### Varyant B — Docs Navbar (sadece docs)
```
🪝 HookSniff docs.docs | [Dil] | Kontrol Paneli | Ana Sayfa
```
⚠️ "docs.docs" yazısı stil kırığı — muhtemelen className sızıntısı
⚠️ "Kontrol Paneli" → ana sayfadaki "Panel →" ile tutarsız
❌ Özellikler, Fiyatlandırma, Başlayın, Durum linkleri yok
❌ Dark mode toggle yok

### Varyant C — Minimal Navbar (14 diğer sayfa)
```
🪝 HookSniff / [Sayfa Adı] | [Dil]
```
❌ Hiçbir navigasyon linki yok
❌ Dark mode toggle yok
❌ "Panel →" linki yok
❌ Kullanıcı ana sayfaya geri dönmek için browser back'e mahkum

---

## 🚨 SORUN 3: Logo Link Hedefi Tutarsız

| Sayfa | Logo → | Durum |
|-------|--------|-------|
| `/tr` | `/tr` | ✅ |
| `/tr/docs` | `/tr` | ✅ |
| `/tr/status` | `/tr` | ✅ |
| `/tr/faq` | `/tr` | ✅ |
| `/tr/get-started` | `/tr` | ✅ |
| `/tr/what-is-a-webhook` | `/tr` | ✅ |
| `/tr/startups` | `/tr` | ✅ |
| `/tr/security` | `/tr` | ✅ |
| `/tr/providers/*` | `/tr` | ✅ |
| `/tr/pricing` | `/` | ❌ Locale kaybolur |
| `/tr/about` | `/` | ❌ Locale kaybolur |
| `/tr/contact` | `/` | ❌ Locale kaybolur |
| `/tr/terms` | `/` | ❌ Locale kaybolur |
| `/tr/privacy` | `/` | ❌ Locale kaybolur |

**Etki:** Kullanıcı `/tr/terms` sayfasından logoya tıklarsa İngilizce ana sayfaya (`/`) gider, Türkçe locale kaybolur.

---

## 🚨 SORUN 4: Kırık Linkler (Locale Eksik)

### `/tr/terms` — Sayfa sonu
- Link metni: "contact form"
- Gittiği yer: `/contact`
- Olması gereken: `/tr/contact`
- **Etki:** Türkçe sayfadan İngilizce sayfaya yönlendirme

### `/tr/security` — Responsible Disclosure
- Link metni: "contact form"  
- Gittiği yer: `/contact`
- Olması gereken: `/tr/contact`
- **Etki:** Aynı sorun

### `/tr/docs` — İçerik kartları
- Kart linkleri: `/docs/quickstart`, `/docs/concepts`, `/docs/security` vb.
- Olması gereken: `/tr/docs/quickstart`, `/tr/docs/concepts`, `/tr/docs/security`
- **Etki:** 8 kart linkinin hepsinde locale kayboluyor

---

## 🚨 SORUN 5: Dark Mode Toggle Yalnızca Ana Sayfada

Sadece `/tr` (ana sayfada) dark mode switch'i var. Diğer 15 sayfada yok.

**Etki:** Kullanıcı dark mode açıp başka sayfaya giderse toggle kaybolur. Tutarlı UX yok.

---

## 🟡 SORUN 6: Status Sayfası Farklı Layout Kullanıyor

`/tr/status` sayfası özel bir layout kullanıyor:
- Navbar'da "🔔 Subscribe to updates" butonu var (diğer sayfalarda yok)
- Footer yerine "Version 0.1.0 • hooksniff.vercel.app • Dokümanlar" satırı
- "Powered by HookSniff monitoring" yazısı
- Uptime grafiği sol/sağ kenarlara yapışık, padding yok

**Beklenen:** Standart layout ile tutarlı footer

---

## 🟡 SORUN 7: Pricing Sayfasında Navbar'da Geri Dönüş Yok

`/tr/pricing` sayfasında:
- Navbar sadece: `🪝 HookSniff / Fiyatlandırma | [Dil]`
- Hiçbir navigasyon linki yok
- Kullanıcı başka bir sayfaya gitmek için URL'i manuel yazmak zorunda

**Diğer sayfaların çoğunda da aynı sorun var.**

---

## 🟡 SORUN 8: About Sayfası Bottom-Heavy

`/tr/about` sayfası sonunda:
- "Ready to get started?" CTA'sı var
- "Start Free" ve "Contact Us" butonları var
- Ama footer yok → CTA'dan sonra boşluk
- Butonlar arasındaki renk farkı dikkat çekici (mor vs outline)

---

## 🟡 SORUN 9: Provider Sayfaları Kısa, Footer Eksikliği Belirgin

`/tr/providers/stripe`, `/tr/providers/github`, `/tr/providers/shopify` sayfaları:
- Kısa içerik (1 ekran dolusu)
- Quick Start + tablo + kod örneği + CTA
- Footer olmadığı için sayfa aniden bitiyor
- "Start for free →" butonundan sonra beyaz boşluk

---

## 🟡 SORUN 10: Get-Started Sayfasında Scroll Sonu Boş

`/tr/get-started` sayfası uzun (6 adım + event types + embed + CLI)
- En altta "Ücretsiz Hesap Oluştur" + "Playground'ı Dene" CTA'sı var
- Footer yok
- CTA'dan sonra boşluk

---

## ✅ ÇALIŞAN ŞEYLER

1. ✅ **Dil değiştirici** — Tüm sayfalarda mevcut ve çalışıyor
2. ✅ **Locale korunması** — Navbar linklerinde `/tr/` prefix'i tutarlı (docs harici)
3. ✅ **Responsive** — Tüm sayfalar mobilde düzgün render ediliyor (snapshot'larda kontrol edildi)
4. ✅ **Tutarlı renk paleti** — Tüm sayfalarda mor/gradient tema tutarlı
5. ✅ **CTA butonları** — Tüm sayfalarda çalışıyor, doğru sayfalara yönlendiriyor
6. ✅ **Fiyatlandırma kartları** — 3 plan tutarlı, bilgiler doğru
7. ✅ **İçerik yapısı** — Başlık → Açıklama → CTA pattern'i tutarlı

---

## 📋 DÜZELTME ÖNERİLERİ (Öncelik Sırasıyla)

### P0 — Kritik (Hemen yapılmalı)
1. **Ortak layout bileşeni oluştur** — Navbar + Footer her sayfada otomatik görünsün
2. **Footer'ı tüm sayfalara ekle** — Tekrar kullanılabilir `<Footer />` bileşeni
3. **Kırık linkleri düzelt** — `/contact` → `/tr/contact` (terms, security)
4. **Docs iç linklerini düzelt** — `/docs/*` → `/tr/docs/*`

### P1 — Yüksek
5. **Dark mode toggle'ı layout'a taşı** — Her sayfada görünsün
6. **"Panel →" linkini navbar'a ekle** — Tüm sayfalarda tutarlı
7. **Logo link hedefini düzelt** — 5 sayfada `/` → `/tr`

### P2 — Orta
8. **"docs.docs" yazısını düzelt** — ClassName sızıntısı
9. **Status sayfasını standart layout'a geçir**
10. **Navbar navigasyon linklerini tüm sayfalara ekle**

### P3 — Düşük
11. **Footer'a sosyal medya ikonları ekle**
12. **Provider sayfalarına breadcrumb navigasyon ekle**

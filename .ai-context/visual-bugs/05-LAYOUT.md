# 🐛 05 — Layout, Spacing ve Overflow Hataları

> Durum: 🟡 ORTA — Taşmalar, boş alanlar, hizalama sorunları
> Etkilenen sayfa: ~10
> Tahmini düzeltme süresi: 1-2 saat

---

## 1. Code Block Horizontal Overflow (Mobil)

**Sayfa:** Landing page (`/tr`)
**Sorun:** `<pre>` kod bloğu içeriği 694px genişliğinde, container 317px. 377px taşıyor.
**Etki:** Mobilde kullanıcı kod bloğunu okumak için yatay kaydırma yapmak zorunda.

**Çözüm:**
```css
pre {
  overflow-x: auto;
  max-width: 100%;
}
```

---

## 2. Comparison Table Overflow (Mobil)

**Sayfalar:** `/tr/alternatives/*`, `/tr/compare`
**Sorun:** Karşılaştırma tabloları mobil viewport'a sığmıyor.
- Alternatives sayfaları: 11px taşma
- Blog/alternatives: 56px taşma

**Çözüm:**
```css
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

---

## 3. Boş Beyaz Alan (Alternatives Sayfaları)

**Sayfalar:** `/tr/alternatives/svix`, `/tr/alternatives/hookdeck`
**Sorun:** İçerik bitince 300px+ boş beyaz alan kalıyor. Sayfa sonu boş görünüyor.
**Neden:** İçerik kısa ama page height sabit.

**Çözüm:** Footer eklenerek boş alan doldurulabilir.

---

## 4. Hero Text Truncation

**Sayfa:** Landing page (`/tr`)
**Sorun:** Hero başlığında sondaki `|` karakteri görünüyor:
- "teslimat sistemi|"
- "webhoo|"

**Neden:** Typewriter efektinde cursor karakteri render ediliyor olabilir.

**Çözüm:** Cursor karakterini CSS ile gizle veya sadece animation sırasında göster.

---

## 5. İki Farklı Footer Stili

**Sorun:** Landing page'de 4 sütunlu footer, doc sayfalarında farklı footer yapısı var.

| Footer | Göründüğü Yer | Yapı |
|--------|---------------|------|
| Full (4 sütun) | Landing page | Product, Compare, Resources, Company |
| Simple | Doc sayfaları | Tek sütun, basit linkler |
| Yok | Blog, Changelog, Customers, Alternatives | Hiç footer yok |

---

## 6. Infrastructure Logoları Metin

**Sayfa:** `/tr/customers`
**Sorun:** "Built on trusted infrastructure" bölümünde logolar yerine metin kısaltmaları:
- GC (Google Cloud)
- NP (Neon PostgreSQL)
- UR (Upstash Redis)
- C (Cloudflare)
- V (Vercel)
- P (Polar.sh)
- R (Resend)
- N (Neon)

**Çözüm:** Gerçek marka logoları kullanılmalı.

---

## 7. SDK Docs Karışık Başlık Stili

**Sayfa:** `/tr/docs/sdks`
**Sorun:** Python bölümü Türkçe başlıklar ("Kurulum", "Hızlı Başlangıç"), Node.js bölümü İngilizce başlıklar ("Installation", "Quick Start"). Tutarlılık yok.

---

## 8. Sızan Import

**Sayfa:** `/tr/docs/sdks`
**Sorun:** Node.js signature verification örneğinde:
```typescript
import { useTranslations } from 'next-intl';
```
Bu Next.js framework kodu, SDK dokümantasyonunda olmamalı.

---

## Önerilen Düzeltme Adımları

1. **`overflow-x: auto`** — Tüm `pre` ve tablo container'larına ekle
2. **Footer ekle** — Layout component'inde her sayfada render et
3. **Cursor fix** — Typewriter efektinde `|` karakterini gizle
4. **Logo ekle** — Infrastructure bölümüne gerçek marka logoları
5. **Başık tutarlılığı** — SDK docs'ta tüm bölümler aynı dilde başlık kullanmalı
6. **Sızan import** — `useTranslations` import'unu SDK docs'tan kaldır
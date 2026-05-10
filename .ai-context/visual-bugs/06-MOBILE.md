# 🐛 06 — Mobil Responsive Hataları

> Durum: 🟡 ORTA — Taşmalar, küçük touch targets, layout sorunları
> Ekran boyutu test: 375px × 812px (iPhone boyutu)
> Etkilenen sayfa: ~15
> Tahmini düzeltme süresi: 1-2 saat

---

## 1. Code Block Overflow (KRİTİK)

**Sayfa:** Landing page (`/tr`)
**Sorun:** curl komutu içeren kod bloğu 694px genişliğinde, container 317px. 377px taşıyor.
**Etki:** Kullanıcı yatay kaydırma yapmak zorunda, kod okunamıyor.

**Çözüm:**
```css
pre, code {
  overflow-x: auto;
  word-break: break-word;
  white-space: pre-wrap;
}
```

---

## 2. Footer Touch Targets Çok Küçük

**Sayfa:** Landing page footer
**Sorun:** Footer linkleri 20px yüksekliğinde. WCAG minimum: 44px.
**Etki:** Mobilde tıklamak zor, yanlış linke basma riski.

**Çözüm:**
```css
footer a {
  min-height: 44px;
  display: flex;
  align-items: center;
}
```

---

## 3. Horizontal Scroll (Comparison Sayfaları)

**Sayfalar:** Blog, Alternatives
**Sorun:** Sayfa içeriği viewport'tan geniş:
- Blog: 423px içerik, 367px viewport → 56px taşma
- Alternatives: 378px içerik, 367px viewport → 11px taşma

**Etki:** Kullanıcı yatay kaydırma yapmak zorunda.

---

## 4. Comparison Table Overflow

**Sayfalar:** `/tr/alternatives/*`, `/tr/compare`
**Sorun:** Karşılaştırma tabloları mobilde sığmıyor, yatay taşıyor.

**Çözüm:** Tablo container'ına `overflow-x: auto` ekle.

---

## 5. Otomatik Sayfa Yönlendirme (KRİTİK)

**Sayfalar:** Çeşitli
**Sorun:** Sayfalar kullanıcı müdahalesi olmadan otomatik olarak başka sayfalara yönlendiriyor. Bu mobilde daha belirgin.
**Etki:** Site kullanılamaz hale geliyor, sayfalar arasında kaybolma.

---

## 6. Nav Toggle Button Küçük

**Sayfa:** Landing page (mobil)
**Sorun:** Hamburger menü butonu 40×40px. WCAG minimum: 44×44px.

---

## 7. Dashboard Erişilemedi

**Sayfalar:** `/tr/dashboard/*` (32 sayfa)
**Sorun:** Login gerektirdiği için mobil dashboard layout'u test edilemedi.
**Not:** İkinci bir geçiş gerekli (geçerli kimlik bilgileri ile).

---

## 8. About Sayfası Yönlendirme

**Sayfa:** `/tr/about` (mobil)
**Sorun:** `/tr/contact`'a yönlendiriyor. About sayfası yok.

---

## 9. Mixed Language (Contact)

**Sayfa:** `/tr/contact` (mobil)
**Sorun:** Buton "Mesaj Gönder" (Türkçe) ama sayfa içeriği İngilizce.

---

## İyi Çalışan Mobil Özellikler ✅

| Özellik | Durum |
|---------|-------|
| Pricing kartları stack | ✅ Doğru |
| Login form hizalama | ✅ Doğru |
| ROI Calculator slider | ✅ Çalışıyor |
| FAQ accordion | ✅ Touch-friendly |
| Page width matches viewport | ✅ Çoğu sayfada |
| Contact form | ✅ Doğru layout |

---

## Önerilen Düzeltme Adımları

1. **`overflow-x: auto`** — Tüm `pre`, tablo ve code block'larına ekle
2. **Touch target büyüt** — Footer linkleri ve nav butonları minimum 44px
3. **Horizontal scroll kaldır** — Container max-width: 100vw
4. **Dashboard mobil test** — Geçerli kimlik bilgileri ile ikinci geçiş
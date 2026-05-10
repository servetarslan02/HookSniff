# 🐛 HookSniff — Görsel Hata Raporları Genel Özet

> Oluşturulma: 2026-05-10
> Denetim: 5 paralel agent ile ~100 sayfa incelendi
> Dashboard: https://hooksniff.vercel.app
> Locale: /tr (Türkçe)

---

## İstatistikler

| Severity | Adet | Açıklama |
|----------|------|----------|
| 🔴 Critical | ~25 | Yanlış içerik, routing çökmesi, 404 |
| 🔴 High | ~30 | Çeviri eksikliği, taşan elementler, kırık linkler |
| 🟡 Medium | ~40 | Footer eksik, dark mode eksik, tutarsızlıklar |
| 🟢 Low | ~10 | Küçük iyileştirmeler |
| **TOPLAM** | **~105** | |

---

## Sayfa Durumu Özeti

### Doğru İçerik Gösteren Sayfalar (Azınlık — ~10)
- `/tr/contact` ✅
- `/tr/what-is-a-webhook` ✅
- `/tr/compare` ✅
- `/tr/blog` ✅ (tutarsız — bazen yanlış yüklüyor)
- `/tr/newsletter` ✅
- `/tr/privacy` ✅
- `/tr/faq` ✅
- `/tr/changelog` ✅ (tutarsız)

### Yanlış İçerik Gösteren Sayfalar (~20+)
Bakınız: `01-ROUTING.md`

### İçeriğe Erişilemeyen Sayfalar (Login Gerekli — ~32)
Dashboard sayfalarının tümü login'e yönlendiriyor. Admin sayfaları "Access Denied" gösteriyor.

---

## Dosya İndeksi

| Dosya | Konu | Hata Sayısı |
|-------|------|-------------|
| `01-ROUTING.md` | Routing hataları | ~25 |
| `02-DOCS.md` | Dokümantasyon | ~20 |
| `03-TRANSLATION.md` | Çeviri/i18n | ~30 |
| `04-NAVIGATION.md` | Nav + Footer | ~12 |
| `05-LAYOUT.md` | Layout/Overflow | ~10 |
| `06-MOBILE.md` | Mobil responsive | ~10 |
| `07-DARK_MODE.md` | Dark mode | ~5 |
| `08-LOGIN.md` | Login/Register | ~8 |
| `09-CONTENT.md` | Blog/Changelog/Customers | ~10 |
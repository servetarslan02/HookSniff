# 📁 Gelişmiş Yükleme Sistemleri — Klasör Rehberi

> Bu klasör, HookSniff dashboard'unun performans optimizasyonu projesinin kalıcı hafızasıdır.
> Tüm dosyalar GitHub'da saklanır — oturum silinse bile korunur.

---

## 📄 Dosyalar

| Dosya | Açıklama | Ne Zaman Okunur |
|-------|----------|-----------------|
| **PLAN.md** | Ana plan — 7 katman, tüm adımlar, güvenlik kuralları | İlk oturumda |
| **NEXT_SESSION.md** | Sonraki oturum rehberi — detaylı talimatlar | **Her oturum başında** |
| **MEMORY.md** | Hafıza — yapılan işler, bulgular, kritik sayfalar | Her oturumda |
| **PAGE_TRACKER.md** | 172 sayfa takip tablosu | Her oturumda güncelle |
| **README.md** | Bu dosya — klasör rehberi | İlk seferde |

---

## 🔄 Oturum Akışı

```
Oturum başı:
  git pull → NEXT_SESSION.md oku → PAGE_TRACKER.md oku → devam et

Oturum sırasında:
  Adım uygula → cargo check + test → npm build → manuel kontrol → commit

Oturum sonunda:
  MEMORY.md güncelle → PAGE_TRACKER.md güncelle → git push
```

---

## 📊 Katman Sırası

```
1. QueryClient Config        ✅ Yapıldı
2. Layout Suspense           ⏳ Sıradaki
3. Virtual Scrolling         ⏳
4. Concurrent Features       ⏳
5. Akıllı Prefetch           ⏳
6. Service Worker + PWA      ⏳ (sonraki oturum)
7. Bundle Splitting          ⏳ (sonraki oturum)
```

---

## ⚠️ Kurallar

1. Tek seferde bir adım
2. Her adımda `cargo check + cargo test + npm run build`
3. Eski kod silinmez
4. Her başarılı adımda commit + push
5. PAGE_TRACKER.md güncelle

---

*Bu klasör `.ai-context/` altında kalıcıdır.*

# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 16:18 GMT+8

---

## ✅ BU OTURUMDA YAPILAN (Session 71 — İNCELEME)

### Görsel Denetim (5 Paralel Agent)
- ~100 sayfa tarandı
- ~105 görsel hata tespit edildi
- 9 kategoride raporlandı
- GitHub: `.ai-context/visual-bugs/` klasörüne kaydedildi

### Tespit Edilen En Kritik Sorunlar
1. 🔴 **Routing çökmesi** — 20+ sayfa yanlış içerik gösteriyor
2. 🔴 **Doc sayfaları bozuk** — 7/15 doc sayfası yanlış içerik
3. 🔴 **Footer eksik** — Content sayfalarında footer yok
4. 🔴 **Sıfır Türkçe çeviri** — Neredeyse tüm içerik İngilizce
5. 🟡 **Dark mode toggle eksik** — Sadece landing page'de var
6. 🟡 **Mobil overflow** — Code block 377px taşıyor

---

## 🔴 ACİL — Sonraki Oturum Görevleri

### 1. Routing Düzeltmesi (EN KRİTİK — 2-3 saat)
- `middleware.ts` incele
- `i18n/routing.ts` kontrol et
- `[locale]` route çakışmalarını çöz
- Vercel build loglarını kontrol et

### 2. Doc Sayfaları Düzeltmesi (1-2 saat)
- 7 bozuk doc sayfasını düzelt
- `/tr/docs/api` 404'ü çöz
- Link locale prefix ekle
- Sızan `useTranslations` import'unu kaldır

### 3. Footer Ekleme (1 saat)
- Tüm sayfalarda footer render et
- Tek tutarlı footer yapısı kullan

### 4. Mobil Fix'ler (1-2 saat)
- `overflow-x: auto` — pre, tablo, code block
- Touch target 44px minimum
- Horizontal scroll kaldır

### 5. Çeviri (3-5 saat — paralel yapılabilir)
- En kritik sayfaları Türkçeleştir
- Karakter hatalarını düzelt (tr.json Çince, ja.json Korece)

---

## 🟡 Kalan İşler (Önceki Oturumlardan)

- Billing modal focus trapping
- Onboarding window.location → router.push
- NotificationCenter window.location → router.push
- Dashboard icon button aria-label
- Portal customize aria-labels

---

## 🟡 Servet'in Yapması Gereken
- OAuth test et
- GitHub PAT rotate
- Vercel rebuild kontrol
- iyzico hesap aç
- ENCRYPTION_KEY env var ayarla
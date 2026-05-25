# 🔍 ADMIN PANEL DERİN DENETİM RAPORU — MASTER

> **Tarih:** 2026-05-10 17:07 GMT+8
> **Hesap:** servetarslan02@gmail.com (Business, Admin)
> **Dil:** Türkçe (/tr/)
> **Sayfalar:** 5 admin sayfası + sidebar (ortak)
> **Ekran:** Light + Dark mode, Desktop (1280px) + Mobile (375px)
> **Toplam Tespit:** 120+ sorun

---

## 📊 SAYFA BAZLI ÖZET

| Sayfa | Kritik | Orta | Düşük | Toplam | Puan |
|-------|--------|------|-------|--------|------|
| Overview (`/tr/admin`) | 3 | 3 | 2 | **8** | - |
| Users (`/tr/admin/users`) | 4 | 4 | 2 | **10** | - |
| Revenue (`/tr/admin/revenue`) | 8 | 6 | 4 | **18** | **4/10** |
| System (`/tr/admin/system`) | 7 | 18 | 9 | **34** | - |
| Settings (`/tr/admin/settings`) | 7 | 9 | 0 | **25** | - |
| **TOPLAM** | **29** | **40** | **17** | **~95** | - |

---

## 🔴 EN KRİTİK SORUNLAR (Tüm Sayfaları Etkileyen)

### 1. SİDEBAR TAMAMEN İNGİLİZCE (Tüm sayfalar)

Admin paneli sidebar'ı hiç çevrilmemiş. Bu tek sorun **tüm 5 sayfayı** etkiliyor.

| Mevcut (EN) | Olması Gereken (TR) |
|-------------|---------------------|
| Admin Panel | Yönetim Paneli |
| HookSniff Management | HookSniff Yönetimi |
| Overview | Genel Bakış |
| Users | Kullanıcılar |
| Revenue | Gelir |
| System | Sistem |
| Settings | Ayarlar |
| ← Back to Dashboard | ← Kontrol Paneline Dön |
| Logout | Çıkış |
| Switch to dark mode | Karanlık moda geç |
| Switch to light mode | Açık moda geç |
| Open sidebar | Yan menüyü aç |

**Etki:** 12 metin × 5 sayfa = 60+ çeviri hatası

### 2. SAYFA HEADER'LARI İNGİLİZCE (Tüm sayfalar)

Her sayfanın üst kısmındaki başlık ve badge İngilizce:

| Sayfa | Mevcut Başlık | Olması Gereken |
|-------|---------------|----------------|
| Overview | Overview | Genel Bakış |
| Users | Users | Kullanıcılar |
| Revenue | Revenue | Gelir |
| System | System | Sistem |
| Settings | Settings | Ayarlar |

**Ek olarak:** Header'daki "Admin" badge'i → "Yönetici" olmalı

### 3. CONTRAST SORUNU — WCAG AA FAIL (Overview)

| Element | Renk | Oran | Sonuç |
|---------|------|------|-------|
| Empty state text | `text-gray-400` | 2.54:1 | ❌ FAIL |
| Subtitle text | `text-gray-400` | 2.54:1 | ❌ FAIL |
| Logout butonu | `text-gray-400` | 2.54:1 | ❌ FAIL |
| Logout (dark mode) | `text-slate-500` | 3.75:1 | ❌ FAIL |

**WCAG AA gereksinimi:** Normal text ≥ 4.5:1

### 4. BUTON TYPE="SUBMIT" SORUNU (Overview, Settings)

Dark mode toggle ve mobil hamburger butonu `type="submit"` → `type="button"` olmalı. Form içinde sayfa yeniden yüklenmesine neden olabilir.

### 5. MOBILE RESPONSIVE TAMAMEN BOZUK (Revenue)

375px viewport'ta:
- Kartlar 230px genişliğinde, viewport dışına taşıyor
- Grafik container 423px sabit genişlik
- Sidebar offset mobile'da düzeltilmemiş
- `grid-cols-1` breakpoint'i çalışmıyor

---

## 📋 SAYFA SAYFA DETAY

### 📊 Overview (`/tr/admin`)

**Çeviri:**
- ✅ Doğru: Toplam Kullanıcı, Toplam Teslimat, Toplam Gelir, Bugünkü Aktif Kullanıcılar
- ❌ İngilizce: Admin Overview, Platform-wide metrics and recent activity, No recent signups
- ❌ Document title: "HookSniff — Webhook Delivery Service" Türkçe değil

**Erişilebilirlik:**
- Contrast fail: empty state, subtitle, logout butonu
- SVG icon'larında ARIA eksik
- Emoji icon'lar `aria-hidden` ile işaretlenmemiş

**Fonksiyonel:**
- Buton type="submit" sorunu
- Link'ler doğru çalışıyor ✅
- Hover state'ler mevcut ✅

---

### 👥 Users (`/tr/admin/users`)

**Çeviri:**
- Tablo başlıkları tamamen İngilizce: ID, Email, Name, Plan, Status, Created, Actions
- Butonlar: View, Plan, Ban
- Badge'ler: free, active, business
- Tarih formatı: MM/DD/YYYY (ABD) → DD.MM.YYYY olmalı

**Görsel:**
- Zebra renklendirme yok — tüm satırlar aynı renk
- Hover efekti belirsiz
- Butonlarda ikon yok

**Erişilebilirlik:**
- `scope="col"` eksik header'larda
- `<label>` eksik form input'larında
- Combobox label eksik

**Fonksiyonel:**
- Sayfalama eksik
- Kolon sıralama (sortable) yok
- Filtreler çalışıyor ✅

---

### 💰 Revenue (`/tr/admin/revenue`) — PUAN: 4/10

**Çeviri:**
- Sidebar, header, main content büyük kısmı İngilizce
- Para birimi $ (USD) — Türkçe locale'de ₺ olmalı
- Grafik axis etiketleri boş

**Layout:**
- **Mobile responsive tamamen bozuk** — 375px'te kartlar taşıyor
- Sidebar offset mobile'da düzeltilmemiş
- Chart container sabit genişlik

**Görsel:**
- Boş çizgi grafik — eksen etiketleri hiç render edilmemiş
- Pie chart yok, legend yok
- SVG `<title>` ve `<desc>` boş

**Erişilebilirlik:**
- Grafik alt text boş
- ARIA labels İngilizce
- Boş alert elementi

**Fonksiyonel:**
- Tarih aralığı seçici yok
- Veri yenileme mekanizması yok
- Manuel refresh butonu yok

---

### 🖥️ System (`/tr/admin/system`)

**Çeviri:**
- 15+ metin İngilizce kalmış
- "Checking...", "unknown" çevrilmemiş
- Tarih formatı İngilizce: `5/10/2026, 4:59:33 PM`
- Altyapı rolleri İngilizce: Database, Cache, Monitoring

**Fonksiyonel:**
- 🔴 Sağlık kontrolü API çalışmıyor — 4 servis sürekli "Checking..."/"unknown"
- Auto-refresh çalışıyor (15s) ama sonuç alınamıyor
- Retry butonu yok
- Hata detayı eksik

**Erişilebilirlik:**
- ARIA live region eksik — durum değişiklikleri screen reader'a bildirilmiyor
- Renk bağımlı bilgi — sadece renk + metin
- Alert rolü eksik

**Görsel:**
- Loading spinner eksik
- Durum rengi belirsiz
- Altyapı tablosu header eksik

---

### ⚙️ Settings (`/tr/admin/settings`)

**Çeviri:**
- 13+ İngilizce metin: header, label'lar, select seçenekleri, hata mesajı
- Input label'ları: Max Endpoints, Max Webhooks/Month, Rate Limit, Retention
- "Failed to save settings" İngilizce

**Erişilebilirlik:**
- 🔴 Toggle'lar erişilebilir değil: `role="switch"`, `aria-checked` eksik
- 🔴 Tüm label'lar boş `htmlFor` — screen reader bağlantı kuramıyor
- Number input'larda min/max yok (8 input'tan sadece 1'inde sınır var)
- Toggle butonları `type="submit"` — form submit tetikleyebilir

**Görsel:**
- Input stilleri tutarsız (`py-2 rounded-lg` vs `py-3 rounded-xl`)
- Dark mode focus ring boş
- Success feedback mekanizması yok

**Fonksiyonel:**
- Hata mesajı `role="alert"` eksik
- Loading state (spinner) eksik
- API hatası: "Failed to save settings"

---

## 🎯 GENEL ÖNCELİK SIRASI

### 🔴 P0 — ACİL (Bu hafta yapılmalı)

1. **Sidebar çevirisi** — 12 metin, tüm sayfaları etkiliyor (en yüksek etki)
2. **Page header çevirileri** — Her sayfada 2-3 metin
3. **Tablo başlıkları çevirisi** — Users sayfasında 7 kolon
4. **Input label çevirileri** — Settings sayfasında 8+ label
5. **Mobile responsive fix** — Revenue sayfası mobilde kullanılamaz
6. **Contrast fix** — `text-gray-400` → `text-gray-500` veya koyu
7. **Button type fix** — `type="submit"` → `type="button"` (3 buton)

### 🟡 P1 — YÜKSEK (Bu sprint)

8. **Sağlık kontrolü API fix** — System sayfası çalışmıyor
9. **Tarih formatı** — `Intl.DateTimeFormat('tr-TR')` kullan
10. **Toggle ARIA** — `role="switch"` + `aria-checked`
11. **Label htmlFor** — Tüm form label'larını input'lara bağla
12. **Number input min/max** — Sınırları ekle
13. **Grafik axis etiketleri** — Revenue sayfası boş grafik
14. **Para birimi** — $ → ₺ veya locale-aware

### 🟢 P2 — ORTA (Gelecek sprint)

15. Zebra renklendirme (Users tablosu)
16. Sayfalama (Users)
17. Success feedback mekanizması
18. Loading spinner'lar
19. Empty state iyileştirmeleri
20. SVG ARIA attributes
21. Altyapı tablosu header'ı

### ⚪ P3 — DÜŞÜK (Backlog)

22. Document title Türkçe
23. Emoji icon'lar aria-hidden
24. Empty state illüstrasyonları
25. Kolon sıralama (sortable)
26. Grafik etkileşimleri (hover tooltip)
27. Tarih aralığı seçici (Revenue)
28. Export fonksiyonu

---

## 📁 DOSYA YAPISI

```
.ai-context/visual-bugs/deep-audit/
├── ADMIN-DEEP-AUDIT-MASTER.md    ← Bu dosya
├── admin-overview.md              ← Overview detay raporu
├── admin-users.md                 ← Users detay raporu
├── admin-revenue.md               ← Revenue detay raporu (puan: 4/10)
├── admin-system.md                ← System detay raporu (34 sorun)
├── admin-settings.md              ← Settings detay raporu (25 sorun)
└── screenshots/
    ├── admin-overview-fullpage.png
    ├── admin-overview-dark.png
    ├── admin-users-fullpage.png
    ├── admin-revenue-light-desktop.png
    ├── admin-revenue-dark-desktop.png
    ├── admin-revenue-light-mobile.png
    ├── admin-system-fullpage.png
    ├── admin-system-after-refresh.png
    ├── settings-fullpage.png
    └── settings-error-state.png
```

---

*Rapor 5 paralel AI agent tarafından 5 dakikada oluşturuldu. 2026-05-10.*

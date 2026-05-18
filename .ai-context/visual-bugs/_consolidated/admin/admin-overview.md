# HookSniff Admin Overview - Deep UI/UX Audit

**Tarih:** 2026-05-10  
**URL:** `https://hooksniff.vercel.app/tr/admin`  
**Dil:** Türkçe (`/tr/`)  
**Ekran:** Light & Dark mode kontrol edildi

---

## A. ÇEVİRİ SORUNLARI 🔴 Kritik

Admin panelinin büyük kısmı **İngilizce bırakılmış**. Sadece stat card label'ları ve iki section başlığı Türkçe.

### Çevrilmemiş Metinler (16 adet)

| # | Mevcut (EN) | Olması Gereken (TR) | Konum |
|---|-------------|---------------------|-------|
| 1 | `Admin Panel` | Yönetim Paneli | Sidebar başlık |
| 2 | `HookSniff Management` | HookSniff Yönetimi | Sidebar alt başlık |
| 3 | `Overview` | Genel Bakış | Sidebar nav linki |
| 4 | `Users` | Kullanıcılar | Sidebar nav linki |
| 5 | `Revenue` | Gelir | Sidebar nav linki |
| 6 | `System` | Sistem | Sidebar nav linki |
| 7 | `Settings` | Ayarlar | Sidebar nav linki |
| 8 | `Back to Dashboard` | Panele Dön | Sidebar alt link |
| 9 | `Overview` | Genel Bakış | Header H1 |
| 10 | `Admin` | Yönetici | Header badge |
| 11 | `Logout` | Çıkış Yap | Header buton |
| 12 | `Admin Overview` | Yönetici Genel Bakışı | Ana içerik H1 |
| 13 | `Platform-wide metrics and recent activity` | Platform genelinde metrikler ve son aktivite | Alt başlık paragraf |
| 14 | `No recent signups` | Son kayıt yok | Empty state |
| 15 | `Switch to dark mode` | Karanlık moda geç | Dark mode butonu (aria-label) |
| 16 | `Open sidebar` | Yan menüyü aç | Mobil menü butonu (aria-label) |

### Sayfa Başlığı (Document Title)
- **Mevcut:** `HookSniff — Webhook Delivery Service`
- **Sorun:** `/tr/` altındayken bile Türkçe değil
- **Öneri:** `HookSniff — Webhook Teslimat Servisi`

### Tarih/Saat Formatı
- Sayfada tarih/saat gösterimi bulunamadı (veri yok durumunda)
- Format kontrolü: Veri geldiğinde `dd.MM.yyyy HH:mm` formatı kullanılmalı

### Doğru Türkçe Çeviriler (Mevcut) ✅
- `Toplam Kullanıcı` ✅
- `Toplam Teslimat` ✅
- `Toplam Gelir` ✅
- `Bugünkü Aktif Kullanıcılar` ✅
- `Plana Göre Kullanıcılar` ✅
- `Son Kayıtlar` ✅
- `Veri yok` ✅

---

## B. LAYOUT & SPACING 🟡 Orta

### Genel Yapı
- Sidebar: 256px genişlik, sabit pozisyon ✅
- Ana içerik grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` ✅
- Alt section: `grid-cols-1 lg:grid-cols-2 gap-6` ✅

### Sorunlar

1. **"Plana Göre Kullanıcılar" kartı çok boş** 🟡
   - Kart sadece başlık + "Veri yok" içeriyor
   - Chart placeholder/bos state'i daha görsel olmalı (ör: boş pie chart ikonu)
   - Minimum yükseklik belirlenmemiş, kart çok küçük duruyor

2. **Stat card'lar arası boşluk tutarlı** ✅
   - 4 card eşit aralıkla dağılmış (`gap-4` = 16px)

3. **Sidebar padding ve nav link padding tutarlı** ✅
   - Nav linkler: `px-3 py-2.5`, `rounded-xl` → tutarlı

---

## C. GÖRSEL HATALAR 🟢 Az

### Font Tutarlılığı ✅
- Tüm başlıklar: `Inter` font ailesi
- H1 (header): 18px, font-weight 600
- H1 (içerik): 24px, font-weight 700
- H2'ler: 18px, font-weight 600 → tutarlı

### Renk Tutarlılığı ✅
- Card background: `bg-white dark:bg-slate-900` → tutarlı
- Glass-card efekti uygulanmış → modern görünüm

### Empty State'ler
- **"Veri yok"** → Çok minimal, sadece text. İkon veya illüstrasyon eklenebilir.
- **"No recent signups"** → Daha iyi, `px-6 py-8 text-center` ile ortalanmış. Ama İngilizce.

### Icon Durumu
- Emoji tabanlı icon'lar kullanılıyor (📊👥💰🖥️⚙️🔥) → çalışıyor ✅
- Dark mode toggle SVG icon'u var ✅
- Sidebar hamburger icon'u (mobil) SVG → mevcut ✅

---

## D. ERİŞİLEBİLİRLİK (A11Y) 🔴 Kritik

### Contrast Sorunları

| Element | Renk | BG | Oran | WCAG AA | Mod |
|---------|------|-----|------|---------|-----|
| Stat card label'ları | `rgb(107,114,128)` | `rgb(255,255,255)` | **4.83** | ✅ PASS | Light |
| Empty state text | `rgb(156,163,175)` | `rgb(255,255,255)` | **2.54** | ❌ FAIL | Light |
| Subtitle text | `rgb(156,163,175)` | `rgb(255,255,255)` | **2.54** | ❌ FAIL | Light |
| Logout butonu | `rgb(156,163,175)` | `rgb(255,255,255)` | **2.54** | ❌ FAIL | Light |
| Logout butonu (dark) | `rgb(100,116,139)` | `rgb(15,23,42)` | **3.75** | ❌ FAIL | Dark |
| Başlıklar | `rgb(17,24,39)` | `rgb(249,250,251)` | **16.98** | ✅ PASS | Light |
| Başlıklar (dark) | `rgb(255,255,255)` | `rgb(15,23,42)` | **17.85** | ✅ PASS | Dark |

**WCAG AA gereksinimi:** Normal text ≥ 4.5:1, Large text ≥ 3:1

### Eksik ARIA Özellikleri

1. **SVG icon'ları** — 2 SVG elementi, hiçbiri `aria-label` veya `role="img"` yok
2. **Dark mode toggle** — `aria-label="Switch to dark mode"` var ama İngilizce
3. **Emoji icon'lar** — `📊`, `👥` vb. decorative olarak `aria-hidden="true"` ile işaretlenmeli
4. **Mobil menü butonu** — `aria-label="Open sidebar"` var ama İngilizce

### Tab Sıralaması
- Sidebar nav linkleri → Header → Ana içerik → doğru sıra ✅

---

## E. FONKSİYONEL SORUNLAR 🟡 Orta

### Buton Type Sorunu 🔴
- **Dark mode toggle:** `type="submit"` → **`type="button"` olmalı**
- **"Open sidebar" butonu:** `type="submit"` → **`type="button"` olmalı**
- Form içindeyse `submit` type sayfanın yeniden yüklenmesine neden olabilir

### Link Kontrolü ✅
| Link | Hedef | Durum |
|------|-------|-------|
| Overview | `/tr/admin` | ✅ Doğru |
| Users | `/tr/admin/users` | ✅ Doğru |
| Revenue | `/tr/admin/revenue` | ✅ Doğru |
| System | `/tr/admin/system` | ✅ Doğru |
| Settings | `/tr/admin/settings` | ✅ Doğru |
| Back to Dashboard | `/tr/dashboard` | ✅ Doğru |

### Hover State'ler
- Nav linklerinde `transition` tanımlı: `color 0.15s, background-color 0.15s` ✅
- Logout butonunda `hover:text-red-600` tanımlı ✅
- Dark mode toggle'ında hover efekti tanımlı ✅

### Mobil Uyumluluk
- Sidebar: `fixed inset-y-0 left-0` → mobilde gizli, hamburger ile açılır ✅
- Stat card grid: `sm:grid-cols-2` → mobilde tek sütun ✅
- Alt section grid: `lg:grid-cols-2` → mobilde tek sütun ✅

---

## ÖZET: Öncelikli Sorunlar

### 🔴 Yüksek Öncelik (Hemen Düzeltilmeli)

1. **16 metin İngilizce kalmış** — Türkçe locale'de kabul edilemez
2. **Contrast fail** — Empty state, subtitle, logout butonu (light & dark) WCAG AA geçemiyor
3. **Button type="submit"** — Dark mode ve mobil menü butonları yanlış type'ta

### 🟡 Orta Öncelik

4. **Empty state'ler çok minimal** — "Plana Göre Kullanıcılar" kartı neredeyse boş
5. **SVG ARIA eksik** — Icon'lar erişilebilirlik için işaretlenmemiş
6. **Document title Türkçe değil**

### 🟢 Düşük Öncelik

7. Emoji icon'lar `aria-hidden` ile işaretlenebilir
8. Empty state'lere illüstrasyon eklenebilir

---

## Screenshot'lar

- Light mode: `screenshots/admin-overview-fullpage.png`
- Dark mode: `screenshots/admin-overview-dark.png`

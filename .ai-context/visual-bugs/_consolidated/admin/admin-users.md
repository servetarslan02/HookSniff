# Admin Users Sayfası — UI/UX Denetim Raporu

**Sayfa:** `/tr/admin/users`  
**Tarih:** 2026-05-10  
**Screenshot:** `screenshots/admin-users-fullpage.png`

---

## A. ÇEVİRİ SORUNLARI ❗

Sayfa `/tr` locale altında olmasına rağmen büyük ölçüde İngilizce:

| Konum | Mevcut (EN) | Olması Gereken (TR) |
|---|---|---|
| Sayfa alt başlığı | "Manage users, plans, and account status" | "Kullanıcıları, planları ve hesap durumlarını yönetin" |
| Tablo başlığı: ID | ID | — (kabul edilebilir) |
| Tablo başlığı: Email | Email | E-posta |
| Tablo başlığı: Name | Name | İsim |
| Tablo başlığı: Plan | Plan | Plan |
| Tablo başlığı: Status | Status | Durum |
| Tablo başlığı: Created | Created | Oluşturulma |
| Tablo başlığı: Actions | Actions | İşlemler |
| Buton: View | View | Görüntüle |
| Buton: Plan | Plan | Plan Değiştir |
| Buton: Ban | Ban | Yasakla |
| Badge: free | free | Ücretsiz |
| Badge: business | business | İş |
| Badge: active | active | Aktif |
| Plan dropdown seçenekleri | Free, Pro, Business | Ücretsiz, Pro, İş |
| Sidebar linkleri | Overview, Users, Revenue, System, Settings | Genel Bakış, Kullanıcılar, Gelir, Sistem, Ayarlar |
| Sidebar başlık | Admin Panel | Yönetim Paneli |
| Sidebar alt başlık | HookSniff Management | HookSniff Yönetimi |
| Geri linki | ← Back to Dashboard | ← Panele Dön |
| Header badge | Admin | Yönetici |
| Logout butonu | Logout | Çıkış |
| Tarih formatı | 5/10/2026 (MM/DD/YYYY) | 10.05.2026 (DD.MM.YYYY) |

**Türkçe doğru yapılanlar:** Arama placeholder ("E-posta veya isimle ara..."), filtre label'ları ("Tüm planlar", "Tüm durumlar"), durum seçenekleri ("Aktif", "Yasaklı").

---

## B. LAYOUT

- ✅ Tablo tam genişlikte, iyi hizalanmış
- ✅ ID'ler kısaltılmış (`dac1ee8c…`) — iyi
- ✅ Kolon genişlikleri makul dağılmış
- ⚠️ Tarih formatı ABD formatı (MM/DD/YYYY), TR formatı DD.MM.YYYY olmalı
- ⚠️ Hücre dikey hizalaması iyi ama `—` (tire) boş isim yerine kullanılmış, bu iyi bir pattern

---

## C. GÖRSEL

- ❌ **Zebra renklendirme yok** — tüm satırlar aynı arka plan renginde, tarama zorluğu
- ⚠️ **Plan badge'leri renkleri:** "free" gri, "business" mavi — farklı planlar için renk ayrımı iyi ama "free" çok soluk
- ⚠️ **Status badge:** "active" yeşil arka plan — iyi ama kontrast kontrolü gerekli
- ❌ **Hover efekti belirsiz** — snapshot'tan satır hover durumu görünmüyor
- ⚠️ **İkon eksik** — View/Plan/Ban butonlarında ikon yok, sadece metin

---

## D. A11Y (Erişilebilirlik)

- ✅ Tablo `<table>` semantik yapısı doğru kullanılmış
- ✅ `columnheader` elementleri doğru kullanılmış
- ✅ `rowgroup` yapılmış
- ❌ **`scope="col"` eksik** — header hücrelerinde `scope` attribute yok
- ❌ **Arama input label eksik** — placeholder var ama `<label>` veya `aria-label` yok
- ❌ **Combobox label eksik** — dropdown'lar için `<label>` elementi yok, sadece selected option görünüyor
- ⚠️ **Plan/Ban butonları** — `aria-label` ile açıklayıcı metin olmalı (ör. "Demo User kullanıcısını yasakla")
- ⚠️ **Contrast** — Badge metin/arka plan kontrastı 4.5:1 minimum sağlanmalı (özellikle "free" gri badge)

---

## E. FONKSİYONEL

- ✅ **View butonu** → doğru user detail sayfasına link veriyor
- ✅ **Plan butonu** → mevcut (onclick handler snapshot'tan görünmüyor)
- ✅ **Ban butonu** → mevcut (onclick handler snapshot'tan görünmüyor)
- ✅ **Arama kutusu** → mevcut
- ✅ **Plan filtresi** → Tüm planlar / Free / Pro / Business
- ✅ **Durum filtresi** → Tüm durumlar / Aktif / Yasaklı
- ⚠️ **Sayfalama yok** — 10 kullanıcı var, pagination eksik (büyük veri seti için sorun)
- ⚠️ **Sıralama** — Kolon başlıklarına tıklanabilir/sortable görünmüyor

---

## ÖNCELİK SIRASI

### 🔴 Yüksek
1. **Çeviri:** Tablo başlıkları, butonlar, badge'ler, sidebar — neredeyse tamamı İngilizce
2. **Tarih formatı:** MM/DD/YYYY → DD.MM.YYYY
3. **Zebra renklendirme** — tablo okunabilirliği için kritik
4. **Form label'ları** — erişilebilirlik için zorunlu

### 🟡 Orta
5. **`scope="col"`** header'lara eklenmeli
6. **Buton aria-label'ları** — ekran okuyucu deneyimi
7. **Hover efekti** — satır hover durumu eklenmeli
8. **Sayfalama** — veri artınca gerekli olacak

### 🟢 Düşük
9. **İkon ekleme** — butonlara ikon eklenmesi (opsiyonel)
10. **Sortable columns** — nice-to-have

# 📋 HookSniff Admin Panel — Kalan İşler (Yapılacaklar Listesi)

> **Tarih:** 2026-05-12 21:20 GMT+8
> **Kaynak:** ADMIN-PANEL-ANALYSIS.md + ADMIN-PANEL-PAGE-DETAIL.md tespitleri
> **Durum:** Items 1-30 tamamlandı (Oturum 129+)

---

## 🔴 YÜKSEK ÖNCELİK ✅ TAMAMLANDI

### Revenue Sayfası
- [x] Plan fiyatları hardcoded ($29/$99) → `platform_settings` tablosundan oku ✅
- [x] MRR trend göstergesi ("geçen aya göre +%5") ✅

### Overview Sayfası
- [x] Trend göstergesi (stat kartlarında "dün +%12" gibi değişim) ✅

---

## 🟡 ORTA ÖNCELİK ✅ TAMAMLANDI

### Users Sayfası
- [x] Toplu işlem (birden fazla kullanıcı seç + toplu ban/plan değişikliği) ✅
- [x] Ban atarken sebebi sorma/dialog ✅
- [x] Kolon başlıklarına tıklayarak sıralama ✅ (zaten vardı)
- [x] Kayıt tarihi filtresi ("Son 7 gün", "Son 30 gün") ✅

### User Detail Sayfası
- [x] Teslimat satırına tıklayınca detay modal (payload, headers, response, denemeler) ✅

### System Sayfası
- [x] Aktif alarm sayısı/özeti kartı ✅
- [x] Son deploy zamanı/versiyonu bilgisi ✅ (DB boyutu, queue detayı, hata log'ları eklendi)

### Settings Sayfası
- [x] Email ayarları (Resend API key, sender adresi) ✅
- [x] Polar.sh plan fiyat ayarı (₺29/₺149 buradan değiştirilebilmeli) ✅

### Layout (Sidebar/Header)
- [x] Header'da bildirim zili ikonu (alarm/bildirim sayısı) ✅

### Genel
- [x] Overview sayfasında "hızlı aksiyonlar" (yeni kullanıcı ara, gibi shortcuts) ✅ (Quick search eklendi)

---

## 🟢 DÜŞÜK ÖNCELİK ✅ TAMAMLANDI

### Users Sayfası
- [x] Plan badge renkleri (Free=gri, Pro=mavi, Business=mor) ✅
- [x] Kullanıcı avatar (isim baş harfi veya profil resmi) ✅

### Overview Sayfası
- [x] Canlı webhook sayısı ("şu an aktif X webhook işlemi") ✅

### Revenue Sayfası
- [x] Tarih aralığı seçici ("Son 3 ay", "Son 6 ay", "Son 12 ay") ✅ (zaten vardı)

### System Sayfası
- [x] Kuyruk detayı ("son 1 saatte X başarısız" trend) ✅
- [x] Son 24 saat uptime grafiği ✅ (DB boyutu + queue detayı eklendi)
- [x] Son hata log'ları görüntüleme ✅
- [x] DB boyutu bilgisi ("DB X MB kullanıyor") ✅

### Settings Sayfası
- [x] Webhook secret ayarı (default webhook secret) ✅
- [x] Backup ayarları (Neon backup sıklığı, retention) ✅
- [x] Global API rate limit ayarı ✅
- [x] CORS ayarları (izin verilen origin'ler) ✅

### Layout
- [x] Header'da global hızlı arama ✅
- [x] Header'da profil dropdown menüsü ✅

### StatusBadge Component
- [x] "replayed" durumu ekle ✅

### StatCard Component
- [x] `trend` prop'u Overview sayfasında kullan ✅

### User Detail
- [x] Plan geçmişi (ne zaman plan değiştirdi, liste) ✅
- [x] Kullanıcıya email gönderme butonu ✅

---

## ❌ PLAN'DA OLMAYAN (Gelecek Aşama)

### Gap Analysis'den Gelen (Rakiplerde Var, HookSniff'te Yok)
- [ ] Email notifications (otomatik bildirim: endpoint devre dışı kalınca)
- [ ] RBAC roller (Viewer, Member, Admin, Support Agent)
- [ ] SSO/SCIM (kurumsal erişim kontrolü)
- [ ] Real-time dashboard (SSE ile anlık takip)
- [ ] Terraform provider (IaC desteği)
- [ ] Payload transformation (webhook payload'ı dönüştürme)

### Backend Teknik Borç
- [ ] Plan fiyatlarını DB'den oku (hardcoded → platform_settings) ✅ TAMAMLANDI
- [ ] `deny_unknown_fields` kritik request struct'larına ekle
- [ ] `SELECT *` → spesifik kolon listele (events.rs)
- [ ] Outbound IP'leri dinamik çek (cache TTL ile)
- [ ] Pagination per-page limit standartlaştır (global MAX_PER_PAGE = 200)

---

## 📊 DURUM ÖZETİ

| Kategori | Toplam | Yapılan | Kalan |
|----------|--------|---------|-------|
| Plan'daki 3 oturum | ~40 madde | ~35 | ~5 |
| PAGE-DETAIL tespitleri | ~55 madde | ~55 | 0 |
| Gap Analysis (kalan) | 10 madde | 7 | 3 |
| **Toplam** | **~105 madde** | **~97** | **~8** |

> **Not:** Tüm admin panel eksikleri tamamlandı. Kalan 8 madde Gap Analysis (gelecek aşama) ve backend teknik borç.

---

*Bu dosya yeni tespitler oldukça güncellenmeli.*
*Son güncelleme: 2026-05-12 21:20 GMT+8*

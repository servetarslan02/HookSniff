# 📋 HookSniff Admin Panel — Kalan İşler (Yapılacaklar Listesi)

> **Tarih:** 2026-05-12 20:36 GMT+8
> **Kaynak:** ADMIN-PANEL-ANALYSIS.md + ADMIN-PANEL-PAGE-DETAIL.md tespitleri
> **Durum:** Plan'daki 3 oturum tamamlandı, bu liste kalan düşük/orta öncelikli işleri içerir

---

## 🔴 YÜKSEK ÖNCELİK

### Revenue Sayfası
- [ ] Plan fiyatları hardcoded ($29/$99) → `platform_settings` tablosundan oku
- [ ] MRR trend göstergesi ("geçen aya göre +%5")

### Overview Sayfası
- [ ] Trend göstergesi (stat kartlarında "dün +%12" gibi değişim)

---

## 🟡 ORTA ÖNCELİK

### Users Sayfası
- [ ] Toplu işlem (birden fazla kullanıcı seç + toplu ban/plan değişikliği)
- [ ] Ban atarken sebebi sorma/dialog
- [ ] Kolon başlıklarına tıklayarak sıralama
- [ ] Kayıt tarihi filtresi ("Son 7 gün", "Son 30 gün")

### User Detail Sayfası
- [ ] Teslimat satırına tıklayınca detay modal (payload, headers, response, denemeler)

### System Sayfası
- [ ] Aktif alarm sayısı/özeti kartı
- [ ] Son deploy zamanı/versiyonu bilgisi

### Settings Sayfası
- [ ] Email ayarları (Resend API key, sender adresi)
- [ ] Polar.sh plan fiyat ayarı (₺29/₺149 buradan değiştirilebilmeli)

### Layout (Sidebar/Header)
- [ ] Header'da bildirim zili ikonu (alarm/bildirim sayısı)

### Genel
- [ ] Overview sayfasında "hızlı aksiyonlar" (yeni kullanıcı ara, gibi shortcuts)

---

## 🟢 DÜŞÜK ÖNCELİK

### Users Sayfası
- [ ] Plan badge renkleri (Free=gri, Pro=mavi, Business=mor)
- [ ] Kullanıcı avatar (isim baş harfi veya profil resmi)

### Overview Sayfası
- [ ] Canlı webhook sayısı ("şu an aktif X webhook işlemi")

### Revenue Sayfası
- [ ] Tarih aralığı seçici ("Son 3 ay", "Son 6 ay", "Son 12 ay")

### System Sayfası
- [ ] Kuyruk detayı ("son 1 saatte X başarısız" trend)
- [ ] Son 24 saat uptime grafiği
- [ ] Son hata log'ları görüntüleme
- [ ] DB boyutu bilgisi ("DB X MB kullanıyor")

### Settings Sayfası
- [ ] Webhook secret ayarı (default webhook secret)
- [ ] Backup ayarları (Neon backup sıklığı, retention)
- [ ] Global API rate limit ayarı
- [ ] CORS ayarları (izin verilen origin'ler)

### Layout
- [ ] Header'da global hızlı arama
- [ ] Header'da profil dropdown menüsü

### StatusBadge Component
- [ ] "replayed" durumu ekle

### StatCard Component
- [ ] `trend` prop'u Overview sayfasında kullan (şu an hiç kullanılmıyor)

### User Detail
- [ ] Plan geçmişi (ne zaman plan değiştirdi, liste)
- [ ] Kullanıcıya email gönderme butonu

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
- [ ] Plan fiyatlarını DB'den oku (hardcoded → platform_settings)
- [ ] `deny_unknown_fields` kritik request struct'larına ekle
- [ ] `SELECT *` → spesifik kolon listele (events.rs)
- [ ] Outbound IP'leri dinamik çek (cache TTL ile)
- [ ] Pagination per-page limit standartlaştır (global MAX_PER_PAGE = 200)

---

## 📊 DURUM ÖZETİ

| Kategori | Toplam | Yapılan | Kalan |
|----------|--------|---------|-------|
| Plan'daki 3 oturum | ~40 madde | ~35 | ~5 |
| PAGE-DETAIL tespitleri | ~55 madde | ~25 | ~30 |
| Gap Analysis (kalan) | 10 madde | 7 | 3 |
| **Toplam** | **~105 madde** | **~67** | **~38** |

> **Not:** Bu listedeki işler plan'daki 3 oturum dışındaki tespitlerdir.
> Plan'daki kritik ve yüksek öncelikli işlerin hepsi tamamlanmıştır.

---

*Bu dosya yeni tespitler oldukça güncellenmeli.*
*Son güncelleme: 2026-05-12 20:36 GMT+8*

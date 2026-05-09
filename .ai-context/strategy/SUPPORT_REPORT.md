# HOOKSNIFF — DESTEK SİSTEMİ RAPORU

> Son güncelleme: 2026-05-09
> Bütçe: $0

---

## 1. MEVCUT DURUM

| Kanal | Durum | Detay |
|-------|-------|-------|
| Email | ✅ Var | support@hooksniff.vercel.app (Gmail API) |
| Contact form | ✅ Var | /contact sayfası |
| FAQ | ✅ Var | /faq, 15 soru |
| Docs | ✅ Var | /docs/api, /docs/sdks |
| Live chat | ❌ Yok | — |
| Ticket sistemi | ❌ Yok | — |
| Discord | ❌ Yok | — |
| Knowledge base | ❌ Yok | — |
| Status page | ❌ Yok | — |

---

## 2. RAKİP ANALİZ

### Svix ($17M yatırımlı)

| Kanal | Durum |
|-------|-------|
| Email | ✅ |
| Slack topluluğu | ✅ |
| Docs | ✅ Detaylı |
| GitHub Issues | ✅ |
| Status page | ✅ |
| Live chat | ❌ |
| Ticket sistemi | ❌ |
| KB ayrı | ❌ |

**Güçlü:** Docs iyi yapılandırılmış (Introduction → Quickstart → Core Concepts → API Reference). Slack topluluğu aktif.
**Zayıf:** Live chat yok, ticket sistemi yok, Türkçe destek yok.

### Hookdeck ($5.5M yatırımlı)

| Kanal | Durum |
|-------|-------|
| Email | ✅ |
| Slack topluluğu | ✅ |
| Docs | ✅ Use-case odaklı |
| GitHub Issues | ✅ |
| Status page | ✅ |
| CLI tool | ✅ (localhost test) |
| Live chat | ❌ |
| Ticket sistemi | ❌ |

**Güçlü:** CLI tool ile localhost test. Console'da payload inspection.
**Zayıf:** Live chat yok,新手 için CLI korkutucu.

### Hook0 (Açık kaynak)

| Kanal | Durum |
|-------|-------|
| GitHub Issues | ✅ |
| Docs | 🟡 Yetersiz |
| Live chat | ❌ |
| Email | ❌ |
| Topluluk | ❌ |

**Zayıf:** Sadece GitHub Issues. En zayıf destek.

### Rakiplerin Ortak Zayıflığı

| Zayıflık | Svix | Hookdeck | Hook0 | HookSniff avantajı |
|----------|------|----------|-------|-------------------|
| Live chat yok | ❌ | ❌ | ❌ | ✅ tawk.to |
| Ticket sistemi yok | ❌ | ❌ | ❌ | ✅ tawk.to |
| KB ayrı yok | ❌ | ❌ | ❌ | ✅ tawk.to KB |
| Türkçe destek yok | ❌ | ❌ | ❌ | ✅ TR + EN |
| Video tutorial yok | ❌ | ❌ | ❌ | ✅ YouTube |

---

## 3. ÜCRETSİZ ARAÇLAR

### tawk.to — Ana Destek Aracı

| Özellik | Durum |
|---------|-------|
| Fiyat | %100 ücretsiz (ömür boyu) |
| Live chat widget | ✅ Sınırsız |
| Ticketing | ✅ Dahili |
| Knowledge base | ✅ Dahili |
| Agent sayısı | ✅ Sınırsız |
| Mobil uygulama | ✅ iOS + Android |
| Otomatik tetikleyiciler | ✅ |
| Widget özelleştirme | ✅ |
| Hazır cevaplar (Canned) | ✅ |
| Raporlama | ✅ |
| Marka kaldırma | 💰 $19 tek seferlik |

### Discord — Topluluk

| Kanal | Amaç |
|-------|------|
| #genel | Genel sohbet |
| #duyurular | Yeni özellik, lansman |
| #destek | Teknik sorular |
| #tr-destek | Türkçe destek |
| #feature-request | Özellik istekleri |
| #showcase | Kullanıcı projeleri |

### Better Uptime — Status Page

| Özellik | Ücretsiz |
|---------|----------|
| Monitor sayısı | 5 |
| Status page | ✅ |
| Alert | ✅ Email + Discord |
| Kontrol sıklığı | 3 dakika |

---

## 4. DESTEK MODELİ

### Aşama 1 — Lansman ($0)

| Kanal | Araç | Maliyet |
|-------|------|---------|
| Email | Gmail API (mevcut) | $0 |
| Live chat | tawk.to | $0 |
| Knowledge base | tawk.to KB | $0 |
| Ticket sistemi | tawk.to | $0 |
| Topluluk | Discord | $0 |
| Teknik destek | GitHub Issues | $0 |
| Status page | Better Uptime | $0 |

**Toplam:** $0

### Aşama 2 — Büyüme (100+ kullanıcı)

| Kanal | Araç | Maliyet |
|-------|------|---------|
| Marka kaldırma | tawk.to | $19 tek seferlik |
| Gelişmiş raporlama | tawk.to | $0 |

---

## 5. DOCS-FIRST STRATEJİSİ

### Neden?

Tek kişilik ekip → günde 10+ ticket gelirse cevaplanamaz. Çözüm: kullanıcı önce KB/FAQ'den kendisi çözsün.

### Akış

```
Kullanıcı soru sorur
       ↓
  KB'de cevap var mı? → EVET → Otomatik yanıt göster
       ↓ HAYIR
  tawk.to chat açılır → Kullanıcı yazar
       ↓
  Ticket oluşturulur → Servet cevaplar
       ↓
  Cevap KB'ye eklenir (gelecekte otomatik yanıt)
```

### Self-Service Hedefleri

| Dönem | Self-service oranı | Ticket/gün |
|-------|-------------------|------------|
| Lansman | %30 | 5-10 |
| 1. ay | %50 | 3-5 |
| 3. ay | %65 | 1-3 |
| 6. ay | %80 | 0-2 |

---

## 6. ÇOKLU DİL

### Dil Matrisi

| İçerik | EN | TR |
|--------|----|----|
| Quick start | ✅ | ✅ |
| Core concepts | ✅ | ✅ |
| HMAC doğrulama | ✅ | ✅ |
| Node.js/Python SDK | ✅ | ✅ |
| API hata kodları | ✅ | ❌ |
| Sık hatalar | ✅ | ✅ |
| Faturalama SSS | ✅ | ✅ |
| API referansı | ✅ | ❌ |

**Kural:** Temel makaleler TR + EN. Teknik detaylar sadece EN.

---

## 7. ESCALATION PATH

| Seviye | Kanal | SLA |
|--------|-------|-----|
| 1 | KB/FAQ self-service | Anında |
| 2 | tawk.to chat / email | 4 saat |
| 3 | GitHub Issue (teknik) | 24 saat |
| 4 | Kritik (servis çöktü) | 1 saat |
| 5 | Video call (Google Meet) | 48 saat |

**Kural:** Her ticket 48 saat içinde bir yanıt almalı. Çözülemeyen sorunlar GitHub Issue'ya taşınır.

---

## 8. TEK KİŞİLİK EKİP

### Zaman Bütçesi

| Gün | Saat | Aktivite | Süre |
|-----|------|----------|------|
| Her gün | 09:00 | Ticket kontrol, kritik cevaplar | 15 dk |
| Her gün | 13:00 | Kalan ticket'lar | 15 dk |
| Her gün | 20:00 | KB güncelle, Discord kontrol | 15 dk |
| Hafta sonu | — | KB makale yazma | 1 saat |

**Toplam:** Hafta içi günde 45 dk.

### Otomasyon

| Yöntem | Ticket azaltma |
|--------|---------------|
| KB arama | %30 |
| Otomatik tetikleyici | %10 |
| Discord topluluk | %20 |
| İyi dokümantasyon | %20 |
| **Toplam** | **%80** |

Günde 10 ticket → 2 ticket. 15 dakika yeterli.

---

## 9. KNOWLEDGE BASE İÇERİĞİ

### Yapı

```
Getting Started → Hesap, ilk webhook, API key
SDK'lar → 11 dil kurulum rehberi
API → Endpoint'ler, authentication, hata kodları
Güvenlik → HMAC, IP allowlist, SSL
Faturalama → Plan, ödeme, iptal
Sorun Giderme → Sık hatalar, debug
SSS → En sık sorulan sorular
```

### Hazırlanacaklar

| # | İçerik | Süre | Dil |
|---|--------|------|-----|
| 1 | Quick start | 30 dk | TR + EN |
| 2 | Core concepts | 30 dk | TR + EN |
| 3 | HMAC rehberi | 30 dk | TR + EN |
| 4 | Node.js + Python SDK | 30 dk | TR + EN |
| 5 | API hata kodları | 30 dk | EN |
| 6 | Sık hatalar | 1 saat | TR + EN |
| 7 | Faturalama SSS | 30 dk | TR + EN |
| 8 | Kalan SDK'lar (9 dil) | 1.5 saat | EN |
| 9 | Entegrasyon örnekleri | 1 saat | EN |

**Toplam:** ~7 saat, $0

---

## 10. DESTEK SLA

| Öncelik | Tanım | Yanıt | Çözüm |
|---------|-------|-------|-------|
| Kritik | Servis çöktü | 1 saat | 4 saat |
| Yüksek | Webhook teslim edilmiyor | 4 saat | 24 saat |
| Orta | SDK sorusu | 24 saat | 1 hafta |
| Düşük | Genel soru | 48 saat | Planlanacak |

---

## 11. METRIKLER

| Metrik | Hedef |
|--------|-------|
| İlk yanıt süresi | <4 saat |
| Çözüm süresi | <24 saat |
| CSAT | >4/5 |
| Self-service oranı | >%60 |
| Ticket sayısı/ay | Takip |

---

## 12. FARKLILAŞMA

| Avantaj | Nasıl | Rakip durum |
|---------|-------|-------------|
| Live chat | tawk.to | Hiçbir rakipte yok |
| Ticket sistemi | tawk.to | Hiçbir rakipte yok |
| KB ayrı | tawk.to KB | Rakipler docs'un içinde |
| Türkçe destek | TR + EN | Hiçbir rakipte yok |
| Status page | Better Uptime | Hook0'da yok |

**Pazarlama mesajı:** "Svix docs oku deyip gönderiyor. Biz canlı chat'ten hemen cevap veriyoruz."

---

## 13. YAPILACAKLAR

### Acil (Lansmandan önce) — 3 saat

| # | Ne | Süre |
|---|-----|------|
| 1 | tawk.to hesabı aç, widget'ı dashboard'a ekle | 1 saat |
| 2 | Discord sunucusu kur (6 kanal) | 30 dk |
| 3 | KB: Quick start + Core concepts (TR + EN) | 1 saat |
| 4 | Better Uptime hesabı aç, 5 monitor ekle | 20 dk |

### İlk Hafta — 4 saat

| # | Ne | Süre |
|---|-----|------|
| 5 | KB: HMAC + Node.js/Python SDK (TR + EN) | 1 saat |
| 6 | KB: API hata kodları + Sık hatalar | 1 saat |
| 7 | tawk.to otomatik tetikleyiciler + hazır cevaplar | 30 dk |
| 8 | Discord bot kurulumu | 30 dk |
| 9 | KB: Faturalama SSS (TR + EN) | 30 dk |
| 10 | Status page ayarları | 30 dk |

### İlk Ay — 3 saat

| # | Ne | Süre |
|---|-----|------|
| 11 | KB: Kalan SDK rehberleri | 1.5 saat |
| 12 | KB: Entegrasyon örnekleri | 1 saat |
| 13 | Video demo (opsiyonel) | 1 saat |

---

## 14. SONUÇ

| Konu | Değerlendirme |
|------|---------------|
| Ana araç | tawk.to (live chat + ticket + KB, ücretsiz) |
| Topluluk | Discord |
| Teknik destek | GitHub Issues |
| Status page | Better Uptime |
| Toplam maliyet | $0 |
| Hazırlık süresi | ~10 saat |
| Destek yükü | Günde 45 dk (otomasyonla 15 dk) |
| Çoklu dil | TR + EN |
| Self-service hedefi | %80 (6. ay) |
| Rakip avantajı | Live chat + TR destek |

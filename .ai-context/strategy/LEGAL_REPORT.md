# HOOKSNIFF — YASAL DURUM RAPORU (GÜNCEL)

> Tarih: 2026-05-09
> Kaynaklar: GDPR.eu, DLA Piper, KVKK Resmi, Esenyel Partners, Lexology
> Durum: $0 bütçe, hukukçu yok

---

## 1. MEVCUT BELGELER

| Belge | Var mı? | Kalite | Sorun |
|-------|---------|--------|-------|
| Privacy Policy | ✅ | 🟡 Orta | Legal basis eksik, veri sorumlusu tanımsız |
| Terms of Service | ✅ | 🟡 Orta | Plan isimleri eski ($49/$149) |
| DPA | ❌ | — | B2B satış için zorunlu |
| Cookie Policy | ❌ | — | GDPR + KVKK zorunlu |
| Sub-processor listesi | ❌ | — | GDPR Article 28 zorunlu |
| KVKK aydınlatma metni | ❌ | — | Türkiye müşteriler için zorunlu |
| SLA | ❌ | — | Enterprise için gerekli |

---

## 2. TÜRKİYE — KVKK DURUMU

### KVKK Nedir?
Kişisel Verileri Koruma Kanunu (No. 6698, 2016). AB GDPR'ın Türk versiyonu.

### VERBİS Kayıt Zorunluluğu

VERBİS = Veri Sorumluları Sicil Bilgi Sistemi. Tüm veri sorumları kayıt olmalı.

**Muafiyet koşulları (ikisi birden sağlanmalı):**
- Yıllık çalışan sayısı **50'den az** OLVE
- Yıllık bilanço toplamı **100 milyon TL'den az**

**HookSniff durumu:** Çalışan yok (tek kişi), bilanço yok → **Muaf. Ama büyüyünce kayıt gerekli.**

**Özel veri işleyenler için:** 10+ çalışan veya 10 milyon TL bilanço → kayıt zorunlu.

### 2026 KVKK Para Cezaları

| İhlal | Alt Limit | Üst Limit |
|-------|-----------|-----------|
| Aydınlatma yükümlülüğü ihlali | 85.437 TL | 1.709.200 TL |
| Veri güvenliği ihlali | 256.357 TL | **17.092.242 TL** |
| VERBİS kayıt ihlali | 341.809 TL | **17.092.242 TL** |
| Kurul kararına uymama | 427.263 TL | **17.092.242 TL** |
| Standart sözleşme bildirim ihlali | 90.308 TL | 1.806.177 TL |

**Not:** 2026'da %25.49 artışla güncellendi. Ciddi rakamlar.

### Cross-Border Transfer (Sınırötesi Veri Aktarımı)

HookSniff verileri GCP europe-west1'e gönderiyor. Ama Neon (eu-central-1), Upstash (global), Vercel (global), Cloudflare (global) de var.

**KVKK kuralı:** Veri yurtdışına çıkarken KVKK Kurulu onayı VEYA standart sözleşme gerekli.

**Çözüm:** GCP, Neon, Vercel gibi servislerin kendi DPA'ları var. Onlarla standart sözleşme imzalanır. Ama Upstash ve Cloudflare'in konumu belirsiz olabilir.

### KVKK ile GDPR Farkları

| Konu | GDPR (AB) | KVKK (TR) |
|------|-----------|-----------|
| Ceza üst limiti | €20M veya %4 ciro | ~€500K (17M TL) |
| VERBİS | Yok | Zorunlu (eşik aşılırsa) |
| Cross-border | SCC/adequacy | KVKK Kurulu onayı + standart sözleşme |
| İhlal bildirimi | 72 saat | "Gecikmeksizin" (süre belirsiz) |
| Açık rıza | Birçok alternatif var | Daha sıkı, özellikle özel verilerde |

---

## 3. GLOBAL — GDPR DURUMU

### GDPR Article 28 — DPA Zorunluluğu

Bir şirket (controller) verilerini senin (processor) üzerinden işliyorsa, aranızda yazılı DPA olmalı.

**DPA'da olması gerekenler (Article 28/3):**
1. İşlemenin konusu ve süresi
2. İşlemenin niteliği ve amacı
3. Kişisel veri türleri ve veri sahipleri kategorileri
4. Controller'ın hak ve yükümlülükleri
5. Sadece talimatlar doğrultusunda işlem
6. Gizlilik yükümlülüğü
7. Güvenlik önlemleri (Article 32)
8. Alt-işleyici koşulları
9. Veri sahibi haklarına yardım
10. Hizmet sonunda veri silme veya iade
11. Denetim hakları
12. İhlal bildirimi

### Mevcut Privacy Policy Eksikleri

| # | Eksik | GDPR Maddesi | Önem |
|---|-------|-------------|------|
| 1 | Veri sorumlusu tanımlanmamış (adres, tüzel kişilik) | Art. 13(1)(a) | 🔴 |
| 2 | Her işlem için legal basis belirtilmemiş | Art. 6 | 🔴 |
| 3 | DPO (Veri Koruma Sorumlusu) yok | Art. 37 | 🟡 |
| 4 | Cookie consent banner yok | ePrivacy Directive | 🔴 |
| 5 | Sub-processor listesi yok | Art. 28(2) | 🔴 |
| 6 | Cross-border transfer detayı eksik (hangi SCC?) | Art. 46 | 🟡 |
| 7 | Breach notification prosedürü eksik | Art. 33-34 | 🟡 |
| 8 | Privacy by design açıklaması yok | Art. 25 | 🟡 |
| 9 | Veri saklama sonrası imha prosedürü yok | Art. 17 | 🟡 |
| 10 | Denetim hakkı detayı yok | Art. 28(3)(h) | 🟡 |

### Mevcut ToS Eksikleri

| # | Eksik | Önem |
|---|-------|------|
| 1 | Plan isimleri eski ($49/$149) | 🔴 |
| 2 | "Best effort" SLA yetersiz | 🟡 |
| 3 | İhlal durumunda sorumluluk limiti belirsiz | 🟡 |
| 4 | Fesih sonrası veri silme prosedürü eksik | 🟡 |

---

## 4. TÜRKİYE — E-TİCARET VE VERGİ

### Polar.sh Kullanımı (MoR — Merchant of Record)

Polar.sh MoR olarak hareket eder. Bu demek ki:
- ✅ Fatura düzenleme → Polar.sh halleder
- ✅ KDV hesaplama → Polar.sh halleder
- ✅ Uluslararası ödeme → Polar.sh halleder
- ❌ KVKK → Hâlâ senin sorumluluğun
- ❌ Türkiye'de şirket kurma → Hâlâ gerekebilir

### Mesafeli Satış Sözleşmesi

Türkiye'de online satış yapanlar için zorunlu. Ama Polar.sh MoR olduğu için bu sözleşme Polar.sh tarafından sağlanır. Senin ayrıca yapmana gerek yok — ama Polar.sh'in TR'ye satış yapıp yapmadığını kontrol et.

### Fatura Düzenleme

Polar.sh fatura keser. Ama Türkiye'deki müşteriler için e-fatura gerekebilir. Bu konu belirsiz — şirket kurulunca netleşir.

### Vergi

| Konu | Durum |
|------|-------|
| KDV | Polar.sh MoR → onlar halleder |
| Gelir vergisi | Türkiye'de ikamet ediyorsan, gelirini beyan etmen gerekir |
| Stopaj | Yurtdışından gelen gelir için stopaj olabilir |
| Beyanname | Yıllık gelir beyannamesi gerekli olabilir |

**Not:** Bu konular karmaşık. İlk $500-1000 gelir gelince bir mali müşavire danış.

---

## 5. RAKİP KARŞILAŞTIRMA

| Belge | Svix | Hookdeck | Hook0 | HookSniff |
|-------|------|----------|-------|-----------|
| Privacy Policy | ✅ Detaylı | ✅ | ✅ | ✅ Temel |
| Terms | ✅ | ✅ | ✅ | ✅ Temel |
| DPA | ✅ | ✅ | ❌ | ❌ |
| Sub-processors | ✅ | ✅ | ❌ | ❌ |
| Cookie Policy | ✅ | ✅ | ❌ | ❌ |
| Trust Center | ✅ | ✅ (Vanta) | ❌ | ❌ |
| SOC 2 | ✅ | ✅ | ❌ | ❌ |
| SLA | ✅ | ✅ | ❌ | ❌ |
| Status Page | ✅ | ✅ | ❌ | ❌ |

**Svix:** ABD Delaware C-Corp, SOC 2 Type II, Vanta compliance, HIPAA BAA.
**Hookdeck:** Kanada, SOC 2, Vanta, Trust Center.
**Hook0:** Açık kaynak, self-hosted, minimal yasal belge.

---

## 6. GERÇEK RİSK DEĞERLENDİRMESİ

### $0 Bütçe ile Lansman Riskleri

| Senaryo | Olasılık | Sonuç | Ne Yapmalı |
|---------|----------|-------|------------|
| Küçük developer kullanır, kimse sormaz | %85 | Sorun yok | — |
| B2B müşteri DPA ister | %30 | Satış kaybedilir | DPA template hazır olmalı |
| TR müşteri KVKK şikayeti | %5 | ~17M TL ceza | Aydınlatma metni ekle |
| AB müşteri GDPR şikayeti | %2 | €20M ceza (uygulanması zor) | Privacy Policy düzelt |
| Ödeme sağlayıcısı sorgular | %5 | Hesap askıya alınır | Polar.sh MoR, düşük risk |
| Maliye sorgular | %10 | Vergi cezası | Mali müşavire danış |

### En Büyük Risk: DPA Olmaması

B2B müşteri gelirse ve DPA yoksa:
- Satışı kaybedersin (%30 olasılık)
- Ama DPA template'i yazarsın, bu risk düşer

### En Küçük Risk: GDPR Cezası

- AB'de ofisin yok
- Türkiye'de küçük bir bireysel girişimcisn
- AB otoritelerinin sana ceza verme ihtimali çok düşük
- Ama AB'li müşterilerin verilerini işliyorsan, teorik risk var

---

## 7. NE YAPILACAK? (SIRALI — $0 BÜTÇE)

### Acil (Lansmandan önce) — 4 saat

| # | Ne | Süre | Kaynak |
|---|-----|------|--------|
| 1 | Privacy Policy'ye legal basis ekle (her madde için) | 1 saat | GDPR.eu template |
| 2 | ToS plan isimlerini güncelle ($29/$99) | 15 dk | — |
| 3 | Cookie consent banner ekle | 2 saat | open-source (CookieConsent) |
| 4 | Sub-processor listesi oluştur | 30 dk | Mevcut servislerden |

### Önemli (İlk hafta) — 3 saat

| # | Ne | Süre | Kaynak |
|---|-----|------|--------|
| 5 | DPA template yaz (GDPR Art. 28 uyumlu) | 2 saat | GDPR.eu template |
| 6 | KVKK aydınlatma metni ekle | 1 saat | KVKK şablonu |

### Orta Vadeli (İlk ay) — 2 saat

| # | Ne | Süre | Kaynak |
|---|-----|------|--------|
| 7 | Cookie Policy ayrı sayfa | 30 dk | — |
| 8 | Privacy Policy'yi KVKK formatına çevir | 1 saat | — |
| 9 | ToS'ye fesih sonrası veri silme prosedürü ekle | 30 dk | — |

### Şirket Kurulunca

| # | Ne | Maliyet |
|---|-----|---------|
| 10 | VERBİS kaydı | $0 (online) |
| 11 | Veri işleme envanteri | $0 |
| 12 | Mali müşavir | $50-100/ay |
| 13 | Hukukçu kontrolü | $200-300 (tek seferlik) |

---

## 8. DPA TEMPLATE — GDPR ARTICLE 28 UYUMLU

Aşağıdaki template, GDPR.eu'un resmi template'inden uyarlanmıştır. HookSniff'e özeldir.

**Kullanım:** B2B müşteri "DPA imzala" dediğinde bu template'i gönder. Tarih ve imza alanlarını doldur.

---

### DATA PROCESSING AGREEMENT

Bu Veri İşleme Sözleşmesi ("DPA"), HookSniff hizmetlerini kullanan müşteri ("Controller") ile HookSniff ("Processor") arasında yapılır.

**1. Tanımlar**
- Controller: HookSniff üzerinden webhook verisi gönderen müşteri
- Processor: Controller adına veri işleyen HookSniff
- Kişisel Veri: Tanımlanabilir gerçek kişiye ilişkin herhangi bir bilgi
- Alt-işleyici: HookSniff'in hizmet sağlamak için kullandığı üçüncü taraf servisler

**2. Kapsam**
HookSniff, Controller'ın webhook payload'larını yalnızca endpoint'lere teslim etmek amacıyla işler. Verileri analiz etmez, satmaz veya reklam amacıyla kullanmaz.

**3. İşlenen Veri Türleri**
- Webhook payload'ları (Controller'ın gönderdiği JSON verisi)
- Endpoint URL'leri
- Teslimat logları (zaman damgaları, yanıt kodları)
- API anahtarları (SHA-256 hash)
- Hesap bilgileri (e-posta, isim)

**4. Alt-işleyiciler**

| Servis | Amaç | Konum | DPA |
|--------|------|-------|-----|
| Google Cloud Platform | API hosting | EU (europe-west1) | ✅ |
| Neon | Veritabanı | EU (eu-central-1) | ✅ |
| Upstash | Redis cache | Global | ✅ |
| Vercel | Dashboard | Global | ✅ |
| Cloudflare | CDN, depolama | Global | ✅ |
| Stripe | Ödeme (global) | US | ✅ |
| Polar.sh | Ödeme (MoR) | EU | ✅ |
| iyzico | Ödeme (TR) | TR | ✅ |
| Grafana Cloud | Monitoring | EU | ✅ |

Yeni alt-işleyici eklendiğinde 30 gün önce bildirim yapılır.

**5. Veri Konumu**
Veriler primarily EU'da (europe-west1, eu-central-1) işlenir ve saklanır. Bazı alt-işleyiciler AB dışında işleyebilir — bu durumda Standart Sözleşme Maddeleri (SCC) uygulanır.

**6. Güvenlik Önlemleri**
- Transit: TLS 1.2+
- Depolama: Veritabanı şifreleme
- API anahtarları: SHA-256 hash
- Webhook imzaları: HMAC-SHA256
- Şifreler: Argon2 hash
- SSRF koruması
- Rate limiting

**7. Veri Saklama**

| Veri | Süre |
|------|------|
| Webhook payload'ları | Plan bazında (7/30/90 gün) |
| Teslimat logları | Plan bazında (7/30/90 gün) |
| Hesap verileri | Hesap aktif + 30 gün |
| API logları | 30 gün |

Süre sonunda veriler kalıcı olarak silinir.

**8. Veri Sahibi Hakları**
HookSniff, Controller'a şu konularda yardımcı olur:
- Erişim: `GET /v1/auth/export`
- Silme: `DELETE /v1/auth/account`
- Düzeltme: `PUT /v1/auth/profile`
- Taşınabilirlik: JSON dışa aktarma

**9. İhlal Bildirimi**
Kişisel veri ihlali durumunda HookSniff, Controller'ı 72 saat içinde bilgilendirir.

**10. Denetim Hakları**
Controller, HookSniff'in güvenlik uygulamaları hakkında bilgi talep edebilir. Yerinde denetim 30 gün önceden bildirim gerektirir.

**11. Süre ve Fesih**
Bu DPA, Controller HookSniff hizmetlerini kullandığı sürece geçerlidir. Fesih sonrası HookSniff 30 gün içinde tüm Controller verilerini siler.

**12. Geçerli Hukuk**
Bu DPA Türkiye yasalarına tabidir. GDPR amaçları doğrultusunda HookSniff, GDPR Article 28 kapsamında veri işlemci yükümlülüklerini kabul eder.

---

**Controller:**
Ad: _________________________
Tarih: _________________________

**Processor (HookSniff):**
Ad: Servet Arslan
Tarih: _________________________

---

## 9. ÖZET TABLO

| Konu | Mevcut | Hedef | Acil mi? |
|------|--------|-------|----------|
| Privacy Policy | 🟡 Orta | ✅ İyi | 🔴 Evet |
| Terms of Service | 🟡 Orta | ✅ İyi | 🔴 Evet |
| DPA | ❌ | ✅ | 🔴 Evet |
| Cookie Policy | ❌ | ✅ | 🔴 Evet |
| Cookie consent banner | ❌ | ✅ | 🔴 Evet |
| Sub-processor listesi | ❌ | ✅ | 🔴 Evet |
| KVKK aydınlatma metni | ❌ | ✅ | 🟡 İlk hafta |
| Legal basis | ❌ | ✅ | 🔴 Evet |
| VERBİS kaydı | ❌ | ✅ | 🟢 Şirket kurulunca |
| Veri işleme envanteri | ❌ | ✅ | 🟢 Şirket kurulunca |
| SLA | ❌ | ✅ | 🟢 Opsiyonel |
| Trust Center | ❌ | ✅ | 🟢 Opsiyonel |
| SOC 2 | ❌ | ✅ | 🟢 İleride |

**Sonuç:** $0 bütçeyle lansman yapılabilir. Acil eksikler (DPA, cookie, legal basis, sub-processors) 4-5 saatte tamamlanır. İlk $300-500 gelir gelince hukukçu + mali müşavir. VERBİS ve KVKK tam uyum şirket kurulunca.

**Risk:** Küçük developer kullanırsa sorun yok. B2B müşteri gelirse DPA hazır olmalı. TR müşteri şikayeti düşük olasılık ama aydınlatma metni eklenmeli.

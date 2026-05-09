# HOOKSNIFF — YASAL DURUM RAPORU

> Son güncelleme: 2026-05-09
> Bütçe: $0 | Hukukçu: Yok

---

## 1. ÖZET

| Konu | Durum |
|------|-------|
| Privacy Policy | ✅ Var, eksikler var |
| Terms of Service | ✅ Var, güncellenmeli |
| DPA | ❌ Yok, template hazır |
| Cookie Policy | ❌ Yok |
| Cookie consent banner | ❌ Yok |
| Sub-processor listesi | ❌ Yok |
| KVKK aydınlatma metni | ❌ Yok |
| Legal basis | ❌ Yok |

**Toplam düzeltme süresi:** ~7 saat ($0)

---

## 2. MEVCUT BELGELER

### Privacy Policy — Eksikler

| # | Eksik | GDPR Maddesi | Önem |
|---|-------|-------------|------|
| 1 | Veri sorumlusu tanımlanmamış (adres, tüzel kişilik) | Art. 13(1)(a) | 🔴 |
| 2 | Her işlem için legal basis belirtilmemiş | Art. 6 | 🔴 |
| 3 | Cookie consent banner yok | ePrivacy | 🔴 |
| 4 | Sub-processor listesi yok | Art. 28(2) | 🔴 |
| 5 | Cross-border transfer detayı eksik | Art. 46 | 🟡 |
| 6 | Breach notification prosedürü eksik | Art. 33-34 | 🟡 |
| 7 | Privacy by design açıklaması yok | Art. 25 | 🟡 |
| 8 | Veri saklama sonrası imha prosedürü yok | Art. 17 | 🟡 |

### Terms of Service — Eksikler

| # | Eksik | Önem |
|---|-------|------|
| 1 | Plan isimleri eski ($49/$149 → $29/$99 olmalı) | 🔴 |
| 2 | Fesih sonrası veri silme prosedürü eksik | 🟡 |
| 3 | İhlal durumunda sorumluluk limiti belirsiz | 🟡 |

---

## 3. KVKK (TÜRKİYE)

### Ne Zaman Gerekli?

KVKK, Türkiye'deki veri sahiplerinin verilerini işleyen herkes için geçerli. HookSniff Türkiye'den müşteri alırsa → KVKK uygulanır.

### VERBİS Kayıt Zorunluluğu

| Koşul | Eşik | HookSniff |
|-------|------|-----------|
| Çalışan sayısı | 50+ | 0 → Muaf |
| Yıllık bilanço | 100M TL+ | 0 → Muaf |
| **Sonuç** | İkisi birden sağlanırsa muaf | **Şimdilik muaf** |

### 2026 KVKK Cezaları

| İhlal | Alt Limit | Üst Limit |
|-------|-----------|-----------|
| Aydınlatma yükümlülüğü | 85.437 TL | 1.709.200 TL |
| Veri güvenliği | 256.357 TL | 17.092.242 TL |
| VERBİS kayıt | 341.809 TL | 17.092.242 TL |

### Cross-Border Transfer

Veriler GCP europe-west1'e gidiyor. Alt-işleyicilerin kendi DPA'ları var → standart sözleşme yeterli.

---

## 4. GDPR (GLOBAL)

### DPA — GDPR Article 28

B2B müşteri veri gönderdiğinde aranızda yazılı DPA olmalı.

**Zorunlu maddeler:**
1. İşlemenin konusu ve süresi
2. İşlemenin niteliği ve amacı
3. Kişisel veri türleri
4. Sadece talimatlar doğrultusunda işlem
5. Gizlilik yükümlülüğü
6. Güvenlik önlemleri
7. Alt-işleyici koşulları
8. Veri sahibi haklarına yardım
9. Hizmet sonunda veri silme
10. Denetim hakları
11. İhlal bildirimi (72 saat)

**Template hazır** — B2B müşteri geldiğinde kullanılacak.

---

## 5. ALT-İŞLEYİCİLER

| Servis | Amaç | Konum | DPA |
|--------|------|-------|-----|
| Google Cloud Platform | API, Worker | EU (europe-west1) | ✅ |
| Neon | Veritabanı | EU (eu-central-1) | ✅ |
| Upstash | Redis cache | Global | ✅ |
| Vercel | Dashboard | Global | ✅ |
| Cloudflare | CDN, R2 storage | Global | ✅ |
| Stripe | Ödeme (global) | US | ✅ |
| Polar.sh | Ödeme (MoR) | EU | ✅ |
| Grafana Cloud | Monitoring | EU | ✅ |

---

## 6. ÖDEME STRATEJİSİ

### Aşama 1 — Şimdi ($0, şirket yok)

| Konu | Karar |
|------|-------|
| Sağlayıcı | **Polar.sh** (Merchant of Record) |
| Para birimi | TL fiyatı koyar, Polar.sh USD'ye çevirir |
| Şirket | Gerekmez |
| Fatura | Polar.sh keser |
| KDV | Polar.sh halleder |
| Komisyon | %4 + 40¢/işlem |

### Aşama 2 — $500+ gelir gelince

| Konu | Karar |
|------|-------|
| Şirket | Şahıs şirketi kur (~$50-100) |
| Sağlayıcı | Papara Ticari veya alternatif |
| Fatura | Kendi e-fatura |
| KDV | %20 KDV tahsil |
| Mali müşavir | $50-100/ay |
| Hukukçu | $200-300 (tek seferlik kontrol) |

### Esnaf Muaflığı

- Yıllık 1.580.000 TL'ye kadar satış → şirket gerekmez
- **Ama:** Sadece kendi ürettiğin fiziksel ürünler için geçerli
- **SaaS/hizmet satışı kapsam dışı**

---

## 7. RAKİP KARŞILAŞTIRMA

| Belge | Svix | Hookdeck | Hook0 | HookSniff |
|-------|------|----------|-------|-----------|
| Privacy Policy | ✅ | ✅ | ✅ | ✅ Temel |
| Terms | ✅ | ✅ | ✅ | ✅ Temel |
| DPA | ✅ | ✅ | ❌ | ❌ |
| Sub-processors | ✅ | ✅ | ❌ | ❌ |
| Cookie Policy | ✅ | ✅ | ❌ | ❌ |
| Trust Center | ✅ | ✅ | ❌ | ❌ |
| SOC 2 | ✅ | ✅ | ❌ | ❌ |

---

## 8. RİSK DEĞERLENDİRMESİ

| Senaryo | Olasılık | Sonuç |
|---------|----------|-------|
| Küçük developer kullanır | %85 | Sorun yok |
| B2B müşteri DPA ister | %30 | Template hazır |
| TR müşteri KVKK şikayeti | %5 | Aydınlatma metni eklenmeli |
| AB müşteri GDPR şikayeti | %2 | AB'de ofis yok, uygulanması zor |
| Maliye sorgular | %10 | Mali müşavir gerekir |

---

## 9. YAPILACAKLAR

### Acil (Lansmandan önce) — 4 saat

| # | Ne | Süre |
|---|-----|------|
| 1 | Privacy Policy'ye legal basis ekle | 1 saat |
| 2 | ToS plan isimlerini güncelle ($29/$99) | 15 dk |
| 3 | Cookie consent banner ekle | 2 saat |
| 4 | Sub-processor listesi oluştur | 30 dk |

### İlk Hafta — 3 saat

| # | Ne | Süre |
|---|-----|------|
| 5 | DPA template'i GitHub'a ekle | 30 dk |
| 6 | KVKK aydınlatma metni ekle | 1 saat |
| 7 | Cookie Policy ayrı sayfa | 30 dk |
| 8 | ToS'ye veri silme prosedürü ekle | 1 saat |

### $500+ Gelir Gelince

| # | Ne | Maliyet |
|---|-----|---------|
| 9 | Şirket kur (şahıs şirketi) | $50-100 |
| 10 | Mali müşavir | $50-100/ay |
| 11 | Hukukçu kontrolü | $200-300 |
| 12 | VERBİS kaydı | $0 |

---

## 10. DPA TEMPLATE

B2B müşteri "DPA imzala" dediğinde kullanılacak. GDPR Article 28 uyumlu. Template ayrı dosyada hazırlanacak, onay sonrası GitHub'a eklenecek.

---

## 11. SONUÇ

| Konu | Değerlendirme |
|------|---------------|
| $0 bütçeyle lansman | ✅ Yapılabilir |
| İlk 2-3 ay risk | Düşük |
| En büyük risk | DPA olmaması (B2B satış kaybı) |
| En küçük risk | GDPR cezası (AB'de ofis yok) |
| Hukukçu gerekli mi? | İlk $500+ gelir gelince evet |
| Şirket gerekli mi? | İlk $500+ gelir gelince evet |

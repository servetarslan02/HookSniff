# HookSniff — Yasal Belgeler Raporu

> Tarih: 2026-05-09
> Durum: Mevcut durum + eksikler + rakip karşılaştırma

---

## 1. Mevcut Durum

| Belge | Var mı? | Kalite | Not |
|-------|---------|--------|-----|
| Privacy Policy | ✅ Var | 🟡 Orta | 13 bölüm, temel konuları kapsıyor ama eksikler var |
| Terms of Service | ✅ Var | 🟡 Orta | 16 bölüm, standart yapı ama güncellenmeli |
| DPA | ❌ Yok | — | B2B satış için zorunlu |
| Cookie Policy | ❌ Yok | — | GDPR/KVKK uyumluluğu için gerekli |
| Sub-processor Listesi | ❌ Yok | — | GDPR Article 28 gereklilik |
| SLA | ❌ Yok | — | Enterprise müşteri için gerekli |

---

## 2. Türkiye (KVKK) Durumu

### KVKK Nedir?

Türkiye'nin GDPR karşılığı. 2016'da yürürlüğe girdi. Avrupa Birliği'ndeki GDPR ile büyük ölçüde uyumlu ama bazı farklılıklar var.

### HookSniff'in KVKK Karşısındaki Durumu

| Konu | Durum | Açıklama |
|------|-------|----------|
| Veri Sorumlusu | 🟡 Belirsiz | Privacy Policy'de "HookSniff" yazıyor ama tüzel kişilik yok |
| VERBİS Kaydı | ❌ Yapılmadı | Yıllık çalışan sayısı veya mali bilanço eşiklerini aşınca zorunlu |
| Açık Rıza | 🟡 Eksik | Kayıt formunda açık rıza metni yok |
| Aydınlatma Metni | 🟡 Eksik | Privacy Policy var ama KVKK formatına uymuyor |
| Veri İşleme Envanteri | ❌ Yok | Zorunlu |
| İrtibat Kişisi | ❌ Yok | Zorunlu (veri sorumlusu tüzel kişilikse) |
| Cross-border Transfer | 🟡 Eksik | Veriler ABD'ye (GCP) gidiyor, KVKK ek tedbir gerektiriyor |

### KVKK ile GDPR Farkları

| Konu | GDPR (AB) | KVKK (TR) |
|------|-----------|-----------|
| Kapsam | AB'deki veri sahipleri | TR'deki veri sahipleri |
| Ceza | €20M veya %4 ciro | ~€180K (2025 güncel) |
| VERBİS | Yok | Zorunlu (eşik aşılırsa) |
| Cross-border | SCC/adequacy | KVKK Kurulu onayı + ek tedbirler |
| Raporlama | 72 saat | "Gecikmeksizin" |
| DPO | Bazı durumlarda zorunlu | Zorunlu değil (önerilir) |

### Ne Yapmalı?

1. **Şu an:** Küçük startup, KVKK ceza riski düşük. Ama büyüdükçe uyum şart.
2. **Şirket kurulunca:** VERBİS kaydı, veri işleme envanteri, irtibat kişisi.
3. **Hemen:** Privacy Policy'ye KVKK uyumlu aydınlatma metni ekle.

---

## 3. Global (GDPR) Durumu

### Mevcut Privacy Policy Analizi

**İyi olanlar:**
- ✅ Veri toplama açıklaması (bölüm 2)
- ✅ Veri kullanımı (bölüm 3)
- ✅ Veri paylaşımı (bölüm 5)
- ✅ Veri güvenliği (bölüm 6)
- ✅ Veri saklama süreleri (bölüm 7)
- ✅ Haklar (bölüm 8)
- ✅ Çocuk gizliliği (bölüm 11)
- ✅ İletişim (bölüm 13)

**Eksikler:**

| # | Eksik | Önem | Açıklama |
|---|-------|------|----------|
| 1 | Veri sorumlusu tanımlanmamış | 🔴 | Tüzel kişilik/adres yok |
| 2 | DPO (Veri Koruma Sorumlusu) yok | 🟡 | Zorunlu değil ama önerilir |
| 3 | Cookie consent banner yok | 🔴 | GDPR zorunlu |
| 4 | Cookie Policy ayrı yok | 🟡 | Privacy Policy'de kısa bahsedilmiş |
| 5 | Sub-processor listesi yok | 🔴 | GDPR Article 28 |
| 6 | Cross-border transfer detayı yok | 🟡 | "Standard Contractual Clauses" denmiş ama detay yok |
| 7 | Legal basis (hukuki dayanak) eksik | 🔴 | Her veri işleme için hukuki dayanak belirtilmeli |
| 8 | Retention sonrası imha prosedürü yok | 🟡 | "Silinir" denmiş ama nasıl silindiği açıklanmamış |
| 9 | Breach notification prosedürü yok | 🟡 | 72 saat kuralı |
| 10 | Privacy by design açıklaması yok | 🟡 | GDPR Article 25 |

---

## 4. Rakip Karşılaştırma

### Yasal Belgeler

| Belge | Svix | Hookdeck | Hook0 | HookSniff |
|-------|------|----------|-------|-----------|
| Privacy Policy | ✅ Detaylı | ✅ | ✅ | ✅ Temel |
| Terms of Service | ✅ | ✅ "Terms of Use" | ✅ | ✅ Temel |
| DPA | ✅ | ✅ | ❌ | ❌ |
| Sub-processors | ✅ | ✅ | ❌ | ❌ |
| Cookie Policy | ✅ | ✅ | ❌ | ❌ |
| Trust Center | ✅ | ✅ (Vanta) | ❌ | ❌ |
| Security Page | ✅ | ✅ | ✅ | 🟡 SECURITY.md |
| SLA | ✅ | ✅ | ❌ | ❌ |
| Status Page | ✅ status.svix.com | ✅ | ❌ | ❌ |
| SOC 2 | ✅ | ✅ (Vanta) | ❌ | ❌ |
| GDPR DPA | ✅ | ✅ | ❌ | ❌ |
| HIPAA BAA | ✅ | ❌ | ❌ | ❌ |

### Svix'in Yasal Yapısı

- ABD şirketi (Delaware C-Corp)
- SOC 2 Type II sertifikalı
- Vanta ile compliance otomasyonu
- Trust Center sayfası (güvenlik politikaları, sertifikalar)
- DPA template'i hazır, otomatik doldurulabilir
- Sub-processor listesi güncel
- HIPAA BAA (sağlık sektörü için)

### Hookdeck'in Yasal Yapısı

- Kanada şirketi
- SOC 2 sertifikalı (Vanta)
- Trust Center sayfası
- DPA template'i hazır
- Sub-processor listesi güncel
- "Terms of Use" (ToS değil)

### Hook0'un Yasal Yapısı

- Açık kaynak, self-hosted odaklı
- Temel Privacy Policy ve ToS
- DPA, sub-processor, SOC 2 yok
- Self-hosted'da veri kullanıcıda olduğu için daha az yasal yük

---

## 5. Türkiye'de SaaS Yasal Gereklilikler

### Zorunlu Belgeler

| Belge | Zorunlu mu? | Ne zaman |
|-------|-------------|----------|
| Vergi levhası | ✅ | Satış yapmadan önce |
| Ticaret sicil kaydı | ✅ | Şirket kurulunca |
| KVKK aydınlatma metni | ✅ | Veri toplamaya başlayınca |
| VERBİS kaydı | 🟡 | Eşik aşılırsa (yıllık çalışan + mali bilanço) |
| E-ticaret lisansı | 🟡 | Online satış yapınca |
| Mesafeli satış sözleşmesi | ✅ | Online satış yapınca |
| Cayma hakkı formu | ✅ | Online satış yapınca |
| Fatura düzenleme | ✅ | Satış yapınca |

### Türkiye'de Satış Yaparken

1. **Şirket kurmadan:** Polar.sh MoR (Merchant of Record) kullan → Polar.sh vergiyi halleder
2. **Şirket kurulunca:** iyzico + kendi fatura düzenin
3. **KVKK:** Türkiye'deki müşterilerin verileri için KVKK uyumlu aydınlatma metni zorunlu

---

## 6. Eksikler ve Öncelikler

### 🔴 Acil (Lansmandan önce)

| # | Ne | Süre | Maliyet |
|---|-----|------|---------|
| 1 | Privacy Policy'ye legal basis ekle | 1 saat | $0 |
| 2 | Cookie consent banner ekle | 2 saat | $0 (open-source) |
| 3 | Sub-processor listesi oluştur | 30 dk | $0 |
| 4 | ToS'deki plan isimlerini güncelle ($29/$99) | 15 dk | $0 |

### 🟡 Önemli (İlk ay)

| # | Ne | Süre | Maliyet |
|---|-----|------|---------|
| 5 | DPA template oluştur | 2 saat | $0 (template) |
| 6 | KVKK aydınlatma metni ekle | 1 saat | $0 |
| 7 | Cookie Policy ayrı sayfa | 30 dk | $0 |
| 8 | Privacy Policy'yi KVKK formatına çevir | 1 saat | $0 |

### 🟢 İyi Olur (Şirket kurulunca)

| # | Ne | Süre | Maliyet |
|---|-----|------|---------|
| 9 | VERBİS kaydı | 1 gün | $0 |
| 10 | Veri işleme envanteri | 2 saat | $0 |
| 11 | SLA belgesi | 1 saat | $0 |
| 12 | Trust Center sayfası | 1 gün | $0-500 |
| 13 | SOC 2 (opsiyonel) | 3-6 ay | $5K-20K |

---

## 7. Sub-processor Listesi (Öneri)

HookSniff'in kullandığı üçüncü taraf servisler:

| Servis | Amaç | Konum | DPA var mı? |
|--------|------|-------|-------------|
| Google Cloud Platform | Hosting, API, Worker | ABD (europe-west1) | ✅ |
| Neon | PostgreSQL veritabanı | AB (eu-central-1) | ✅ |
| Upstash | Redis cache | ABD | ✅ |
| Vercel | Dashboard hosting | ABD | ✅ |
| Cloudflare | CDN, R2 storage | Global | ✅ |
| Stripe | Ödeme (global) | ABD | ✅ |
| Polar.sh | Ödeme (MoR) | AB | ✅ |
| iyzico | Ödeme (TR) | Türkiye | ✅ |
| Grafana Cloud | Monitoring | AB | ✅ |

---

## 8. Özet

| Konu | HookSniff | Svix | Hedef |
|------|-----------|------|-------|
| Privacy Policy | 🟡 Orta | ✅ İyi | ✅ İyi |
| Terms of Service | 🟡 Orta | ✅ İyi | ✅ İyi |
| DPA | ❌ Yok | ✅ Var | ✅ Olmalı |
| Cookie Policy | ❌ Yok | ✅ Var | ✅ Olmalı |
| Sub-processors | ❌ Yok | ✅ Var | ✅ Olmalı |
| KVKK uyumu | ❌ Yok | N/A (ABD) | ✅ Olmalı |
| Trust Center | ❌ Yok | ✅ Var | 🟡 Opsiyonel |
| SOC 2 | ❌ Yok | ✅ Var | 🟡 Opsiyonel |

**Sonuç:** Mevcut belgeler temel düzeyde yeterli ama B2B satış ve global lansman için eksikler var. DPA ve sub-processor listesi olmadan kurumsal müşteri kazanmak zor. KVKK uyumu Türkiye satışları için şart.

**Maliyet:** Tüm düzeltmeler $0 (kendimiz yazarız). SOC 2 ve Trust Center ileride, şirket kurulunca.

---

## 9. Servet'in Yapması Gereken

| Sıra | Ne | Öncelik |
|------|-----|---------|
| 1 | Şirket kurma kararı (ne zaman?) | 🟡 |
| 2 | DPA template onayı | 🔴 |
| 3 | Cookie consent banner onayı | 🔴 |
| 4 | KVKK aydınlatma metni onayı | 🟡 |
| 5 | Hukukçu kontrolü (opsiyonel, $100-300) | 🟢 |

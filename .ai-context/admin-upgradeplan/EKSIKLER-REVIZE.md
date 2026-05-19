# 🎯 HookSniff Eksikler — Revize Edilmiş Tam Liste

> **Tarih:** 2026-05-20 00:58 GMT+8
> **Kaynak:** Kullanıcı paneli analizi + Admin paneli analizi + 8 rakip karşılaştırması
> **Kriter:** Rakiplerde var + HookSniff'de yok + Gerçek etki yüksek = Önce yap

---

## 📊 Durum Özeti

| Metrik | Değer |
|--------|-------|
| Toplam incelenen rakip | 8 (Stripe, Svix, Hookdeck, Convoy, Hook0, Baremetrics, ChurnBuster, Paddle) |
| Mevcut özellik sayısı | 100+ |
| Tespit edilen eksik | 35 |
| Kritik eksik | 6 |
| Önemli eksik | 12 |
| İyi olur | 17 |

---

## 🔴 KRİTİK — Bu Hafta Yapılmalı (6 Eksik)

Bu eksikler **her rakipte var** ve **doğrudan gelir/kullanıcı etkiliyor**.

### 1. Kullanıcı Davet Sistemi
**Durum:** ❌ Yok
**Rakiplerde:** Stripe ✅, Auth0 ✅, Clerk ✅, WorkOS ✅
**Etki:** Büyüme engeli — yeni kullanıcı sadece register formuyla gelebilir

**Ne yapılacak:**
- Admin panelinde "Kullanıcı Davet Et" butonu
- Email ile davet linki gönderimi
- Davet linki ile kayıt (email önceden doldurulmuş)
- Davet geçmişi (kime gönderildi, kabul edildi mi)
- Bulk davet (CSV ile toplu davet)

**Dosyalar:**
- Backend: `api/src/routes/admin.rs` → `POST /admin/users/invite`
- Frontend: `admin/users/page.tsx` → Davet modal
- Email: Davet email şablonu

**Süre:** 1 oturum

---

### 2. Şifre Sıfırlama (Admin Tarafından)
**Durum:** ❌ Yok
**Rakiplerde:** Stripe ✅, Auth0 ✅, Firebase ✅
**Etki:** Kullanıcı şifresini unutursa admin yardımcı olamıyor

**Ne yapılacak:**
- Admin kullanıcı detayında "Şifre Sıfırla" butonu
- Kullanıcıya sıfırlama linki email ile gönderimi
- Alternatif: Geçici şifre oluşturma

**Dosyalar:**
- Backend: `api/src/routes/admin.rs` → `POST /admin/users/{id}/reset-password`
- Frontend: `admin/users/[id]/components/UserModals.tsx`

**Süre:** 0.5 oturum

---

### 3. Dunning (Başarısız Ödeme Kurtarma)
**Durum:** ❌ Yok
**Rakiplerde:** Stripe ✅, Paddle ✅, ChurnBuster ✅
**Etki:** Her başarısız ödeme = kayıp gelir. Sektör ortalaması %5-15 kurtarma oranı

**Ne yapılacak:**
- Başarısız ödeme tespiti (Polar.sh webhook: `payment.failed`)
- Otomatik email dizisi (1. gün, 3. gün, 7. gün, 14. gün)
- Kart güncelleme linki (tek tıkla)
- Grace period yönetimi (askıya alma)
- Kurtarma analytics (hangi email kurtardı)
- Dashboard'da dunning section

**Dosyalar:**
- Backend: Yeni module `api/src/dunning.rs`
- Backend: `api/src/routes/billing.rs` → Dunning webhook handler
- Frontend: `admin/revenue/page.tsx` → Dunning section
- DB: `dunning_campaigns`, `dunning_emails` tabloları

**Süre:** 2 oturum

---

### 4. Customer Health Score
**Durum:** ❌ Yok
**Rakiplerde:** Baremetrics ✅, Paddle ✅, Gainsight ✅
**Etki:** Churn tahmini — risk altındaki müşterileri önceden tespit et

**Ne yapılacak:**
- Skor hesaplama formülü:
  ```
  Health Score = (Usage Trend × 0.3) + (Payment Status × 0.25) + 
                (Endpoint Health × 0.2) + (Engagement × 0.15) + (Support × 0.1)
  ```
- Kullanım trendi (son 30 gün vs önceki 30 gün)
- Ödeme durumu (güncel/gecikmiş/başarısız)
- Endpoint sağlık durumu (aktif/pasif/hatalı)
- Engagement (login sıklığı, API çağrıları)
- Dashboard'da health score kartları (yeşil/sarı/kırmızı)
- Admin panelinde "At-Risk Customers" listesi

**Dosyalar:**
- Backend: Yeni module `api/src/health_score.rs`
- Backend: `api/src/routes/admin.rs` → `GET /admin/users/{id}/health-score`
- Frontend: `admin/users/page.tsx` → Health score kolonu
- DB: `customer_health_scores` tablosu (cache)

**Süre:** 1.5 oturum

---

### 5. Promosyon/Kupon Kodu Sistemi
**Durum:** ❌ Yok
**Rakiplerde:** Stripe ✅, Paddle ✅, Chargebee ✅
**Etki:** Kampanya yapamıyoruz, growth engeli

**Ne yapılacak:**
- Kupon kodu oluşturma (admin panelinde)
  - Tip: percentage (% off) veya fixed ($ off)
  - Süre: bir kerelik veya sürekli
  - Limit: kullanım sayısı
  - Plan bazlı: hangi planlar için geçerli
  - Tarih aralığı: başlangıç/bitiş
- Kupon doğrulama (checkout'ta)
- Kullanım analytics (kaç kişi kullandı, ne kadar indirim)
- Dashboard'da kupon yönetimi

**Dosyalar:**
- Backend: Yeni module `api/src/coupons.rs`
- Backend: `api/src/routes/billing.rs` → Kupon doğrulama
- Frontend: `admin/revenue/page.tsx` → Kupon yönetimi section
- DB: `coupons`, `coupon_usages` tabloları

**Süre:** 2 oturum

---

### 6. Revenue Forecast (Gelir Projeksiyonu)
**Durum:** ❌ Yok
**Rakiplerde:** Stripe ✅, Baremetrics ✅, ProfitWell ✅
**Etki:** İş planı, yatırımcı sunumu, büyüme planlaması

**Ne yapılacak:**
- Basit projeksiyon modeli:
  ```
  Forecast MRR = Current MRR × (1 + Growth Rate) ^ months
  - Best Case: %15 aylık büyüme
  - Base Case: %8 aylık büyüme
  - Worst Case: %2 aylık büyüme
  ```
- 3/6/12 aylık projeksiyon grafiği
- Churn etkisi dahil
- Expansion revenue dahil
- Dashboard'da forecast kartı

**Dosyalar:**
- Backend: `api/src/routes/admin/revenue.rs` → Forecast endpoint
- Frontend: `admin/revenue/components/RevenueContent.tsx` → Forecast chart

**Süre:** 1 oturum

---

## 🟡 ÖNEMLİ — Gelecek Hafta (12 Eksik)

### 7. Platform Status Page
**Durum:** ❌ Yok
**Rakiplerde:** Stripe ✅, Svix ✅, GitHub ✅, Atlassian ✅
**Etki:** Kullanıcılara "şu an sorun var" diyemiyoruz

**Ne yapılacak:**
- Public `/status` sayfası (auth gerektirmez)
- Sistem durumu göstergesi (operational/degraded/outage)
- Incident yönetimi (admin panelinden incident oluştur)
- Incident timeline (başlangıç, güncelleme, çözüm)
- Email bildirimi (incident olduğunda)
- Status page embed (müşteri kendi sitesine koyabilir)

**Süre:** 1.5 oturum

---

### 8. Session Yönetimi
**Durum:** ❌ Yok
**Rakiplerde:** Stripe ✅, Auth0 ✅, Clerk ✅
**Etki:** Güvenlik — şüpheli oturumları kapatamıyoruz

**Ne yapılacak:**
- Aktif oturum listesi (cihaz, IP, tarih, konum)
- Tek oturum kapatma
- Tüm oturumları kapatma
- Şüpheli oturum uyarısı (farklı IP/cihaz)
- Admin: Kullanıcının oturumlarını gör/kapat

**Süre:** 1 oturum

---

### 9. Cancel Flow (İptal Akışı)
**Durum:** ❌ Yok
**Rakiplerde:** Paddle ✅, ChurnBuster ✅, ProfitWell ✅
**Etki:** Churn engelleme — iptal eden %15-30 geri kazanılabilir

**Ne yapılacak:**
- İptal butonuna basıldığında özel akış:
  1. "Neden iptal ediyorsunuz?" (anket)
  2. Çözüm önerileri (indirim, downgrade, pause)
  3. Teklif sunma (%20 indirim, 3 ay ücretsiz)
  4. Son onay
- İptal nedeni analytics
- Admin panelinde iptal nedenleri raporu

**Süre:** 1.5 oturum

---

### 10. Broadcast Notification
**Durum:** ❌ Yok
**Rakiplerde:** Stripe ✅, Intercom ✅
**Etki:** Maintenance, feature announcement yapamıyoruz

**Ne yapılacak:**
- Admin panelinde "Bildirim Gönder" formu
- Hedef: tüm kullanıcılar, plan bazlı, segment bazlı
- Kanal: in-app + email
- Şablon desteği
- Gönderim geçmişi

**Süre:** 0.5 oturum

---

### 11. Webhook Queue Yönetimi
**Durum:** ⚠️ Kısmen var (queue status)
**Rakiplerde:** Convoy ✅, Hookdeck ✅
**Etki:** Kuyrukta birikme varsa müdahale edemiyoruz

**Ne yapılacak:**
- Queue depth görselleştirme (grafik)
- Manuel queue temizleme
- Queue priority yönetimi
- Stuck delivery tespiti
- Queue capacity planning

**Süre:** 0.5 oturum

---

### 12. PDF Fatura
**Durum:** ❌ Yok
**Rakiplerde:** Stripe ✅, Paddle ✅
**Etki:** Profesyonellik, muhasebe ihtiyacı

**Ne yapılacak:**
- Fatura PDF oluşturma (server-side)
- Fatura listesinden PDF indirme
- Email ile fatura gönderimi
- Fatura şablonu (logo, adres, vergi bilgisi)

**Süre:** 1 oturum

---

### 13. Event Deduplication
**Durum:** ❌ Yok
**Rakiplerde:** Hookdeck ✅, Convoy ✅
**Etki:** Gereksiz teslimat azaltma, maliyet tasarrufu

**Ne yapılacak:**
- Event ID bazlı deduplication
- Zaman penceresi (örn: 5 dakika içinde aynı event → tek teslimat)
- Admin panelinde deduplication ayarları
- Deduplication analytics (kaç event filtrelendi)

**Süre:** 1 oturum

---

### 14. Circuit Breaker UI
**Durum:** ⚠️ Backend'de var, UI yok
**Rakiplerde:** Convoy ✅
**Etki:** Endpoint sağlık görselleştirme

**Ne yapılacak:**
- Endpoint detayında circuit breaker durumu (closed/open/half-open)
- Manuel reset butonu
- Circuit breaker geçmişi
- Alert: circuit breaker açıldığında

**Süre:** 0.5 oturum

---

### 15. Kullanıcı Davet Geçmişi
**Durum:** ❌ Yok
**Rakiplerde:** Stripe ✅, Auth0 ✅
**Etki:** Hangi davetler kabul edildi, hangileri beklemede

**Ne yapılacak:**
- Davet listesi (kime gönderildi, tarih, durum)
- Davet iptal etme
- Davet yeniden gönderme
- Davet analytics (kabul oranı)

**Süre:** Davet sistemi ile birlikte

---

### 16. Onboarding Tracker
**Durum:** ❌ Yok
**Rakiplerde:** Mixpanel ✅, Amplitude ✅
**Etki:** Kullanıcılar kayıt olduktan sonra nerede bırakıyor

**Ne yapılacak:**
- Funnel analytics: Kayıt → İlk endpoint → İlk webhook → İlk teslimat
- Her adım için conversion oranı
- Drop-off noktaları tespiti
- Admin panelinde onboarding funnel grafiği

**Süre:** 1 oturum

---

### 17. API Usage Dashboard (Detaylı)
**Durum:** ⚠️ Kısmen var (usage tab)
**Rakiplerde:** Stripe ✅, AWS ✅
**Etki:** Kim çok kullanıyor, kim az kullanıyor

**Ne yapılacak:**
- Kullanıcı bazlı API çağrı istatistikleri
- Rate limit kullanımı (yaklaşma uyarısı)
- En çok API kullanan kullanıcılar listesi
- API çağrı trendi (grafik)
- Maliyet analizi (kullanım başına maliyet)

**Süre:** 1 oturum

---

### 18. Şüpheli Aktivite Tespiti
**Durum:** ❌ Yok
**Rakiplerde:** Stripe ✅, Auth0 ✅
**Etki:** Güvenlik

**Ne yapılacak:**
- Anormal davranış tespiti:
  - Birden fazla başarısız login
  - Farklı IP'den giriş
  - Ani API kullanım artışı
  - Olağandışı endpoint oluşturma
- Alert: şüpheli aktivite tespit edildiğinde
- Admin panelinde suspicious activity listesi
- Otomatik hesap kilitleme (opsiyonel)

**Süre:** 1.5 oturum

---

## 🟢 İYİ OLUR — Daha Sonra (17 Eksik)

### 19. IP Blocklist
**Durum:** ❌ Yok
**Süre:** 0.5 oturum

### 20. Manual Invoice (Elle Fatura)
**Durum:** ❌ Yok
**Süre:** 1 oturum

### 21. Deploy History
**Durum:** ❌ Yok (sadece son deploy bilgisi var)
**Süre:** 0.5 oturum

### 22. SMS Notification
**Durum:** ❌ Yok
**Süre:** 1 oturum

### 23. A/B Testing (Email)
**Durum:** ❌ Yok
**Süre:** 1.5 oturum

### 24. Geographic Dashboard
**Durum:** ❌ Yok
**Süre:** 1 oturum

### 25. Multi-Project
**Durum:** ❌ Yok
**Süre:** 3 oturum

### 26. White Label
**Durum:** ❌ Yok
**Süre:** 2 oturum

### 27. API Versioning Dashboard
**Durum:** ❌ Yok
**Süre:** 1 oturum

### 28. Webhook Debugging Timeline
**Durum:** ⚠️ Kısmen var
**Süre:** 1 oturum

### 29. Benchmark (Sektör Karşılaştırma)
**Durum:** ❌ Yok
**Süre:** 1 oturum

### 30. Cache Management (Redis)
**Durum:** ❌ Yok
**Süre:** 0.5 oturum

### 31. DB Migration Viewer
**Durum:** ❌ Yok
**Süre:** 0.5 oturum

### 32. Support Ticket System
**Durum:** ❌ Yok
**Süre:** 3 oturum

### 33. Changelog Generator
**Durum:** ❌ Yok
**Süre:** 1 oturum

### 34. ProfitWell Integration
**Durum:** ❌ Yok
**Süre:** 1 oturum

### 35. Customer Segmentation (Gelişmiş)
**Durum:** ❌ Yok
**Süre:** 1.5 oturum

---

## 📅 Uygulama Yol Haritası

### Hafta 1 (Bu Hafta) — Kritik Eksikler
| Gün | Özellik | Süre |
|-----|---------|------|
| 1 | Kullanıcı Davet Sistemi | 1 oturum |
| 1 | Şifre Sıfırlama (Admin) | 0.5 oturum |
| 2 | Dunning (Ödeme Kurtarma) | 2 oturum |
| 3 | Customer Health Score | 1.5 oturum |

**Toplam:** 5 oturum (5 gün)

### Hafta 2 — Gelir & Büyüme
| Gün | Özellik | Süre |
|-----|---------|------|
| 1 | Promosyon/Kupon Kodu | 2 oturum |
| 2 | Revenue Forecast | 1 oturum |
| 2 | Cancel Flow | 1.5 oturum |
| 3 | Broadcast Notification | 0.5 oturum |

**Toplam:** 5 oturum (5 gün)

### Hafta 3 — Altyapı & Güvenlik
| Gün | Özellik | Süre |
|-----|---------|------|
| 1 | Platform Status Page | 1.5 oturum |
| 1 | Session Yönetimi | 1 oturum |
| 2 | Webhook Queue Yönetimi | 0.5 oturum |
| 2 | Circuit Breaker UI | 0.5 oturum |
| 2 | Event Deduplication | 1 oturum |
| 3 | PDF Fatura | 1 oturum |

**Toplam:** 5.5 oturum (6 gün)

### Hafta 4 — Analytics & Güvenlik
| Gün | Özellik | Süre |
|-----|---------|------|
| 1 | Onboarding Tracker | 1 oturum |
| 1 | API Usage Dashboard | 1 oturum |
| 2 | Şüpheli Aktivite Tespiti | 1.5 oturum |
| 3 | Kullanıcı Davet Geçmişi | 0.5 oturum |

**Toplam:** 4 oturum (4 gün)

---

## 💰 ROI Analizi (Her Özelliğin Tahmini Etkisi)

| Özellik | Tahmini Gelir Etkisi | Neden |
|---------|---------------------|-------|
| Dunning | +$500-2000/ay | Her başarısız ödeme kurtarılan gelir |
| Kupon Kodu | +$300-1000/ay | Kampanya ile yeni müşteri |
| Cancel Flow | +$200-800/ay | İptal eden %15-30 geri kazanım |
| Health Score | +$200-500/ay | Churn engelleme |
| Kullanıcı Davet | +$100-400/ay | Viral büyüme |
| Revenue Forecast | Doğrudan gelir yok | Yatırımcı/iş planı için kritik |
| Status Page | Doğrudan gelir yok | Güvenilirlik, enterprise müşteri |
| PDF Fatura | Doğrudan gelir yok | Profesyonellik, muhasebe |

**Toplam tahmini etki:** +$1300-4700/ay

---

## 📊 Öncelik Matrisi

```
                    YÜKSEK ETKİ
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
    │   Dunning         │   Kupon Kodu      │
    │   Health Score    │   Cancel Flow     │
    │   Kullanıcı Davet │   Revenue Forecast│
    │                   │                   │
DÜŞÜK│───────────────────┼───────────────────│YÜKSEK
MALİYET│                   │                   │MALİYET
    │   Session Mgmt    │   Multi-Project   │
    │   Circuit Breaker │   White Label     │
    │   Status Page     │   Support Ticket  │
    │                   │                   │
    └───────────────────┼───────────────────┘
                        │
                    DÜŞÜK ETKİ
```

**Sol üst (hemen yap):** Dunning, Health Score, Kullanıcı Davet
**Sağ üst (yap ama planlayarak):** Kupon Kodu, Cancel Flow, Revenue Forecast
**Sol alt (kolay kazanımlar):** Session, Circuit Breaker, Status Page
**Sağ alt (ileride):** Multi-Project, White Label, Support Ticket

---

## 🎯 Sonuç

### En Kritik 3 Özellik (Bu Hafta)
1. **Dunning** — Her gün para kaybediyoruz
2. **Kullanıcı Davet** — Büyüme engeli
3. **Health Score** — Churn göremiyoruz

### En Kolay 3 Kazanım (Bu Hafta)
1. **Şifre Sıfırlama** — 0.5 oturum, hemen lazım
2. **Broadcast Notification** — 0.5 oturum, hemen lazım
3. **Circuit Breaker UI** — 0.5 oturum, backend hazır

### En Yüksek ROI
1. **Dunning** → +$500-2000/ay
2. **Kupon Kodu** → +$300-1000/ay
3. **Cancel Flow** → +$200-800/ay

---

## 📝 Notlar

- Tüm süreler "1 oturum = 1 saat" bazında hesaplandı
- Bazı özellikler birlikte yapılabilir (örn: Davet + Davet Geçmişi)
- Backend Rust, Frontend Next.js/TypeScript
- DB: Neon PostgreSQL, Cache: Upstash Redis
- Deploy: Google Cloud Build (API), Vercel (Dashboard)

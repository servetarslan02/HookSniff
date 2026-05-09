# HOOKSNIFF — DESTEK SİSTEMİ RAPORU

> Son güncelleme: 2026-05-09
> Bütçe: $0

---

## 1. MEVCUT DURUM

| Kanal | Durum | Detay |
|-------|-------|-------|
| Email | ✅ Var | support@hooksniff.vercel.app (Gmail API) |
| Contact form | ✅ Var | /contact sayfası, email'e yönlendiriyor |
| FAQ | ✅ Var | /faq sayfası, 15 soru |
| Docs | ✅ Var | /docs/api, /docs/sdks |
| Live chat | ❌ Yok | — |
| Ticket sistemi | ❌ Yok | — |
| Discord | ❌ Yok | — |
| Knowledge base | ❌ Yok | FAQ var ama kapsamlı değil |
| Status page | ❌ Yok | /status sayfası var ama boş |
| Chatbot | ❌ Yok | — |

---

## 2. RAKİP KARŞILAŞTIRMA

| Kanal | Svix | Hookdeck | Hook0 | HookSniff |
|-------|------|----------|-------|-----------|
| Email | ✅ | ✅ | ❌ | ✅ |
| Docs | ✅ Detaylı | ✅ | ✅ | ✅ Temel |
| Slack | ✅ | ✅ | ❌ | ❌ |
| Discord | ❌ | ❌ | ❌ | ❌ |
| GitHub Issues | ✅ | ✅ | ✅ | ✅ (SDK'lar) |
| Status page | ✅ | ✅ | ❌ | ❌ |
| Live chat | ❌ | ❌ | ❌ | ❌ |
| Trust center | ✅ | ✅ | ❌ | ❌ |

**Not:** Svix ve Hookdeck bile live chat kullanmıyor. Developer tool'larda email + docs + Slack standart.

---

## 3. ÜCRETSİZ DESTEK ARAÇLARI

### tawk.to — ⭐ En İyi Ücretsiz Seçenek

| Özellik | Durum |
|---------|-------|
| Fiyat | **%100 ücretsiz** (ömür boyu) |
| Live chat widget | ✅ Sınırsız |
| Ticketing | ✅ Dahili |
| Knowledge base | ✅ Dahili |
| Agent sayısı | ✅ Sınırsız |
| Mobil uygulama | ✅ iOS + Android |
| Otomatik tetikleyiciler | ✅ |
| Özelleştirilebilir widget | ✅ |
| Marka kaldırma | 💰 $29/ay (tek seferlik $19) |
| Entegrasyonlar | ✅ 100+ |
| Raporlama | ✅ |
| CRM | ✅ Dahili |
| Çoklu dil | ✅ 27 dil |

**Neden tawk.to?**
- Tamamen ücretsiz, gizli maliyet yok
- Sınırsız agent (tek kişilik ekip bile)
- Live chat + ticket + knowledge base tek platformda
- Widget HookSniff dashboard'a gömülebilir
- Mobil uygulama ile her yerden cevaplanabilir
- Otomatik tetikleyiciler (kullanıcı belirli sayfada 30 sn beklerse chat açılır)

**Sınırlamalar:**
- Marka kaldırma ücretli ($19 tek seferlik)
- AI chatbot ücretsiz planda yok
- Entegrasyonlar ücretsiz planda sınırlı

### Crisp

| Plan | Fiyat | Agent | Özellik |
|------|-------|-------|---------|
| Free | €0 | 2 | Chat widget, shared inbox, 100 müşteri profili |
| Mini | €45/ay | 4 | Email desteği, custom domain |
| Essentials | €95/ay | 10 | Knowledge base, omnichannel, 50 AI/ay |

**Değerlendirme:** Free plan çok sınırlı (2 agent, 100 profil). tawk.to daha iyi.

### Freshdesk

| Plan | Fiyat | Agent | Özellik |
|------|-------|-------|---------|
| Free | $0 | 2 | Email ticketing, knowledge base, ticket trend raporları |
| Growth | $15/ay/agent | Sınırsız | Automasyon, SLA, raporlama |

**Değerlendirme:** Free plan iyi ama 2 agent limiti var. Ticket sistemi güçlü.

### Zoho Desk

| Plan | Fiyat | Agent | Özellik |
|------|-------|-------|---------|
| Free | $0 | 3 | Email ticketing, knowledge base, müşteri portalı |
| Standard | $14/ay/agent | Sınırsız | Automasyon, SLA, telefoni |

**Değerlendirme:** 3 agent limiti var. Zoho ekosistemi ile entegrasyon iyi.

### Discord — Topluluk Desteği

| Özellik | Durum |
|---------|-------|
| Fiyat | Ücretsiz |
| Kanal yapısı | Özelleştirilebilir |
| Bot entegrasyonu | ✅ |
| Forum kanalı | ✅ (soru/cevap için ideal) |
| Ticket bot | ✅ (ücretsiz) |
| Moderasyon | ✅ |

**Neden Discord?**
- Developer'lar Discord kullanır
- Topluluk oluşturur (kullanıcılar birbirine yardım eder)
- Forum kanalı ile soru/cevap organize edilir
- Bot ile otomatik yanıtlar verilebilir
- Ücretsiz, ölçeklenebilir

### GitHub Issues — Teknik Destek

| Özellik | Durum |
|---------|-------|
| Fiyat | Ücretsiz (public repo) |
| Issue template | ✅ Bug report + feature request |
| Label sistemi | ✅ |
| Milestone | ✅ |
| Entegrasyon | ✅ Linear, Slack, Discord |

**Neden GitHub Issues?**
- SDK'lar zaten açık kaynak
- Developer'lar GitHub'da sorun açar
- Issue template ile yapılandırılmış raporlama
- Kod referansı ile birlikte sorun raporu

---

## 4. RAKİPLERİN DESTEK MODELİ

### Svix

| Kanal | Kullanım |
|-------|----------|
| Email | support@svix.com — genel destek |
| Slack | svix.com/slack — topluluk, hızlı soru/cevap |
| GitHub Issues | Açık kaynak SDK'lar için |
| Docs | docs.svix.com — kapsamlı dokümantasyon |
| Status page | status.svix.com — servis durumu |

**Model:** Self-service odaklı. Kullanıcı önce docs'a bakar, çözemezse Slack veya email. Live chat yok.

### Hookdeck

| Kanal | Kullanım |
|-------|----------|
| Email | support@hookdeck.com |
| Slack | hookdeck.com/slack — topluluk |
| Docs | hookdeck.com/docs — kapsamlı |
| Status page | status.hookdeck.com |
| Trust center | Güvenlik politikaları, SOC 2 |

**Model:** Svix ile aynı. Developer tool'larda live chat yaygın değil.

---

## 5. ÖNERİLEN DESTEK MODELİ

### Aşama 1 — Lansman ($0)

| Kanal | Araç | Maliyet | Ne zaman |
|-------|------|---------|----------|
| Email | Gmail API (mevcut) | $0 | Hemen |
| Live chat | **tawk.to** | $0 | Hemen |
| Knowledge base | **tawk.to** dahili | $0 | Hemen |
| Ticket sistemi | **tawk.to** dahili | $0 | Hemen |
| Topluluk | **Discord** | $0 | Hemen |
| Teknik destek | **GitHub Issues** | $0 | Hemen |
| Status page | **Better Uptime** free tier | $0 | Hemen |

**Toplam maliyet:** $0

### Aşama 2 — Büyüme (100+ kullanıcı)

| Kanal | Araç | Maliyet | Ne zaman |
|-------|------|---------|----------|
| Tüm Aşama 1 | Aynı | $0 | — |
| Marka kaldırma | tawk.to | $19 tek seferlik | $500+ gelir |
| Chatbot | tawk.to AI veya Crisp | $0-45/ay | $1000+ gelir |
| Ticket SLA | Freshdesk veya Zoho | $0-14/ay | B2B müşteri gelince |

### Aşama 3 — Ölçekleme (500+ kullanıcı)

| Kanal | Araç | Maliyet | Ne zaman |
|-------|------|---------|----------|
| Tüm Aşama 2 | Aynı | — | — |
| Omnichannel | Crisp Essentials | €95/ay | $2000+ gelir |
| AI chatbot | Intercom veya Crisp | $39-95/ay | $5000+ gelir |
| Enterprise destek | Özel SLA | Değişken | Enterprise müşteri |

---

## 6. DESTEK İÇERİĞİ — NE HAZIRLANMALI?

### Knowledge Base Kategorileri

| Kategori | İçerik | Öncelik |
|----------|--------|---------|
| **Başlangıç** | Hesap oluşturma, ilk webhook, API key | 🔴 Acil |
| **SDK'lar** | Her SDK için kurulum ve kullanım | 🔴 Acil |
| **API Referansı** | Endpoint'ler, authentication, hatalar | 🔴 Acil |
| **Güvenlik** | HMAC doğrulama, IP allowlist, SSL | 🟡 Önemli |
| **Faturalama** | Plan değişikliği, ödeme, iptal | 🟡 Önemli |
| **Entegrasyonlar** | Stripe, Slack, Discord webhook örnekleri | 🟡 Önemli |
| **Sorun Giderme** | Sık hatalar, debug ipuçları | 🟡 Önemli |
| **SSS** | En sık sorulan sorular | 🟡 Önemli |
| **Enterprise** | DPA, SLA, özel kurulum | 🟢 Opsiyonel |

### Hazırlanacak İçerikler

| İçerik | Format | Süre |
|--------|--------|------|
| Quick start rehberi | Markdown | 1 saat |
| SDK kurulum rehberleri (11 dil) | Markdown | 2 saat |
| API hata kodları rehberi | Markdown | 30 dk |
| HMAC doğrulama rehberi | Markdown + kod | 1 saat |
| Sık hatalar ve çözümleri | Markdown | 1 saat |
| Faturalama SSS | Markdown | 30 dk |
| Video demo (opsiyonel) | MP4 | 1 saat |

**Toplam:** ~7 saat, $0

---

## 7. DESTEK SLA — YANIT SÜRELERİ

| Öncelik | Tanım | Yanıt süresi | Çözüm süresi |
|---------|-------|-------------|-------------|
| Kritik | Servis çöktü, veri kaybı | 1 saat | 4 saat |
| Yüksek | Webhook teslim edilmiyor, ödeme sorunu | 4 saat | 24 saat |
| Orta | SDK sorusu, özellik isteği | 24 saat | 1 hafta |
| Düşük | Genel soru, öneri | 48 saat | Planlanacak |

**İlk 3 ay:** Tüm destek tek kişi (Servet + AI). SLA esnek.

---

## 8. OTOMASYON — NE YAPILABİLİR?

### tawk.to Otomatik Tetikleyiciler

| Tetikleyici | Aksiyon |
|-------------|---------|
| Kullanıcı 30 sn bekler | Chat widget açılır |
| Kullanıcı /pricing sayfasında | "Fiyat soruları için yardımcı olabilir miyim?" |
| Kullanıcı hata sayfasında | "Sorun mu yaşıyorsunuz? Yardımcı olalım" |
| Kullanıcı /docs sayfasında | Chat gizlenir (self-service) |

### Discord Bot

| Bot | Ne yapar | Maliyet |
|-----|----------|---------|
| Ticket bot | Özel ticket kanalı oluşturur | $0 |
| FAQ bot | Sık sorulan soruları otomatik yanıtlar | $0 |
| Status bot | Servis durumu değişikliklerini bildirir | $0 |

### Email Otomasyonu

| Email | Ne zaman | İçerik |
|-------|----------|--------|
| Hoş geldin | Kayıt sonrası | Quick start linki |
| İlk webhook tebrik | İlk başarılı teslimat | "Tebrikler!" + docs linki |
| Haftalık özet | Her Pazartesi | "Bu hafta X webhook teslim edildi" |
| %80 limit uyarısı | Limit dolmak üzere | "Pro plan'a geçin" |

---

## 9. METRIKLER — NE ÖLÇÜLECEK?

| Metrik | Tanım | Hedef |
|--------|-------|-------|
| İlk yanıt süresi | Ticket açıldıktan ilk yanıta kadar | <4 saat |
| Çözüm süresi | Ticket açıldıktan çözüme kadar | <24 saat |
| Müşteri memnuniyeti (CSAT) | Çözüm sonrası puan | >4/5 |
| Self-service oranı | Docs/FAQ ile çözülen | >%60 |
| Ticket sayısı/ay | Toplam destek talebi | Takip et |
| Tekrarlayan sorular | Aynı soruyu soran sayısı | Azalt |

---

## 10. RİSKLER

| Risk | Olasılık | Etki | Önlem |
|------|----------|------|-------|
| Çok fazla ticket gelir | Düşük | Orta | Self-service odaklı docs hazırla |
| Yanıtlar geç kalır | Orta | Yüksek | tawk.to mobil uygulama ile her yerden cevapla |
| Kullanıcı docs bulamaz | Orta | Orta | Dashboard'da "yardım" butonu ekle |
| Spam/yalan ticket | Düşük | Düşük | tawk.to spam filtresi |
| Dil bariyeri (TR/EN) | Orta | Orta | tawk.to çeviri özelliği (beta) |

---

## 11. YAPILACAKLAR

### Acil (Lansmandan önce) — 3 saat

| # | Ne | Süre |
|---|-----|------|
| 1 | tawk.to hesabı aç, widget'ı dashboard'a ekle | 1 saat |
| 2 | Discord sunucusu kur (5-6 kanal) | 30 dk |
| 3 | Knowledge base: Quick start + 3 temel rehber | 1.5 saat |

### İlk Hafta — 4 saat

| # | Ne | Süre |
|---|-----|------|
| 4 | Knowledge base: SDK kurulum rehberleri (11 dil) | 2 saat |
| 5 | Knowledge base: API hata kodları + HMAC rehberi | 1 saat |
| 6 | Status page: Better Uptime kurulumu | 30 dk |
| 7 | tawk.to otomatik tetikleyicileri ayarla | 30 dk |

### İlk Ay — 3 saat

| # | Ne | Süre |
|---|-----|------|
| 8 | Knowledge base: Entegrasyon örnekleri | 1 saat |
| 9 | Knowledge base: Sık hatalar ve çözümleri | 1 saat |
| 10 | Discord bot kurulumu (ticket + FAQ) | 1 saat |

---

## 12. SONUÇ

| Konu | Değerlendirme |
|------|---------------|
| En iyi ücretsiz araç | **tawk.to** (live chat + ticket + KB + sınırsız agent) |
| Topluluk | **Discord** (developer odaklı, ücretsiz) |
| Teknik destek | **GitHub Issues** (SDK'lar için) |
| Status page | **Better Uptime** (ücretsiz) |
| Toplam maliyet | **$0** |
| Hazırlık süresi | **~10 saat** |
| Rakip farkı | Svix/Hookdeck de live chat kullanmıyor — standart model |
| En büyük avantaj | tawk.to ile profesyonel destek deneyimi, $0 |

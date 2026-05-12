# 🔔 Uyarılar (Alerts)

> Sayfa: `dashboard/src/app/[locale]/dashboard/alerts/page.tsx`
> Route: `/dashboard/alerts`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| ConfirmDialog | `@/components/ConfirmDialog` | Silme onay dialogu |
| useToast | `@/components/Toast` | Bildirim |
| alertsApi | `@/lib/api` | Alert API |

### Veri Akışı
- `alertsApi.list(token)` → alert listesi
- `alertsApi.create(token, form)` → yeni alert
- `alertsApi.delete(token, id)` → alert silme
- `alertsApi.test(token, id)` → test mesajı gönderme

### Alert Koşulları
| Koşul | Açıklama |
|-------|----------|
| failure_rate | Başarısızlık oranı > threshold (%) |
| latency | Ortalama gecikme > threshold (ms) |
| consecutive_failures | Ardışık hata sayısı > threshold |

### Bildirim Kanalları
| Kanal | İkon |
|-------|------|
| slack | 💬 |
| email | 📧 |
| webhook | 🔗 |

## Özellikler

### CRUD İşlemleri
- ✅ **Listeleme** — Tüm alert kuralları
- ✅ **Oluşturma** — Ad, koşul, eşik, kanallar
- ✅ **Silme** — ConfirmDialog ile
- ✅ **Test** — Test mesajı gönderme

### Form
- ✅ Alert adı
- ✅ Koşul seçimi (failure_rate/latency/consecutive_failures)
- ✅ Eşik değeri (number input)
- ✅ Bildirim kanalları (çoklu seçim: slack/email/webhook)

### Erişilebilirlik
- ✅ htmlFor/id eşleştirmesi (alert-name, alert-condition, alert-threshold)
- ✅ i18n tüm metinlerde
- ✅ Dark mode tam destek

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- Test butonu (alert test gönderme)
- Koşul bazlı eşik gösterimi (% veya ms)
- Kanal ikonları
- Active/paused durumu
- ConfirmDialog ile silme
- i18n tam destek

### ⚠️ Potansiyel Sorunlar
- **Endpoint filtresi yok** — Alert tüm endpoint'ler için geçerli
- **Alert düzenleme yok** — Sadece oluşturma ve silme
- **Pause/resume yok** — Active/pasif değiştirme butonu yok
- **Alert geçmişi yok** — Ne zaman tetiklendi bilgisi yok
- **Threshold validasyonu yok** — Negatif değer girilebilir

### 🔴 Eksiklikler

### 🆕 Eklenecekler (Sektör Karşılaştırma)
- **Admin bazlı alert yönetimi** — Tüm müşterilerin alert'lerini görme
- **Global alert kuralları** — Platform genelinde alert tanımlama
- **Alert şablonları** — Önceden tanımlı alert şablonları
- **PagerDuty/OpsGenie entegrasyonu** — Enterprise alert kanalları
- **Alert history** — Geçmiş alert olaylarının kaydı
- **Escalation policy** — Alert yükseltme politikası
- **Microsoft Teams entegrasyonu** — Teams kanallarına bildirim (Hookdeck ✅)
- **Discord entegrasyonu** — Discord kanallarına bildirim
- **Endpoint disable alert** — Endpoint devre dışı kalınca otomatik bildirim (Svix ✅)
- **SSRF/Spoofing alert** — Güvenlik olaylarında otomatik alert
- **Quick filter** — Alert listesinde tek tıkla filtre (Hookdeck ✅)
- Alert düzenleme (update) endpoint'i
- Alert pause/resume toggle
- Alert tetiklenme geçmişi/log'u
- Endpoint bazlı alert
- Koşul bazlı önerilen eşikler
- Alert kopyalama
- Toplu alert yönetimi
- Webhook URL doğrulama (webhook kanalı için)

---

## 🔧 Backend & Frontend Uyumsuzluğu (2026-05-13)

### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Alert düzenleme | `PUT /v1/alerts/{id}` (update_alert) | ❌ Düzenleme butonu yok | EKLENMELİ |
| Alert pause/resume | — (backend'de toggle endpoint'i yok) | ❌ Toggle yok | Backend'e eklenmeli |
| Alert tetiklenme geçmişi | — (backend'de history endpoint'i yok) | ❌ Liste yok | Backend'e eklenmeli |

### Yapılacaklar
1. **Alert Düzenleme** — Mevcut alert kuralını güncelleme
   - Backend: `PUT /v1/alerts/{id}` zaten var
   - Frontend: Her alert kartında "Düzenle" butonu → mevcut değerlerle form
   - Form: name, condition, threshold, channels (mevcut değerlerle dolu)
2. **Alert Pause/Resume** — Alert'i geçici olarak durdurma
   - Backend: `PUT /v1/alerts/{id}` ile `is_active` toggle (zaten destekliyor)
   - Frontend: Her alert kartında toggle switch (aktif/pasif)
3. **Alert Tetiklenme Geçmişi** — Ne zaman tetiklendi
   - Backend: `GET /v1/alerts/{id}/history` endpoint'i eklenmeli
   - Frontend: "Geçmiş" butonu → modal: tetiklenme listesi (tarih, değer, kanal)
4. **Alert Kopyalama** — Mevcut alert'i kopyalama
   - Frontend: "Kopyala" butonu → yeni alert formu (mevcut değerlerle)
5. **Endpoint Bazlı Alert** — Belirli endpoint için alert
   - Frontend: Form'a endpoint seçici ekle (opsiyonel)

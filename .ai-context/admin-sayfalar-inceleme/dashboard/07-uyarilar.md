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

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Alert Düzenleme Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/alerts/page.tsx`
- **Backend:** `PUT /v1/alerts/{id}` — alert güncelleme
- **Sorun:** `alertsApi.update` api.ts'de tanımlı değil, düzenleme butonu yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     update: (token: string, id: string, data: Partial<CreateAlertRequest>) =>
       apiFetch<Alert>(`/alerts/${id}`, { method: 'PUT', body: data, token }),
     ```
  2. Her alert kartına "Düzenle" butonu ekle
  3. Mevcut değerlerle form (name, condition, threshold, channels)
  4. `alertsApi.update(token, id, formData)` çağrısı
  5. i18n key: `editAlert`, `updateAlert`

#### BF-02: Alert Pause/Resume Toggle Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/alerts/page.tsx`
- **Sorun:** Alert aktif/pasif yapılamıyor.
- **Adımlar:**
  1. Her alert kartına toggle switch ekle
  2. `alertsApi.update(token, id, { is_active: !current })` çağrısı
  3. Toggle değişiminde optimistic UI update

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/alerts/page.tsx`
- **Sorun:** 2 useEffect, 9 fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)

#### P-02: Pagination Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/alerts/page.tsx`
- **Sorun:** Tüm alert'ler tek seferde yükleniyor.
- **Adımlar:**
  1. Backend pagination desteği varsa ekle
  2. "Daha Fazla Yükle" butonu ekle

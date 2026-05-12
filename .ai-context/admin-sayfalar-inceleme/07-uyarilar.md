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
- Alert düzenleme (update) endpoint'i
- Alert pause/resume toggle
- Alert tetiklenme geçmişi/log'u
- Endpoint bazlı alert
- Koşul bazlı önerilen eşikler
- Alert kopyalama
- Toplu alert yönetimi
- Webhook URL doğrulama (webhook kanalı için)

# 07 — Settings (Platform Ayarları)

**Dosya:** `dashboard/src/app/[locale]/admin/settings/page.tsx`  
**Satır:** ~500  
**Amaç:** Tüm platform konfigürasyonunu yönetme

---

## Sayfada Ne Var?

### Success Banner
- 3 saniye, yeşil, "Settings saved" mesajı

### 1. General
| Ayar | Tip | Açıklama |
|------|-----|----------|
| `maintenance_mode` | Toggle | Bakım modu |
| `signup_enabled` | Toggle | Kayıt açık/kapalı |
| `default_plan` | Select | Varsayılan plan (Free/Pro) |

### 2. Plan Limits (iki kolon: Free / Pro)
| Ayar | Free | Pro |
|------|------|-----|
| `max_endpoints` | 5 | 50 |
| `max_webhooks/month` | 10,000 | 50,000 |
| `rate_limit (req/min)` | 100 | 1,000 |
| `retention_days` | 7 | 30 |

### 3. Plan Prices
- Pro: $29/ay (varsayılan)
- Business: $99/ay (varsayılan)
- Step: 0.01

### 4. Email Settings
- Resend API Key (password input)
- Sender Address (email input, placeholder: `noreply@hooksniff.dev`)

### 5. Security
- Webhook Secret (password input, placeholder: `whsec_...`)
- Global Rate Limit (req/min, 10-100000)
- CORS Origins (comma-separated)

### 6. Backup
- Backup Retention (gün, 1-365)

### 7. Retry
- Max Retry Attempts (0-10)

### 8. Alert Thresholds
| Threshold | Varsayılan | Koşul |
|-----------|-----------|-------|
| Success Rate | < 95% | failure_rate |
| Latency | > 5000ms | latency |
| Consecutive Failures | > 10/saat | consecutive_failures |

### Notification Channels
- ✅ Email
- ☐ Slack
- ☐ Webhook

### Kaydetme Butonları
- "Save Alert Settings" (ayrı)
- "Save Settings" (ayrı)

---

## Kullanılan Sistemler

| Sistem | Amaç |
|--------|------|
| `fetch(/admin/settings)` GET | Ayarları çekme |
| `fetch(/admin/settings)` PUT | Ayarları kaydetme |
| `fetch(/admin/alerts)` GET | Alert kuralları |
| `fetch(/admin/alerts)` POST | Alert kuralı oluşturma |
| `fetch(/admin/alerts/{id})` PUT | Alert kuralı güncelleme |
| `Toast` | Bildirim |
| Toggle switch (CSS) | Maintenance, Signups |
| `role="switch"` | Erişilebilirlik |

## API Çağrıları

```typescript
// Ayarları çek
GET /admin/settings

// Ayarları kaydet
PUT /admin/settings → { ...settings }

// Alert kuralları
GET /admin/alerts
POST /admin/alerts → { name, condition, threshold, channels }
PUT /admin/alerts/{id} → { threshold, channels, is_active }
```

## State

```typescript
const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
const [saving, setSaving] = useState(false);
const [loading, setLoading] = useState(true);
const [showSuccess, setShowSuccess] = useState(false);
const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
const [alertThresholds, setAlertThresholds] = useState({
  success_rate: 95, latency: 5000, consecutive_failures: 10
});
const [alertChannels, setAlertChannels] = useState({
  email: true, slack: false, webhook: false
});
const [alertSaving, setAlertSaving] = useState(false);
```

---

## 🔴 Kritik Sorunlar

1. **API key'ler plaintext olarak geliyor** — `resend_api_key`, `webhook_secret` password input'ta gösteriliyor ama API'den plaintext olarak geliyor. Maskelenmeli.

2. **Settings save optimistic update yok** — Kaydet butonuna basılınca tüm sayfa yeniden yükleniyor.

3. **Alert threshold validation yok** — Success rate 0-100 arası olmalı ama validation yok. 150 girilebilir.

4. **CORS validation yok** — Geçersiz URL girilebilir.

## 🟡 Orta Seviye Sorunlar

5. **Plan limitleri için min/max validation zayıf** — `max_endpoints_free` için `min={1} max={999}` ama mantıklı sınır yok.

6. **Maintenance mode toggle'ı anında etkiliyor** — Kaydetmeden önce bile toggle değişiyor, kullanıcı deneyimi yanıltıcı.

7. **Email settings section'ı Resend'e hardcoded** — SendGrid, Mailgun vb. alternatif yok.

8. **Alert channels sadece 3 seçenek** — Email, Slack, Webhook. Discord, Telegram, PagerDuty yok.

9. **Backup retention için uyarı yok** — 1 gün seçilebilir, bu tehlikeli olabilir.

10. **Retry max attempts 0 yapılabiliyor** — 0 = retry yok, bu bilgi verilmemiş.

## ✅ Olumlu

- 8 ayrı ayar kategorisi
- Toggle switch'ler (maintenance, signups)
- Alert threshold konfigürasyonu
- Success banner (3 saniye)
- Form validation (kısmi)
- Erişilebilirlik (`role="switch"`, `aria-checked`)

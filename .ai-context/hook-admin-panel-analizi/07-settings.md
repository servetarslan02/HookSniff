# 07 — Settings (Platform Ayarları)

**Dosya:** `dashboard/src/app/[locale]/admin/settings/page.tsx`  
**Satır:** ~500  
**Amaç:** Tüm platform konfigürasyonunu yönetme

---

## 1. Genel Ayarlar
| Ayar | Tip | Açıklama |
|------|-----|----------|
| `maintenance_mode` | Toggle | Bakım modu aç/kapa |
| `signup_enabled` | Toggle | Kayıt açık/kapalı |
| `default_plan` | Select | Varsayılan plan (Free/Pro) |

## 2. Plan Limitleri
| Ayar | Free | Pro |
|------|------|-----|
| `max_endpoints` | 5 | 50 |
| `max_webhooks/month` | 10,000 | 50,000 |
| `rate_limit (req/min)` | 100 | 1,000 |
| `retention_days` | 7 | 30 |

## 3. Plan Fiyatları
- Pro: $29/ay (varsayılan)
- Business: $99/ay (varsayılan)
- Step: 0.01

## 4. Email Ayarları
- Resend API Key (password input)
- Sender Address (email input, placeholder: `noreply@hooksniff.dev`)

## 5. Güvenlik Ayarları
- Webhook Secret (password input, placeholder: `whsec_...`)
- Global Rate Limit (req/min, 10-100000)
- CORS Origins (comma-separated)

## 6. Backup Ayarları
- Backup Retention (gün, 1-365)

## 7. Retry Ayarları
- Max Retry Attempts (0-10)

## 8. Alert Thresholds
| Threshold | Varsayılan | Koşul |
|-----------|-----------|-------|
| Success Rate | < 95% | failure_rate |
| Latency | > 5000ms | latency |
| Consecutive Failures | > 10/saat | consecutive_failures |

### Notification Channels
- ✅ Email
- ☐ Slack
- ☐ Webhook

## Kaydetme
- Platform Settings → `PUT /admin/settings`
- Alert Settings → Her kural için ayrı `PUT /admin/alerts/{id}` veya `POST /admin/alerts`
- Success banner (3 saniye)

## State
```typescript
const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
const [alertThresholds, setAlertThresholds] = useState({
  success_rate: 95, latency: 5000, consecutive_failures: 10
});
const [alertChannels, setAlertChannels] = useState({
  email: true, slack: false, webhook: false
});
```

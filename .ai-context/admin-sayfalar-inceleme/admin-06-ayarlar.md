# ⚙️ Ayarlar (Admin Settings)

> Sayfa: `admin/settings/page.tsx`
> Route: `/admin/settings`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### PlatformSettings Interface
```typescript
interface PlatformSettings {
  default_plan: string;
  max_endpoints_free: number;
  max_endpoints_pro: number;
  max_webhooks_free: number;
  max_webhooks_pro: number;
  rate_limit_free: number;
  rate_limit_pro: number;
  retry_max_attempts: number;
  retention_days_free: number;
  retention_days_pro: number;
  maintenance_mode: boolean;
  signup_enabled: boolean;
  plan_price_pro: number;
  plan_price_business: number;
  resend_api_key: string | null;
  email_sender: string | null;
  webhook_secret: string | null;
  backup_retention_days: number;
  global_rate_limit: number;
  cors_origins: string | null;
}
```

### AlertRule Interface
```typescript
interface AlertRule {
  id: string;
  customer_id: string | null;
  customer_email: string | null;
  name: string;
  condition: string;
  threshold: number;
  channels: string[];
  is_active: boolean;
  created_at: string;
}
```

## Özellikler

### Platform Ayarları
- ✅ **Plan Limitleri** — Endpoint ve webhook limitleri (free/pro)
- ✅ **Rate Limit** — Free ve pro için ayrı rate limit
- ✅ **Retry** — Max attempts ayarı
- ✅ **Retention** — Veri saklama süresi (free/pro)
- ✅ **Bakım Modu** — Toggle (maintenance_mode)
- ✅ **Kayıt** — Toggle (signup_enabled)
- ✅ **Plan Fiyatları** — Pro ve Business fiyat ayarı

### Entegrasyon Ayarları
- ✅ **Resend API Key** — Email servisi
- ✅ **Email Sender** — Gönderen adresi
- ✅ **Webhook Secret** — Webhook imza anahtarı
- ✅ **Backup Retention** — Backup saklama süresi
- ✅ **Global Rate Limit** — Genel rate limit
- ✅ **CORS Origins** — İzin verilen origin'ler

### Alert Yönetimi
- ✅ Alert kuralı listesi
- ✅ Alert kuralı oluşturma
- ✅ Alert kuralı silme

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- Kapsamlı platform ayarları (20+ ayar)
- Plan bazlı limitler
- Maintenance mode toggle
- Signup toggle
- Alert kuralı yönetimi
- i18n desteği

### ⚠️ Potansiyel Sorunlar
- **Gizli alanlar** — API key, secret, token alanları maskelenmeli
- **Kaydetme** — Toplu kaydetme yok, tek tek mi?

### 🔴 Eksiklikler
- Backup yönetimi (manuel backup, restore)
- Log seviyesi ayarı
- API versiyon yönetimi
- Whitelabel ayarları
- Maintenance mode planlama (zamanlı)

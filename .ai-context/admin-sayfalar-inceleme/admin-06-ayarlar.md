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

### 🆕 Eklenecekler (Sektör Karşılaştırma)

#### Backup Yönetimi
- Manuel backup tetikleme butonu
- Backup geçmişi tablosu (tarih, boyut, durum)
- Restore işlemi (seçili backup'a geri dönme)
- Backup zamanlaması (cron: saatlik/günlük/haftalık)
- Retention policy (gün sayısı)
- Backup doğrulama (integrity check)

#### Log Seviyesi Ayarı
- Runtime log seviyesi değişimi (restart gerektirmez)
- Debug / Info / Warn / Error seçici
- Modül bazlı seviye (api, worker, db ayrı ayrı)
- Log rotasyonu ayarı (max boyut, gün sayısı)

#### Feature Flag Yönetimi
- Feature listesi (ad, açıklama, durum)
- Toggle ile açma/kapama
- Percentage rollout (kullanıcı yüzdesine göre gradual rollout)
- A/B testing (iki varyant karşılaştırma)
- Feature flag geçmişi (kim, ne zaman, ne değiştirdi)

#### 2FA Zorunlu (Admin)
- Admin kullanıcılar için 2FA zorunluluğu toggle
- TOTP destek (Google Authenticator, Authy)
- Backup kod üretimi
- 2FA sıfırlama (admin tarafından)

#### Session Management
- Aktif oturum listesi (cihaz, IP, son aktivite)
- Oturum sonlandırma (tekli/toplu)
- Oturum timeout ayarı (dakika)
- Concurrent session limiti

#### Whitelabel Ayarları
- Logo yükleme (light/dark mode)
- Renk teması (primary, secondary, accent)
- Custom CSS injection
- Footer metni özelleştirme
- Favicon yükleme

#### Uptime Monitoring
- SLA hedefi ayarı (%99.9, %99.99, %99.999)
- Status page URL'si
- Incident bildirim kanalları (email, Slack, webhook)
- Uptime raporu (aylık/haftalık otomatik rapor)

#### API Versiyon Yönetimi
- Desteklenen API versiyonları listesi
- Deprecated versiyon uyarıları
- Versiyon geçiş rehberi
- Breaking change bildirimleri

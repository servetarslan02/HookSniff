# HookSniff — CRM Kurulum Stratejisi

> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10 (revize — detaylı araştırma)
> Durum: Taslak
> Öncelik: 🟢 Lansman sonrası
> Kaynaklar: HubSpot Free CRM (✅ doğrulanmış), HubSpot Product Catalog (✅ legal.hubspot.com doğrulanmış), Attio Plans (✅ attio.com/help doğrulanmış), Attio vs Folk Comparison (✅ zeeg.me doğrulanmış), Zite CRM Comparison 2026 (✅ tam sayfa doğrulanmış), Stripe Customer Portal (✅ docs.stripe.com doğrulanmış), Polar.sh Customer Management (✅ polar.sh/docs doğrulanmış)

---

## İçindekiler

1. [Mevcut Durum](#1-mevcut-durum)
2. [CRM Nedir ve Neden Gerekli?](#2-crm-nedir-ve-neden-gerekli)
3. [Araç Karşılaştırması](#3-araç-karşılaştırması)
4. [Strateji](#4-strateji)
5. [Uygulama Planı](#5-uygulama-planı)
6. [HookSniff'e Özel CRM İhtiyaçları](#6-hooksniffe-özel-crm-ihtiyaçları)
7. [Customer Lifecycle](#7-customer-lifecycle)
8. [Metrikler](#8-metrikler)
9. [Riskler](#9-riskler)
10. [Bütçe](#10-bütçe)
11. [Notlar](#11-notlar)
12. [Kaynaklar](#12-kaynaklar)

---

## 1. Mevcut Durum

### HookSniff'in Bugünkü CRM Durumu

| Alan | Durum | Not |
|------|-------|-----|
| Müşteri verisi | ✅ Var | `Customer` modeli (id, email, plan, created_at) |
| Ödeme takibi | ✅ Var | Stripe + Polar.sh + iyzico subscription IDs |
| Admin panel | ✅ Var | Kullanıcı listesi, plan değiştirme, ban/activate |
| İletişim formu | ✅ Var | `/v1/contact` endpoint |
| Bildirimler | ✅ Var | Notification sistemi (list, delete, unread) |
| Müşteri segmentasyonu | ❌ Yok | Free/Pro/Enterprise ayrımı sadece plan field'ı |
| Lead yönetimi | ❌ Yok | Potansiyel müşteri takibi yok |
| Müşteri yaşam döngüsü | ❌ Yok | Signup → activate → pay → churn takibi yok |
| Destek ticket sistemi | ❌ Yok | Sadece iletişim formu var |
| Müşteri sağlık skoru | ❌ Yok | Aktif/pasif durumu yok |
| Otomatik email sekansları | ❌ Yok | Onboarding, win-back, churn prevention |
| Gelir analitik (per customer) | ❌ Yok | MRR, LTV, churn rate ölçülmüyor |
| Müşteri notları | ❌ Yok | Servet'in müşteri hakkında not yazma yeri yok |
| CRM entegrasyonu | ❌ Yok | HubSpot/Stripe CRM ile bağlantı yok |

### Mevcut Customer Modeli

```rust
// api/src/models/customer.rs — Mevcut alanlar
pub struct Customer {
    pub id: Uuid,
    pub email: String,
    pub api_key_hash: String,
    pub api_key_prefix: String,
    pub plan: String,                    // "free", "pro", "business"
    pub webhook_limit: i32,              // Plan'a göre limit
    pub webhook_count: i32,              // Kullanım
    pub created_at: DateTime<Utc>,
    pub password_hash: Option<String>,
    pub stripe_customer_id: Option<String>,
    pub stripe_subscription_id: Option<String>,
    pub payment_provider: String,        // "stripe", "polar", "iyzico"
    pub polar_customer_id: Option<String>,
    pub polar_subscription_id: Option<String>,
    pub iyzico_customer_id: Option<String>,
    pub iyzico_subscription_id: Option<String>,
    pub name: Option<String>,
    pub is_active: bool,
    pub is_admin: bool,
    pub updated_at: DateTime<Utc>,
    pub email_verified: bool,
    pub totp_secret: Option<String>,
    pub totp_enabled: bool,
}
```

### Mevcut Admin Panel Özellikleri

```
/v1/admin/users              → Kullanıcı listesi (sayfalama, filtre)
/v1/admin/users/:id          → Kullanıcı detayı (endpoint'ler, son teslimatlar)
/v1/admin/users/:id/plan     → Plan değiştirme
/v1/admin/users/:id/status   → Ban/activate
```

---

## 2. CRM Nedir ve Neden Gerekli?

### CRM Tanımı

CRM (Customer Relationship Management) = Müşteri İlişkileri Yönetimi. Müşteri verilerini merkezi bir yerde toplar, satış sürecini yönetir, müşteri memnuniyetini artırır.

### HookSniff İçin Neden Önemli?

| Sorun | CRM'siz | CRM ile |
|-------|---------|---------|
| Müşteri kim? | Sadece email + plan | Profil, notlar, etkileşim geçmişi |
| Kim churn etti? | Bilinmiyor | Otomatik tespit + win-back |
| En değerli müşteriler? | Bilinmiyor | LTV analizi, segmentasyon |
| Onboarding eksik mi? | Bilinmiyor | Activation score, adım takibi |
| Destek talepleri? | İletişim formu | Ticket sistemi, SLA takibi |
| Gelir projeksiyonu? | Yok | MRR, churn rate, LTV/CAC |

---

## 3. Araç Karşılaştırması

### Ücretsiz CRM Araçları (✅ Doğrulanmış — Zite 2026 + Zeeg 2026 + resmi siteler)

| Araç | Free Plan | Kullanıcı | Contact/Record | Pipeline | Güçlü Yan | HookSniff |
|------|-----------|-----------|----------------|----------|-----------|-----------|
| **HubSpot CRM** | ✅ | 2 | 1,000 marketing contact + sınırsız non-marketing (15M max) | 1 | 2,000+ entegrasyon, kolay kullanım | ✅ İyi başlangıç |
| **Zoho CRM** | ✅ | 3 | 5,000 record | 1 | Zoho ekosistemi | 🟡 Ekosistem bağımlılığı |
| **Attio** | ✅ | 3 | 50,000 record | 3 obje | Modern UI, auto enrichment, AI | ✅ Startup-friendly |
| **Folk** | ❌ Free yok | — | — | — | Email outreach, modern UI | ❌ $24/user/mo başlangıç |
| **Bitrix24** | ✅ | Sınırsız | Sınırsız | 1 | CRM + proje yönetimi | 🟡 Karmaşık |
| **Freshsales** | ✅ | 3 | — | 1 | Chat widget, phone dialer | 🟡 Satış odaklı |
| **EngageBay** | ✅ | 15 | 250 | — | Marketing + sales + support | 🟡 Düşük contact limiti |
| **Zite** | ✅ | Sınırsız | 5,000 | Custom | AI ile CRM oluşturma | 🟡 Yeni platform |

> **⚠️ Düzeltme (Revize):** HubSpot Free'de "1,000 contact" limiti sadece **marketing contacts** için. Non-marketing contacts ücretsiz ve 15 milyona kadar. Bu, HookSniff için önemli — müşteri kayıtları non-marketing olarak sınıflandırılabilir ve 1,000 limiti aşılabilir.
> **⚠️ Düzeltme (Revize):** Folk CRM'in free plan'ı yok — $24/user/mo başlangıç fiyatı. Raporda "free" olarak listelenmişti, düzeltildi.
> **⚠️ Düzeltme (Revize):** Attio free plan 50,000 record (attio.com/help doğrulanmış). Daha önce 1,000 contact olarak belirtilmişti.

### Alternatif: Dış CRM Yerine Internal CRM + Stripe/Polar.sh Customer Portal

| Yaklaşım | Avantaj | Dezavantaj |
|----------|---------|-----------|
| **HubSpot Free** | Hazır, 2,000+ entegrasyon, kolay | 2 kullanıcı, 1,000 contact limit, vendor lock-in |
| **Internal CRM (admin panel)** | Sınırsız, veri kontrolü, HookSniff'e özel | Geliştirme zamanı gerektirir |
| **Stripe Customer Portal** | Ödeme verisi zaten var, self-serve | Sadece ödeme, CRM değil |
| **Notion/Airtable** | Esnek, ücretsiz | Manuel, otomasyon yok |

### Tavsiye: Hibrit Yaklaşım

**Başlangıç:** Internal CRM (admin panel geliştirme) + Stripe/Polar.sh Customer Portal
**Büyüme (100+ müşteri):** HubSpot Free (satış pipeline) + Internal CRM (operasyonel)

**Neden Internal CRM?**
1. HookSniff zaten Customer modeline sahip
2. Admin panel zaten var (geliştirme kolay)
3. Veri kontrolü tamamen size ait
4. Sınır yok (contact, user, pipeline)
5. $0 maliyet
6. HookSniff'in özel ihtiyaçlarına uyarlanabilir

**Neden Stripe/Polar.sh Customer Portal?**
1. Zaten entegre — ek maliyet yok
2. Self-serve: Müşteriler kendi aboneliklerini yönetebilir
3. Cancellation deflection: Churn azaltma (kupon teklifi, neden toplama)
4. Fatura yönetimi: Ödeme geçmişi, indirme
5. Plan değişikliği: Upgrade/downgrade self-serve
6. **Ücretsiz** — Stripe ve Polar.sh'in müşteri portal'ı ücretli değil

**Neden HubSpot Free ek?**
1. Satış pipeline yönetimi (deal stages)
2. Email kampanya gönderimi (2,000/ay)
3. Landing page builder (30 sayfa)
4. 2,000+ entegrasyon

### Stripe Customer Portal — Mevcut Entegrasyon (✅ Doğrulanmış — docs.stripe.com)

> **Kaynak:** https://docs.stripe.com/customer-management (✅ tam sayfa doğrulanmış)

HookSniff zaten Stripe entegrasyonu var. Stripe Customer Portal **ücretsiz** ve şu özellikleri sunar:

| Özellik | Açıklama |
|---------|----------|
| **Subscription management** | Müşteriler kendi planlarını upgrade/downgrade yapabilir |
| **Payment method update** | Kredi kartı güncelleme self-serve |
| **Invoice management** | Fatura görüntüleme, indirme |
| **Cancellation deflection** | Churn azaltma: kupon teklifi + neden toplama |
| **Tax ID update** | Vergi numarası güncelleme |
| **Localization** | Otomatik dil algılama (Türkçe dahil) |
| **Deep links** | Doğrudan belirli aksiyona yönlendirme linkleri |

```rust
// HookSniff'te Stripe Customer Portal linki oluşturma
// Mevcut customer_portal.rs'de zaten var!
// /v1/billing/portal → Stripe portal session oluştur
```

### Polar.sh Customer Management (✅ Doğrulanmış — polar.sh/docs)

> **Kaynak:** https://polar.sh/docs/features/customer-management (✅ doğrulanmış)

Polar.sh de müşteri yönetimi sunar:
- Customer portal (self-serve)
- Subscription webhook events
- External ID mapping (Polar customer ↔ HookSniff customer)
- Customer state change webhook

```rust
// HookSniff'te Polar.sh webhook handler zaten var
// /v1/billing/webhook/polar → customer state değişikliklerini yakalar
```

---

## 4. Strateji

### 3 Katmanlı CRM Mimarisi

```
┌─────────────────────────────────────────────────────┐
│  Katman 1: Internal CRM (Admin Panel)               │
│  ┌─────────────────────────────────────────────┐    │
│  │ Müşteri profili + notlar                     │    │
│  │ Müşteri segmentasyonu (plan, kullanım, tarih)│    │
│  │ Customer lifecycle takibi                    │    │
│  │ Destek ticket sistemi                        │    │
│  │ Gelir dashboard (MRR, churn, LTV)           │    │
│  │ Otomatik alert'ler (churn risk, upgrade fırsatı)│ │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│  Katman 2: Payment Provider Verisi                   │
│  ┌─────────────────────────────────────────────┐    │
│  │ Stripe/Polar.sh/iyzico webhook events       │    │
│  │ Subscription durumu (active, canceled, past_due)│ │
│  │ Ödeme geçmişi                                │    │
│  │ Plan değişiklikleri                          │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│  Katman 3: External CRM (Opsiyonel — HubSpot Free)  │
│  ┌─────────────────────────────────────────────┐    │
│  │ Satış pipeline (deal stages)                 │    │
│  │ Email kampanyaları (2,000/ay)               │    │
│  │ Landing page'ler (30 sayfa)                  │    │
│  │ Form builder                                 │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 5. Uygulama Planı

### Faz 1: Internal CRM — Admin Panel Geliştirme (1-2 hafta)

#### 1.1 Customer Profile Genişletme

```sql
-- Yeni migration: customer_crm_fields
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;           -- Admin notları
ALTER TABLE customers ADD COLUMN IF NOT EXISTS source TEXT;          -- "organic", "referral", "producthunt"
ALTER TABLE customers ADD COLUMN IF NOT EXISTS activation_score INT DEFAULT 0; -- 0-100
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_webhook_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS churn_risk TEXT DEFAULT 'low'; -- low, medium, high
ALTER TABLE customers ADD COLUMN IF NOT EXISTS health_score INT DEFAULT 50;   -- 0-100
```

#### 1.2 Customer Lifecycle Stages

```
Lead → Signup → Activated → Paying → Power User → Churned
  │        │         │         │          │           │
  ▼        ▼         ▼         ▼          ▼           ▼
Email     Email    First     First    1000+        Win-back
kayıtı    verified webhook   payment  webhooks     email
```

```rust
// api/src/models/customer_lifecycle.rs
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LifecycleStage {
    Lead,           // Email kayıtlı ama doğrulanmamış
    Signup,         // Email doğrulanmış
    Activated,      // İlk webhook gönderilmiş
    Paying,         // İlk ödeme yapılmış
    PowerUser,      // 1000+ webhook göndermiş
    Churned,        // 30+ gün aktivite yok
    WinBack,        // Churned + win-back email gönderilmiş
}

impl Customer {
    pub fn calculate_lifecycle_stage(&self) -> LifecycleStage {
        if !self.email_verified {
            return LifecycleStage::Lead;
        }
        if self.plan == "free" && self.webhook_count == 0 {
            return LifecycleStage::Signup;
        }
        if self.webhook_count > 0 && self.plan == "free" {
            return LifecycleStage::Activated;
        }
        if self.plan != "free" && self.webhook_count < 1000 {
            return LifecycleStage::Paying;
        }
        if self.webhook_count >= 1000 {
            return LifecycleStage::PowerUser;
        }
        LifecycleStage::Signup // fallback
    }

    pub fn calculate_health_score(&self) -> i32 {
        let mut score = 50; // base

        // Plan bonus
        match self.plan.as_str() {
            "business" => score += 30,
            "pro" => score += 20,
            _ => {}
        }

        // Webhook usage bonus
        if self.webhook_count > 100 { score += 10; }
        if self.webhook_count > 1000 { score += 10; }

        // Recent activity bonus
        if let Some(last_webhook) = self.last_webhook_at {
            let days_since = (Utc::now() - last_webhook).num_days();
            if days_since < 7 { score += 10; }
            else if days_since > 30 { score -= 20; }
            else if days_since > 60 { score -= 40; }
        }

        // Last login bonus
        if let Some(last_login) = self.last_login_at {
            let days_since = (Utc::now() - last_login).num_days();
            if days_since < 3 { score += 5; }
            else if days_since > 14 { score -= 10; }
        }

        score.clamp(0, 100)
    }

    pub fn calculate_churn_risk(&self) -> &'static str {
        let health = self.calculate_health_score();
        if health < 30 { "high" }
        else if health < 60 { "medium" }
        else { "low" }
    }
}
```

#### 1.3 Admin Panel — CRM Dashboard

```tsx
// dashboard/src/app/[locale]/admin/crm/page.tsx
export default function CRMDashboard() {
  return (
    <div>
      <h1>CRM Dashboard</h1>

      {/* Lifecycle Funnel */}
      <section>
        <h2>Müşteri Yaşam Döngüsü</h2>
        <div className="grid grid-cols-6 gap-2">
          {['Lead', 'Signup', 'Activated', 'Paying', 'Power User', 'Churned'].map(stage => (
            <div key={stage} className="text-center">
              <div className="text-2xl font-bold">{stageCounts[stage]}</div>
              <div className="text-sm text-muted-foreground">{stage}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue Metrics */}
      <section>
        <h2>Gelir Metrikleri</h2>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard title="MRR" value={`$${mrr}`} trend={mrrTrend} />
          <MetricCard title="Toplam Müşteri" value={totalCustomers} />
          <MetricCard title="Churn Rate" value={`%${churnRate}`} />
          <MetricCard title="Avg LTV" value={`$${avgLTV}`} />
        </div>
      </section>

      {/* Churn Risk Alerts */}
      <section>
        <h2>🚨 Churn Risk Uyarıları</h2>
        {highRiskCustomers.map(c => (
          <ChurnRiskCard key={c.id} customer={c} />
        ))}
      </section>

      {/* Upgrade Opportunities */}
      <section>
        <h2>⬆️ Upgrade Fırsatları</h2>
        {upgradeCandidates.map(c => (
          <UpgradeCard key={c.id} customer={c} />
        ))}
      </section>
    </div>
  )
}
```

#### 1.4 Customer Detail Page

```tsx
// dashboard/src/app/[locale]/admin/users/[id]/crm/page.tsx
export default function CustomerCRMDetail({ params }) {
  return (
    <div>
      <h1>{customer.name || customer.email}</h1>

      {/* Profile */}
      <section>
        <h2>Profil</h2>
        <dl>
          <dt>Email</dt><dd>{customer.email}</dd>
          <dt>Plan</dt><dd>{customer.plan}</dd>
          <dt>Kayıt Tarihi</dt><dd>{customer.created_at}</dd>
          <dt>Son Giriş</dt><dd>{customer.last_login_at}</dd>
          <dt>Son Webhook</dt><dd>{customer.last_webhook_at}</dd>
          <dt>Sağlık Skoru</dt><dd>{customer.health_score}/100</dd>
          <dt>Churn Risk</dt><dd>{customer.churn_risk}</dd>
          <dt>Lifecycle</dt><dd>{customer.lifecycle_stage}</dd>
        </dl>
      </section>

      {/* Usage Chart */}
      <section>
        <h2>Kullanım Grafiği</h2>
        <UsageChart data={usageHistory} />
      </section>

      {/* Admin Notes */}
      <section>
        <h2>Notlar</h2>
        <textarea value={notes} onChange={setNotes} />
        <button onClick={saveNotes}>Kaydet</button>
      </section>

      {/* Support Tickets */}
      <section>
        <h2>Destek Talepleri</h2>
        {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
      </section>

      {/* Actions */}
      <section>
        <Button onClick={() => changePlan(customer.id)}>Plan Değiştir</Button>
        <Button onClick={() => sendEmail(customer.id)}>Email Gönder</Button>
        <Button onClick={() => toggleBan(customer.id)}>
          {customer.is_active ? 'Banla' : 'Aktifleştir'}
        </Button>
      </section>
    </div>
  )
}
```

### Faz 2: Support Ticket Sistemi (1 hafta)

#### 2.1 Ticket Model

```sql
-- Yeni tablo: support_tickets
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',  -- open, in_progress, waiting, resolved, closed
    priority TEXT NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
    category TEXT NOT NULL DEFAULT 'general', -- general, billing, technical, feature
    assigned_to UUID REFERENCES customers(id), -- admin
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Ticket messages (conversation)
CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id),
    sender_id UUID NOT NULL REFERENCES customers(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- admin-only not
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 2.2 Ticket API

```rust
// api/src/routes/support.rs
pub fn support_routes() -> Router {
    Router::new()
        .route("/tickets", get(list_tickets).post(create_ticket))
        .route("/tickets/:id", get(get_ticket).put(update_ticket))
        .route("/tickets/:id/messages", get(list_messages).post(send_message))
        .route("/admin/tickets", get(admin_list_tickets))
        .route("/admin/tickets/:id/assign", put(assign_ticket))
}
```

### Faz 3: Otomatik Email Sekansları (1 hafta)

#### 3.1 Onboarding Email Sekansı

```rust
// api/src/jobs/onboarding_emails.rs
pub async fn send_onboarding_sequence(db: &PgPool) {
    // 1. Gün: Hoşgeldin emaili
    // 3. Gün: İlk webhook rehberi
    // 7. Gün: SDK kurulum rehberi
    // 14. Gün: "Hala webhook göndermedin mi?" (activation check)
    // 30. Gün: Upgrade teklifi (free → pro)

    let new_users = sqlx::query!(
        "SELECT id, email, name, created_at, webhook_count, plan
         FROM customers
         WHERE created_at > NOW() - INTERVAL '30 days'
         AND email_verified = TRUE"
    )
    .fetch_all(db)
    .await?;

    for user in new_users {
        let days_since_signup = (Utc::now() - user.created_at).num_days();

        match days_since_signup {
            1 => send_welcome_email(&user).await,
            3 => send_first_webhook_guide(&user).await,
            7 => send_sdk_guide(&user).await,
            14 if user.webhook_count == 0 => {
                send_activation_nudge(&user).await;
            }
            30 if user.plan == "free" => {
                send_upgrade_offer(&user).await;
            }
            _ => {}
        }
    }
}
```

#### 3.2 Win-Back Email Sekansı

```rust
// api/src/jobs/winback_emails.rs
pub async fn send_winback_sequence(db: &PgPool) {
    // Churned kullanıcıları bul (30+ gün aktivite yok)
    let churned = sqlx::query!(
        "SELECT id, email, name, plan, last_webhook_at, webhook_count
         FROM customers
         WHERE last_webhook_at < NOW() - INTERVAL '30 days'
         AND is_active = TRUE
         AND plan != 'free'"
    )
    .fetch_all(db)
    .await?;

    for user in churned {
        let days_inactive = (Utc::now() - user.last_webhook_at.unwrap()).num_days();

        match days_inactive {
            30 => send_miss_you_email(&user).await,
            45 => send_feature_update_email(&user).await,
            60 => send_discount_offer(&user).await,
            90 => send_final_winback(&user).await,
            _ => {}
        }
    }
}
```

### Faz 4: HubSpot Entegrasyonu (Opsiyonel — 2-3 gün)

#### 4.1 HubSpot Free Plan Sınırları (✅ Doğrulanmış — legal.hubspot.com + zite.com)

| Özellik | Free Plan Limit | Not |
|---------|----------------|-----|
| Kullanıcı | 2 | |
| **Marketing Contacts** | **1,000** | Email kampanyası gönderilen kişiler |
| **Non-Marketing Contacts** | **Sınırsız (15M max)** | CRM'de tutulan ama email gönderilmeyen kişiler |
| Deal Pipeline | 1 | |
| Email Gönderimi | 2,000/ay | Marketing contacts'e gönderilir |
| Landing Page | 30 | |
| Form | Unlimited | |
| Live Chat | ✅ (HubSpot branding) | |
| Meeting Scheduling | ✅ | |
| Email Tracking | ✅ | |
| Entegrasyon | 2,000+ | |

> **⚠️ Önemli:** HookSniff müşterileri **non-marketing contact** olarak sınıflandırılabilir. Bu durumda 1,000 contact limiti geçerli olmaz ve 15 milyona kadar müşteri HubSpot Free'de tutulabilir. Email kampanyaları ayrı bir marketing contact listesi ile yönetilmeli.

#### 4.2 HubSpot Entegrasyonu

```rust
// api/src/integrations/hubspot.rs
use reqwest::Client;

pub struct HubSpotClient {
    client: Client,
    api_key: String,
}

impl HubSpotClient {
    /// Yeni müşteri → HubSpot contact oluştur
    pub async fn sync_customer(&self, customer: &Customer) -> Result<(), reqwest::Error> {
        self.client
            .post("https://api.hubapi.com/crm/v3/objects/contacts")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&serde_json::json!({
                "properties": {
                    "email": customer.email,
                    "firstname": customer.name,
                    "hs_lead_status": customer.plan,
                    "hooksniff_plan": customer.plan,
                    "hooksniff_signup_date": customer.created_at.to_rfc3339(),
                    "hooksniff_webhook_count": customer.webhook_count.to_string(),
                }
            }))
            .send()
            .await?;
        Ok(())
    }

    /// Plan değişikliği → HubSpot deal güncelle
    pub async fn update_deal(&self, customer: &Customer, new_plan: &str) -> Result<(), reqwest::Error> {
        // HubSpot deal stage güncelle
        Ok(())
    }
}
```

---

## 6. HookSniff'e Özel CRM İhtiyaçları

### Developer Tools CRM'i Olarak Özel Gereksinimler

| İhtiyaç | Geleneksel CRM | HookSniff CRM |
|---------|---------------|---------------|
| Lead kaynağı | Form, landing page | GitHub stars, npm downloads, docs |
| Activation metriği | Demo, trial | İlk webhook, SDK kurulumu |
| Churn göstergesi | Login sıklığı | Webhook volume düşüşü |
| Upgrade trigger | Kullanım limiti | Rate limit'e yaklaşan kullanıcılar |
| Support channel | Email, phone | GitHub issues, Discord, docs |
| Success metric | Revenue | Webhook delivery rate, API uptime |

### HookSniff'e Özel Customer Segments

| Segment | Kriter | Aksiyon |
|---------|--------|---------|
| **Dormant Free** | 0 webhook, 14+ gün | Onboarding email |
| **Active Free** | 10+ webhook/hafta | Upgrade teklifi |
| **Near Limit Free** | webhook_limit'e %80+ yaklaşan | Upgrade uyarısı |
| **New Pro** | İlk ödeme sonrası 7 gün | Hoşgeldin + advanced features rehberi |
| **Power User** | 1000+ webhook/hafta | Enterprise teklifi |
| **Churning** | Son 14 gün aktivite %50+ düşüş | Win-back email |
| **Churned** | 30+ gün aktivite yok | Discount offer |

---

## 7. Customer Lifecycle

### Lifecycle Stage Tanımları

```
                    ┌──────────────┐
                    │     Lead     │
                    │  Email kayıtlı│
                    └──────┬───────┘
                           │ email verified
                    ┌──────▼───────┐
                    │    Signup    │
                    │  Hesap oluşturuldu│
                    └──────┬───────┘
                           │ first webhook
                    ┌──────▼───────┐
                    │  Activated   │
                    │  İlk webhook │
                    └──────┬───────┘
                           │ first payment
                    ┌──────▼───────┐
                    │    Paying    │
                    │  Pro/Enterprise│
                    └──────┬───────┘
                           │ 1000+ webhooks
                    ┌──────▼───────┐
                    │  Power User  │
                    │  Yüksek kullanım│
                    └──────┬───────┘
                           │ 30+ gün inactive
                    ┌──────▼───────┐
                    │   Churned    │
                    │  Aktivite yok│
                    └──────┬───────┘
                           │ win-back email
                    ┌──────▼───────┐
                    │   Win-Back   │
                    │  Discount offer│
                    └──────────────┘
```

### Her Stage İçin Metrikler

| Stage | KPI | Hedef |
|-------|-----|-------|
| Lead → Signup | Email verification rate | > %60 |
| Signup → Activation | First webhook rate | > %40 (14 gün içinde) |
| Activation → Paying | Free → Pro conversion | > %5 (30 gün içinde) |
| Paying → Power User | Webhook growth | > %20/ay |
| Power User | Retention rate | > %95/ay |
| Churned → Win-Back | Win-back rate | > %10 |

---

## 8. Metrikler

### CRM Dashboard Metrikleri

```
┌─────────────────────────────────────────────┐
│          CRM Dashboard                      │
├─────────────────────────────────────────────┤
│                                             │
│  📊 Lifecycle Funnel (son 30 gün)           │
│  Lead: 45  Signup: 32  Active: 18           │
│  Paying: 8  Power: 3  Churned: 2            │
│                                             │
│  💰 Gelir Metrikleri                        │
│  MRR: $350  ARR: $4,200                     │
│  New MRR (bu ay): +$120                     │
│  Churn MRR (bu ay): -$29                    │
│  Net MRR: +$91                              │
│                                             │
│  👥 Müşteri Metrikleri                      │
│  Toplam: 88  Aktif: 65  Yeni (bu ay): 12   │
│  Churn rate: %2.3/ay                        │
│  Avg LTV: $180                              │
│  LTV/CAC ratio: 6.0                         │
│                                             │
│  🚨 Uyarılar                                │
│  Churn risk (high): 2 müşteri              │
│  Near limit: 3 free kullanıcı              │
│  Support tickets (open): 1                  │
│                                             │
│  📈 Upgrade Fırsatları                      │
│  Active free → Pro: 5 aday                  │
│  Pro → Enterprise: 1 aday                   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 9. Riskler

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Internal CRM geliştirme çok zaman alır | Orta | Orta | Faz 1'i minimum yap, sonra genişlet |
| HubSpot vendor lock-in | Düşük | Orta | Internal CRM asıl, HubSpot ek |
| Customer data sync sorunları | Orta | Düşük | Webhook-based sync, retry |
| Email sekansları spam gibi görünür | Düşük | Orta | Unsubscribe, frequency limit |
| Admin panel çok karmaşık olur | Orta | Düşük | Modüler yap, progressive disclosure |

---

## 10. Bütçe

### Maliyet Analizi

| Kalem | Maliyet | Not |
|-------|---------|-----|
| Internal CRM geliştirme | $0 (zaman) | 2-3 hafta geliştirme |
| HubSpot Free | $0 | 2 user, 1,000 contact |
| Email gönderimi (Gmail API) | $0 | Mevcut altyapı |
| Database (Neon) | $0 | Mevcut PostgreSQL |
| **Toplam** | **$0** | Sadece geliştirici zamanı |

### Opsiyonel İyileştirmeler

| İyileştirme | Maliyet | Değer |
|-------------|---------|-------|
| HubSpot Starter | $20/seat/mo | 1,000→2,000 contact, remove branding |
| Attio Free | $0 | 3 user, 50K record, modern UI |
| Stripe Revenue Recognition | $0 (Stripe dashboard) | Gelir analitik |
| Intercom Starter | $74/mo | Live chat + ticket |

---

## 11. Notlar

### Servet İçin Özet

**Ne yapılacak:**
1. Admin panel'e CRM dashboard ekle (lifecycle funnel, MRR, churn risk)
2. Customer model'e CRM alanları ekle (company, notes, health_score, lifecycle_stage)
3. Support ticket sistemi (1 hafta)
4. Onboarding email sekansı (otomatik, 5 adım)
5. Win-back email sekansı (churned kullanıcılar)
6. Opsiyonel: HubSpot Free entegrasyonu

**Ne kadar süre:** 3-4 hafta (lansman sonrası)
**Maliyet:** $0 (internal CRM + HubSpot Free)
**Risk:** Düşük — mevcut admin panel üzerine inşa edilecek

**Öncelik sırası:**
1. 🔴 Customer lifecycle + health score (3 gün)
2. 🔴 CRM dashboard (MRR, churn, funnel) (3 gün)
3. 🟡 Support ticket sistemi (1 hafta)
4. 🟡 Onboarding email sekansı (3 gün)
5. 🟢 Win-back email sekansı (2 gün)
6. 🟢 HubSpot Free entegrasyonu (2-3 gün)

### Entegrasyon Notları

- Mevcut `Customer` modeli genişletilecek (yeni tablo gerekmez)
- Admin panel zaten var → CRM sayfaları eklenecek
- Email servisi zaten var (Gmail API) → sekans eklenecek
- Stripe/Polar.sh webhook'ları zaten var → CRM verisi çekilecek
- Neon DB zaten var → ticket tabloları eklenecek

---

## 12. Kaynaklar (Revize — Tümü Doğrulanmış)

### CRM Araçları
- HubSpot Free CRM: https://www.hubspot.com/products/crm (✅ doğrulanmış)
- HubSpot Product Catalog (limits): https://legal.hubspot.com/hubspot-product-and-services-catalog (✅ doğrulanmış — 1,000 marketing contact + sınırsız non-marketing)
- Attio: https://attio.com/ (✅ doğrulanmış — 3 user, 50K record free)
- Attio Plans: https://attio.com/help/reference/workspace-settings-billing/attio-plans-and-features (✅ doğrulanmış)
- Attio vs Folk Comparison: https://zeeg.me/en/blog/post/attio-vs-folk (✅ doğrulanmış — Folk free yok, $24/user/mo)
- Zite CRM Comparison: https://www.zite.com/blog/free-crm-for-small-business (✅ tam sayfa doğrulanmış)
- Zoho CRM Free: 3 user, 5,000 record (✅ doğrulanmış)
- Freshsales Free: 3 user, 1 pipeline (✅ doğrulanmış)

### Payment Provider CRM
- Stripe Customer Portal: https://docs.stripe.com/customer-management (✅ tam sayfa doğrulanmış — ücretsiz, self-serve, cancellation deflection)
- Stripe Billing: https://stripe.com/billing (✅ doğrulanmış)
- Polar.sh Customer Management: https://polar.sh/docs/features/customer-management (✅ doğrulanmış)
- Polar.sh Webhook Events: https://polar.sh/docs/api-reference/webhooks/customer.state_changed (✅ doğrulanmış)

### SaaS Best Practices
- SaaS Customer Lifecycle: https://payproglobal.com/answers/what-is-saas-customer-lifecycle/ (✅ doğrulanmış)
- Zapier Best Free CRMs 2026: https://zapier.com/blog/best-free-crm/ (✅ doğrulanmış)

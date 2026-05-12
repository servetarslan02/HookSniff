# 📊 HookSniff Admin Panel — Detaylı Analiz & Plan

> **Tarih:** 2026-05-12 15:20 GMT+8
> **Hazırlayan:** AI Asistan (Oturum 126)
> **Kaynaklar:** Svix, Hookdeck Outpost, Convoy, SaaS dashboard best practices

---

## 1. MEVCUT DURUM — HookSniff Admin Panel

### 1.1 Mevcut Sayfalar (5 sayfa + layout)

| Sayfa | İçerik | Güçlü Yön | Zayıf Yön |
|-------|--------|-----------|-----------|
| **Overview** | 4 stat kartı + pasta grafik + son kayıt olanlar | Temel metrikler var | Trend yok, canlı veri yok |
| **Users** | Liste + arama + filtre + sayfalama + plan değiştirme + ban | Tam CRUD var | Export yok, toplu işlem yok |
| **User Detail** | Bilgi + plan + endpoint'ler + son teslimatlar | Kullanıcı bazlı görünüm var | Grafik yok, replay yok |
| **Revenue** | MRR + aylık grafik + plan dağılımı | Temel gelir takibi var | Churn analizi zayıf, export yok |
| **System** | DB/Redis/API/Queue sağlık + altyapı bilgisi | 15sn otomatik yenileme var | Geçmiş yok, alert yok |
| **Settings** | Bakım modu + kayıt + plan limitleri + retry | Temel ayarlar var | Alert eşikleri yok |

### 1.2 Backend API Endpoint'leri

```
GET  /v1/admin/users          — Kullanıcı listesi (sayfalama + filtre)
GET  /v1/admin/users/:id      — Kullanıcı detay
PUT  /v1/admin/users/:id/plan — Plan değiştirme
PUT  /v1/admin/users/:id/status — Ban/aktivasyon
GET  /v1/admin/stats          — Sistem istatistikleri
GET  /v1/admin/revenue        — Aylık gelir
POST /v1/admin/sdk-update     — SDK güncelleme bildirimi
GET  /v1/admin/settings       — Platform ayarları
PUT  /v1/admin/settings       — Ayar güncelleme
```

---

## 2. RAKİP ANALİZİ

### 2.1 Svix (Pazar Lideri)

**Admin Dashboard Özellikleri:**
- ✅ Overview: Uygulama sayısı, endpoint sayısı, mesaj hacmi, başarı oranı
- ✅ Applications: Tüketici uygulamaları listesi, her biri için portal
- ✅ Endpoints: URL, filtre, aktif/pasif, throttle ayarları
- ✅ Message Attempts: Her mesaj için teslimat denemeleri, status kodu, yanıt süresi
- ✅ Event Log: Tüm event'lerin zaman çizelgesi
- ✅ Replay: Tek tıkla mesaj yeniden gönderimi (tekli + toplu)
- ✅ Dashboard Analytics: Gerçek zamanlı teslimat metrikleri
- ✅ Application Portal: Müşterilere embed edilebilir self-servis portal
- ✅ Email Notifications: Endpoint devre dışı kaldığında otomatik email
- ✅ SSO/SCIM: Kurumsal erişim kontrolü
- ✅ RBAC: Viewer, Member, Admin, Support Agent rolleri
- ✅ Audit Log: Tüm admin aksiyonlarının kaydı
- ✅ Connector API: Programatik connector yönetimi
- ✅ Feature Flags: Portal önizleme için
- ✅ Terraform Provider: IaC desteği

**Svix'in Güçlü Yanları:**
- 99.99999% uptime, milyarlarca webhook/ay
- Standard Webhooks ekosistemi (OpenAI, Anthropic, Google kullanıyor)
- 11 SDK + CLI
- SOC 2 Type II, HIPAA, PCI-DSS uyumluluğu

### 2.2 Hookdeck Outpost (Açık Kaynak Rakip)

**Admin Dashboard Özellikleri:**
- ✅ Multi-tenant: Tek deployment'ta birden fazla müşteri
- ✅ User Portal: Müşterilerin kendi teslimatlarını görmesi
- ✅ Delivery Failure Alerts: Başarısızlık bildirimleri
- ✅ Event Topics: Publish/subscribe paradigması
- ✅ Automatic + Manual Retries: Otomatik ve manuel tekrar deneme
- ✅ Event Fanout: Tek mesaj → çoklu endpoint
- ✅ OpenTelemetry: Standart observability
- ✅ Destination Types: Webhook, EventBridge, SQS, S3, Pub/Sub, RabbitMQ, Kafka
- ✅ SDKs: Go, Python, TypeScript
- ✅ MCP Server: AI entegrasyonu

**Hookdeck'in Güçlü Yanları:**
- Açık kaynak, self-hosted option
- Düşük maliyet ($1/100K webhook)
- Modern mimari (Go)

### 2.3 Convoy (Enterprise Açık Kaynak)

**Admin Dashboard Özellikleri:**
- ✅ Event Delivery Dashboard: Teslimat metrikleri
- ✅ Endpoint Management: CRUD + filtre
- ✅ Replay: Tekli + toplu yeniden gönderim
- ✅ Circuit Breaker: Endpoint sağlık takibi
- ✅ Rate Limiting: Tenant bazlı
- ✅ Signature Verification: Doğrulama
- ✅ Alerting: Slack, email entegrasyonu

---

## 3. GAP ANALİZİ — HookSniff vs Rakipler

### 3.1 Kritik Eksiklikler (Yapılmazsa rekabet edilemez)

| # | Özellik | Svix | Hookdeck | Convoy | HookSniff | Etki |
|---|---------|------|----------|--------|-----------|------|
| 1 | **Audit Log** | ✅ | ✅ | ✅ | ❌ | Güvenlik & uyumluluk |
| 2 | **Event Replay** | ✅ | ✅ | ✅ | ❌ | Müşteri memnuniyeti |
| 3 | **Alerting** | ✅ | ✅ | ✅ | ❌ | Proaktif sorun yönetimi |
| 4 | **Email Notifications** | ✅ | ✅ | ❌ | ❌ | Müşteri bildirimi |

### 3.2 Önemli Eksiklikler (Rakiplerden geri kalır)

| # | Özellik | Svix | Hookdeck | Convoy | HookSniff | Etki |
|---|---------|------|----------|--------|-----------|------|
| 5 | **Kullanıcı Taklidi** | ✅ | ❌ | ❌ | ❌ | Destek hızı |
| 6 | **Müşteri Bazlı Grafikler** | ✅ | ✅ | ✅ | ❌ | Analiz derinliği |
| 7 | **RBAC Roller** | ✅ | ✅ | ❌ | ❌ | Güvenli erişim |
| 8 | **Export (CSV/JSON)** | ✅ | ✅ | ❌ | ❌ | Raporlama |
| 9 | **Test Console** | ✅ | ✅ | ✅ | ❌ | Debug kolaylığı |

### 3.3 Nice-to-Have (İleride)

| # | Özellik | Svix | Hookdeck | Convoy | HookSniff | Etki |
|---|---------|------|----------|--------|-----------|------|
| 10 | **SSO/SCIM** | ✅ | ✅ | ❌ | ❌ | Enterprise satış |
| 11 | **Real-time Dashboard** | ✅ | ✅ | ❌ | ❌ | Anlık takip |
| 12 | **Terraform Provider** | ✅ | ❌ | ❌ | ❌ | IaC |
| 13 | **Payload Transformation** | ✅ | ❌ | ❌ | ❌ | Esneklik |

---

## 4. TASARIM PRENSipleri — Admin Panel İçin

### 4.1 "Mevcut Sayfalara Göm" Yaklaşımı

**Neden yeni sayfa açmıyoruz?**
- HookSniff henüz erken aşamada, 10+ admin sayfası karmaşa yaratır
- Rakipler (Svix) bile sayfa sayısını minimum tutar
- Kullanıcı (Servet) teknik değil, basit ve anlaşılır olmalı
- Mevcut 5 sayfa + layout yapısı yeterli

**Nasıl gömüyoruz?**
- Her mevcut sayfanın altına yeni kartlar/bölüm ekliyoruz
- Sidebar aynı kalıyor (5 menü öğesi)
- Yalnızca 1 yeni sayfa: "Aktivite Logları" (Overview'den tıklanabilir)

### 4.2 UI Kalite Standartları (Rakiplerden Öğrendiklerimiz)

| Standart | Açıklama | Svix'de Nasıl |
|----------|----------|---------------|
| **Tutarlı Kart Yapısı** | Her veri kartı aynı yapıda | glass-card + header + content |
| **Durum Renkleri** | Yeşil=sarı=kırmızı tutarlı | Badge component ile |
| **Boş State** | Veri yoksa mesaj göster | "Henüz veri yok" + ikon |
| **Yükleme State** | Skeleton loading | Pulse animasyon |
| **Hata State** | API hatası → retry butonu | Red banner + retry |
| **Dark Mode** | Tüm sayfalarda tutarlı | Tailwind dark: prefix |
| **Mobil Uyum** | Tablolar overflow-x-auto | Responsive grid |

---

## 5. UYGULAMA PLANI — 3 Oturum

### 🎯 OTURUM 1 — Audit Log + Event Replay + Export (Bu oturum, ~60 dk)

#### 5.1.1 Audit Log — Backend

**DB Tablosu:**
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES customers(id),
    action VARCHAR(100) NOT NULL,       -- 'user.plan_change', 'user.ban', 'settings.update'
    target_type VARCHAR(50),            -- 'user', 'settings', 'system'
    target_id UUID,                     -- hedef entity ID
    details JSONB,                      -- {old_plan: 'free', new_plan: 'pro'}
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

**Backend Endpoint'leri:**
```
GET /v1/admin/audit-logs?page=1&per_page=20&action=user.ban&admin_id=xxx
```

**Audit Log Kayıt Noktaları (mevcut kodda):**
- `change_plan()` → `action: 'user.plan_change'`
- `change_status()` → `action: 'user.ban'` veya `'user.activate'`
- `update_settings()` → `action: 'settings.update'`
- `upsert_portal_config()` → `action: 'portal.config_update'`

#### 5.1.2 Audit Log — Frontend (Overview Sayfası)

**Overview sayfasına eklenecek:**
```
┌─────────────────────────────────────────────┐
│ 📋 Son Aktiviteler                    Tümü →│
├─────────────────────────────────────────────┤
│ 🔴 Servet, user@example.com'ı banladı      │
│    2 dakika önce                             │
│                                              │
│ 🟡 Plan değiştirildi: free → pro            │
│    15 dakika önce                            │
│                                              │
│ 🟢 Yeni kullanıcı kayıt oldu                │
│    1 saat önce                               │
└─────────────────────────────────────────────┘
```

**Yeni sayfa: `/admin/activity`** (Sidebar'a "Aktivite" menüsü ekle)

#### 5.1.3 Event Replay — Backend

**Yeni Endpoint:**
```
POST /v1/admin/deliveries/:id/replay
```

**Mantık:**
1. Delivery ID'yi bul
2. Orijinal payload'ı al
3. Yeni bir delivery attempt oluştur
4. Worker'a yeniden gönder

#### 5.1.4 Event Replay — Frontend (User Detail Sayfası)

**User Detail sayfasındaki "Recent Deliveries" tablosuna buton ekle:**
```
| ID       | Event        | Status    | Attempts | Time     | Actions |
|----------|-------------|-----------|----------|----------|---------|
| a1b2c3.. | order.created| delivered | 1        | 14:30    | [↩ Tekrar Gönder] |
| d4e5f6.. | payment.fail | failed    | 3        | 14:25    | [↩ Tekrar Gönder] |
```

#### 5.1.5 Export — Backend

**Yeni Endpoint'ler:**
```
GET /v1/admin/users/export?format=csv&plan=pro&status=active
GET /v1/admin/revenue/export?format=csv&months=12
```

#### 5.1.6 Export — Frontend

**Users sayfası:** Tablonun sağına "⬇ CSV" butonu
**Revenue sayfası:** Başlığın sağına "⬇ Rapor İndir" butonu

---

### 🎯 OTURUM 2 — Alerting + Kullanıcı Taklidi (~60 dk)

#### 5.2.1 Alerting — Backend

**DB Tablosu:**
```sql
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),  -- NULL = platform-level
    name VARCHAR(200) NOT NULL,
    metric VARCHAR(50) NOT NULL,        -- 'success_rate', 'latency_p95', 'queue_depth'
    condition VARCHAR(10) NOT NULL,     -- 'below', 'above'
    threshold DECIMAL NOT NULL,         -- 99.0, 5000, 100
    duration_minutes INT DEFAULT 5,     -- ne kadar süre eşik altında kalırsa alarm
    channels JSONB DEFAULT '["email"]', -- ['email', 'slack', 'webhook']
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alert_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES alert_rules(id),
    status VARCHAR(20) DEFAULT 'firing',  -- 'firing', 'resolved'
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    details JSONB
);
```

**Backend Endpoint'leri:**
```
GET    /v1/admin/alerts           — Alert kuralları listesi
POST   /v1/admin/alerts           — Yeni alert kuralı
PUT    /v1/admin/alerts/:id       — Alert kuralı güncelle
DELETE /v1/admin/alerts/:id       — Alert kuralı sil
GET    /v1/admin/alerts/incidents — Alarm olayları
```

**Kontrol Mekanizması (Worker'da):**
- Her 5 dakikada bir metrikleri kontrol et
- Eşik aşıldığında alert_incidents oluştur
- Email/Webhook bildirimi gönder

#### 5.2.2 Alerting — Frontend (System Sayfası)

**System sayfasına eklenecek:**
```
┌─────────────────────────────────────────────┐
│ 🔔 Aktif Alarmlar                           │
├─────────────────────────────────────────────┤
│ ⚠️  Teslimat oranı %95'in altına düştü      │
│     12 dakika önce tetiklendi                │
│     [Detay] [Sessize Al]                     │
│                                              │
│ ✅ Endpoint yanıt süresi normale döndü      │
│     30 dakika önce çözüldü                   │
└─────────────────────────────────────────────┘
```

**Settings sayfasına eklenecek:**
```
┌─────────────────────────────────────────────┐
│ 🚨 Alert Eşikleri                           │
├─────────────────────────────────────────────┤
│ Teslimat Başarı Oranı  [▼ %95] altı → alarm│
│ P95 Yanıt Süresi       [▼ 5000ms] üstü     │
│ Kuyruk Derinliği        [▼ 100] üstü        │
│ Başarısız Teslimat      [▼ 10/saat] üstü    │
│                                              │
│ Bildirim Kanalı: ☑ Email  ☑ Slack           │
└─────────────────────────────────────────────┘
```

#### 5.2.3 Kullanıcı Taklidi — Backend

**Yeni Endpoint:**
```
POST /v1/admin/users/:id/impersonate
```

**Mantık:**
1. Admin olduğunu doğrula
2. Hedef kullanıcı için kısa ömürlü token oluştur (15 dk)
3. Audit log'a kaydet
4. Token'ı döndür

#### 5.2.4 Kullanıcı Taklidi — Frontend

**Users sayfası ve User Detail sayfasına buton:**
```
[👁️ Kullanıcı Görünümü] → Yeni sekmede dashboard açılır (kullanıcı gibi)
```

---

### 🎯 OTURUM 3 — Müşteri Grafikleri + Test Console (~60 dk)

#### 5.3.1 Müşteri Bazlı Grafikler — Backend

**Yeni Endpoint:**
```
GET /v1/admin/users/:id/analytics?days=30
```

**Döndürür:**
```json
{
  "daily_deliveries": [
    {"date": "2026-05-01", "total": 150, "success": 148, "failed": 2},
    ...
  ],
  "top_events": [
    {"event": "order.created", "count": 500},
    {"event": "payment.completed", "count": 300}
  ],
  "endpoint_health": [
    {"url": "https://...", "success_rate": 99.5, "avg_latency_ms": 230}
  ]
}
```

#### 5.3.2 Müşteri Bazlı Grafikler — Frontend (User Detail)

**User Detail sayfasına 3 grafik kartı ekle:**
1. **Günlük Teslimat Grafiği** — Line chart (son 30 gün)
2. **Event Dağılımı** — Pie chart (en çok kullanılan event'ler)
3. **Endpoint Sağlık** — Bar chart (başarı oranı)

#### 5.3.3 Test Console — Backend

**Yeni Endpoint:**
```
POST /v1/admin/test-webhook
```

**Mantık:**
1. Admin'in belirlediği payload'ı al
2. Belirtilen endpoint'e gönder
3. Sonucu döndür (status code, yanıt, süre)

#### 5.3.4 Test Console — Frontend

**Yeni sayfa yok — System sayfasına "Webhook Test" kartı ekle:**
```
┌─────────────────────────────────────────────┐
│ 🧪 Webhook Test                             │
├─────────────────────────────────────────────┤
│ Endpoint URL: [https://...           ]       │
│ Event Type:   [order.created         ]       │
│ Payload:      [{ "order_id": "123" } ]       │
│                                              │
│ [🚀 Test Gönder]                             │
│                                              │
│ ✅ 200 OK — 230ms                           │
│ Response: {"received": true}                 │
└─────────────────────────────────────────────┘
```

---

## 6. TECHNICAL DEBT & NOTES

### 6.1 Mevcut Sorunlar (Düzeltilecek)
- `/v1/admin/stats` ve `/v1/admin/revenue` → DATABASE_ERROR (Neon DB query uyumsuzluğu)
- Revenue hesaplama: Plan fiyat hardcoded ($29/$99) → DB'den okunmalı
- Settings sayfası: API'den veri gelmiyor (default kullanıyor)

### 6.2 Gelecek İçin Notlar
- Alert sistemi için Redis pub/sub kullanılabilir
- Real-time dashboard için SSE (Server-Sent Events) yeterli
- Export için streaming response (büyük veri setleri)
- Audit log retention: 90 gün (sonra arşiv)

---

## 7. SONUÇ — Neden Bu Plan?

### Rakiplerden Öğrendiklerimiz:
1. **Svix** → En güçlü yönü "Application Portal" (müşteri self-servis). Bizde de var ama eksik.
2. **Hookdeck** → En güçlü yönü "Alerting" + "Metrics Export". Bizde hiç yok.
3. **Convoy** → En güçlü yönü "Replay" + "Circuit Breaker". Bizde replay yok.

### HookSniff'in Avantajları:
1. **Tek stack** — Rust backend + Next.js frontend (Svix Go+React, Hookdeck Go+React)
2. **Düşük maliyet** — Neon + Upstash + Vercel (serverless)
3. **Hızlı iterasyon** — Açık kaynak, tek geliştirici (Servet + AI)
4. **Türkçe destek** — i18n altyapısı hazır

### Hedef:
3 oturumda (3 saat) rakiplerin %80'ini yakalamak. Kalan %20 (SSO, Terraform, mTLS) enterprise aşamasında.

---

*Bu dosya her oturum sonunda güncellenmeli.*

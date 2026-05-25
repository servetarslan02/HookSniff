# 🔒 Güvenlik — Hız Sınırı, Denetim Günlüğü, SSO/SAML, Çıkış IP'leri

> **Bölüm:** Güvenlik  
> **İçerik:** Hız Sınırı, Denetim Günlüğü, SSO/SAML, Çıkış IP'leri  
> **İnceleme Tarihi:** 2026-05-12/13  
> **Güncelleme:** 2026-05-13 (kod değişiklikleriyle eşleştirildi)  
> **Kaynak Dosyalar:** `20-hiz-siniri.md`, `21-denetim-gunlugu.md`, `22-sso-saml.md`, `33-cikis-ip.md`

---

## 📑 İçindekiler

- [1. Hız Sınırı (Rate Limiting)](#1-hiz-siniri-rate-limiting)
- [2. Denetim Günlüğü (Audit Log)](#2-denetim-gunlugu-audit-log)
- [3. SSO / SAML](#3-sso--saml)
- [4. Çıkış IP'leri (Outbound IPs)](#4-cikis-ipleri-outbound-ips)

---

## 1. Hız Sınırı (Rate Limiting)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/rate-limiting/page.tsx`  
> Route: `/rate-limiting`

### Sayfa Yapısı
- RateLimitInfo — Endpoint bazlı limit bilgisi
- RateLimitStats — Genel istatistikler

#### RateLimitInfo
- endpoint_id, endpoint_url, requests_per_second, requests_per_minute
- burst_size, current_queue_depth, throttled_count, last_throttled_at

#### RateLimitStats
- total_endpoints, total_throttled, avg_rps, peak_rps, limits[]

### Özellikler
- ✅ Genel istatistikler (toplam endpoint, throttle, RPS)
- ✅ Endpoint bazlı limit listesi
- ✅ RPS ve burst size gösterimi
- ✅ Queue depth ve throttle sayısı
- ✅ Son throttle zamanı

### Tespit Edilen Durumlar

#### ⚠️ Potansiyel Sorunlar
- **Veri dönüştürme** — API'den gelen veri stats formatına dönüştürülüyor
- **Bazı alanlar hardcoded 0** — current_queue_depth, throttled_count

#### 🔴 Eksiklikler
- Rate limit düzenleme formu
- Endpoint bazlı limit ayarlama
- Throttle geçmişi grafiği
- Rate limit alert entegrasyonu

### Backend & Frontend Uyumsuzluğu

#### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Rate limit ayarlama | `POST /v1/rate-limits/{endpoint_id}` (set_rate_limit) | ❌ Form yok | EKLENMELİ |
| Rate limit silme | `DELETE /v1/rate-limits/{endpoint_id}` (delete_rate_limit) | ❌ Buton yok | EKLENMELİ |

---

## 2. Denetim Günlüğü (Audit Log)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/audit-log/page.tsx`  
> Route: `/audit-log`

### Sayfa Yapısı
- AuditEntry — Denetim kaydı
- Action icons map (17 farklı aksiyon)

#### AuditEntry
- id, timestamp, actor, actor_email, action, resource_type, resource_id
- details, ip_address, user_agent

#### Action Icons
| Aksiyon | İkon |
|---------|------|
| auth.login | 🔑 |
| auth.logout | 👋 |
| auth.register | 👤 |
| endpoint.create | 🔗 |
| endpoint.update | ✏️ |
| endpoint.delete | 🗑️ |
| apikey.create | 🔑 |
| apikey.rotate | 🔄 |
| apikey.delete | 🗑️ |
| webhook.send | 📦 |
| webhook.replay | 🔄 |
| team.invite | 👥 |
| team.remove | 👋 |
| settings.update | ⚙️ |
| billing.update | 💳 |
| schema.create | 📋 |
| portal.update | 🖼️ |

### Özellikler
- ✅ Sayfalama (50 kayıt/sayfa, has_more)
- ✅ Aksiyon filtresi
- ✅ Aksiyon ikonları
- ✅ Tarih/saat gösterimi
- ✅ IP ve User Agent
- ✅ Empty state
- ✅ Loading state

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- 17 farklı aksiyon ikonu
- Sayfalama (load more pattern)
- Filtreleme
- Error handling (endpoint yoksa empty state)

#### 🔴 Eksiklikler

#### 🆕 Eklenecekler (Sektör Karşılaştırma)
- **Session management** — Aktif oturum listesi ve sonlandırma
- **2FA zorunlu** — Admin kullanıcılar için 2FA zorunluluğu
- **IP whitelist** — Admin paneline erişim IP kısıtlaması
- **Login history** — Giriş denemeleri kaydı (başarılı/başarısız)
- **Anomali tespiti** — Olağandışı aktivite uyarısı
- **SSRF attempt log** — Güvenlik olaylarını izleme
- **Spoofing attempt log** — Sahte webhook tespit log'u
- **Replay attempt log** — Replay saldırı tespit log'u
- **Endpoint disable log** — Endpoint devre dışı kalma geçmişi
- **Support Agent erişim log** — Destek ekibi portal erişim kaydı (Svix ✅)
- **Quick filter** — Log listesinde tek tıkla filtre (Hookdeck ✅)
- Export (CSV/JSON)
- Tarih aralığı filtresi
- Actor bazlı filtreleme
- Resource bazlı filtreleme
- IP bazlı filtreleme

---

## 3. SSO / SAML

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/sso/page.tsx`  
> Route: `/sso`

### Sayfa Yapısı
- SAML ve OIDC provider desteği
- Konfigürasyon: metadata_url, entity_id, sso_url, certificate
- Enabled/disabled toggle

#### SAML Config
- metadata_url — Metadata URL
- entity_id — Entity ID
- sso_url — SSO URL
- certificate_set — Sertifika var/yok

#### OIDC Config
- issuer_url — Issuer URL
- client_id — Client ID
- client_secret_set — Secret var/yok

### Özellikler
- ✅ SAML/OIDC provider seçimi
- ✅ Metadata/Issuer URL girişi
- ✅ Entity ID/Client ID girişi
- ✅ SSO URL girişi
- ✅ Sertifika girişi
- ✅ Enable/disable toggle
- ✅ Kaydetme

### Tespit Edilen Durumlar

#### ⚠️ Potansiyel Sorunlar
- **Config yoksa boş form** — İlk kurulum rehberi yok
- **Sertifika doğrulama yok** — PEM format kontrolü

#### 🔴 Eksiklikler
- SSO test butonu (connection test)
- SSO kurulum rehberi/wizard
- Metadata otomatik çekme (URL'den)
- Sertifika geçerlilik kontrolü
- SSO kullanıcı eşleştirmesi
- SSO activity log

---

## 4. Çıkış IP'leri (Outbound IPs)

> Sayfa: ❌ OLUŞTURULMALI  
> Route: `/outbound-ips`  
> Backend: `api/src/routes/outbound_ips.rs` — mevcut

### Backend Durumu

#### Mevcut Endpoint'ler
| Method | Route | Açıklama |
|--------|-------|----------|
| GET | `/v1/outbound-ips` | Çıkış IP listesi |

### Frontend Yapılacaklar

#### Sayfa Yapısı
1. **IP Listesi** — Tüm çıkış IP'leri (tablo)
2. **Kopyalama** — Tek tek ve toplu kopyalama butonu
3. **Format Seçici** — CIDR, tekil IP, firewall rule formatı
4. **Bilgi Kartı** — "Bu IP'leri firewall whitelist'inize ekleyin" açıklaması

#### Neden Önemli?
- Enterprise müşteriler webhook almak için IP whitelist yapar
- HookSniff'in hangi IP'lerden webhook gönderdiğini bilmeleri gerekir
- Svix ve Hookdeck bu bilgiyi dashboard'da gösteriyor

#### Sidebar Ekleme
```typescript
// sections.config.items'a ekle:
{ name: t('outboundIps'), href: '/outbound-ips', icon: '🌐' }
```

#### i18n Anahtarları (EN + TR)
- outboundIps, outboundIpsDesc, copyAll, copied, firewallNote, cidrFormat, singleIpFormat

#### Öncelik: 🔴 KRİTİK — Enterprise müşteriler firewall whitelist yapamıyor

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Rate Limit Ayarlama Formu Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/rate-limiting/page.tsx`
- **Backend:** `POST /v1/rate-limits/{endpoint_id}` — rate limit ayarlama
- **Sorun:** Sadece okuma var, ayarlama formu yok.
- **Adımlar:**
  1. "Limit Ayarla" butonu ekle
  2. Modal form: endpoint seçici, requests_per_second (input), burst_size (input)
  3. `apiFetch('/rate-limits/${endpointId}', { method: 'POST', body: { requests_per_second, burst_size }, token })` çağrısı
  4. Mevcut limit varsa düzenleme modu
  5. i18n key: `setRateLimit`, `requestsPerSecond`, `burstSize`, `rateLimitSet`

#### BF-02: Rate Limit Silme Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/rate-limiting/page.tsx`
- **Backend:** `DELETE /v1/rate-limits/{endpoint_id}` — rate limit silme
- **Sorun:** Silme butonu yok.
- **Adımlar:**
  1. Her rate limit kartına silme butonu ekle
  2. ConfirmDialog: "Rate limit silinecek"
  3. `apiFetch('/rate-limits/${endpointId}', { method: 'DELETE', token })` çağrısı

#### BF-03: SSO Test Butonu Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/sso/page.tsx`
- **Backend:** `POST /v1/sso/test` — SSO bağlantı testi
- **Durum:** `ssoApi.testSso` api.ts'de tanımlı ✅, UI'da buton yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     testSso: (token: string) =>
       apiFetch<{ success: boolean; message: string }>('/sso/test', { method: 'POST', token }),
     ```
  2. SSO yapılandırma formuna "Bağlantıyı Test Et" butonu ekle
  3. Sonuç: ✅ Başarılı / ❌ Başarısız + hata mesajı
  4. i18n key: `testSsoConnection`, `ssoTestSuccess`, `ssoTestFailed`

#### BF-04: Rate Limit Düzenleme — Toplu
- **Frontend:** "Varsayılan Limit" kartı + ayarlama formu

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik (Hız Sınırı, SSO)
- **Etkilenen Dosyalar:**
  - `dashboard/src/app/[locale]/(dashboard)/rate-limiting/page.tsx`
  - `dashboard/src/app/[locale]/(dashboard)/sso/page.tsx`
- **Sorun:** Birden fazla `useEffect`, fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-dashboard-core P-01)

#### P-02: Pagination Eksik — Hız Sınırı
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/rate-limiting/page.tsx`
- **Sorun:** Tüm limitler tek seferde yükleniyor.

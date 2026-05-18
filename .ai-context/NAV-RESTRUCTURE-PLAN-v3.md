# Dashboard Restructure Plan v3 — Final

> Tarih: 2026-05-19 02:57 GMT+8
> Durum: Karar verildi, uygulanacak
> Prensip: Tekrar yok, mantıklı gruplama, her şey sidebar'da görünür

---

## 📊 Mevcut Durum Analizi

### Sidebar'daki Section Sayfaları (container — tab'lı)

| Section Sayfa | İçindeki Tab'lar | Satır |
|---|---|---|
| core | DashboardOverview + API Keys | 32 |
| deliveries | Logs + Deliveries + Search | 33 |
| content-mgmt | Schemas + Templates + Inbound + Transforms | 36 |
| devtools | Playground + Signature Verifier + Webhook Builder + API Importer | 32 |
| observability | Health + Alerts + Analytics | 34 |
| security-section | Rate Limiting + Audit Log + SSO | 34 |
| routing-config | Retry Policy + Routing + Custom Domain | 34 |
| billing-section | Billing | 30 |
| settings-section | Settings + Service Tokens | 21 |
| portal-section | Portal Customize + Portal Manage | 32 |
| team-mgmt | Team + Notifications + Applications | 23 |
| account | Team + Notifications + Settings + Portal Manage | 38 |

### Sidebar'da Olmayan独立 Sayfalar

| Sayfa | Satır | Ne yapıyor |
|---|---|---|
| applications | 401 | Uygulama listesi + oluştur |
| environments | 133 | Ortam değişkenleri |
| background-tasks | 98 | Arka plan görevleri |
| operational-webhooks | 168 | Operasyonel webhook'lar |
| message-poller | 220 | Mesaj yoklayıcı |
| inbound | 156 | Gelen webhook'lar |
| connectors | 204 | Bağlayıcılar |
| integrations | 549 | Entegrasyonlar |
| streaming | 465 | Gerçek zamanlı yayın |
| endpoints | 382 | Endpoint yönetimi |

### Tespit Edilen Sorunlar

**KORKUNÇ TEKRARLAR:**
| Sayfa | Kaç yerde görünüyor | Nerede |
|---|---|---|
| Team | 3 kez | team-mgmt, account, sidebar |
| Notifications | 3 kez | team-mgmt, account, sidebar |
| Settings | 3 kez | settings-section, account, sidebar |
| Applications | 2 kez | team-mgmt, sidebar |
| Portal Manage | 2 kez | portal-section, account |
| API Keys | 2 kez | core, billing-overview |
| Billing | 2 kez | billing-section, billing-overview |

---

## ✅ Yeni Sidebar Yapısı (12 Section, ~25 Sayfa)

```
🪝 HookSniff Dashboard
│
├── 📊 GENEL BAKIŞ (core)
│   ├── Dashboard (özet istatistikler)
│   └── API Anahtarları
│
├── 📱 UYGULAMALAR (applications) ← 独立 sayfa, 401 satır
│   └── [detay sayfası] → Endpoint'ler (382 satır)
│
├── 🔗 TESLİMATLAR (deliveries)
│   ├── Loglar (417 satır)
│   ├── Teslimatlar (33 satır - list)
│   └── Arama (131 satır)
│
├── 📡 GÖZLEM (observability)
│   ├── Sağlık (148 satır)
│   ├── Uyarılar (367 satır)
│   └── Analitik (156 satır)
│
├── 📥 WEBHOOK'LAR
│   ├── Gelen Webhook'lar (156 satır)
│   ├── Operasyonel Webhook'lar (168 satır)
│   └── Mesaj Yoklayıcı (220 satır)
│
├── 🔌 ENTEGRASYONLAR
│   ├── Bağlayıcılar (204 satır)
│   ├── Entegrasyonlar (549 satır)
│   └── Yayın (465 satır)
│
├── 🛠️ GELİŞTİRİCİ ARAÇLARI (devtools)
│   ├── Playground (sandbox)
│   ├── İmza Doğrulayıcı (260 satır)
│   ├── Webhook Oluşturucu (256 satır)
│   └── API İçe Aktarıcı (70 satır)
│
├── 📐 İÇERİK (content-mgmt)
│   ├── Şemalar (42 satır)
│   ├── Şablonlar (55 satır)
│   └── Dönüştürmeler (181 satır)
│
├── 🔀 YAPILANDIRMA
│   ├── Yönlendirme (48 satır)
│   ├── Tekrar Politikası (52 satır)
│   ├── Özel Alan Adı (176 satır)
│   ├── Hız Sınırı (231 satır)
│   └── Ortamlar (133 satır)
│
├── 🔒 GÜVENLİK
│   ├── SSO / SAML (268 satır)
│   ├── Denetim Günlüğü (137 satır)
│   └── Arka Plan Görevleri (98 satır)
│
├── 🪝 PORTAL
│   ├── Portal Özelleştir (268 satır)
│   └── Portal Yönet (191 satır)
│
├── 💳 FATURALANDIRMA
│   └── Plan & Ödeme (193 satır)
│
└── 👤 HESAP
    ├── Profil & Ayarlar (35 satır)
    ├── Ekip Yönetimi (189 satır)
    ├── Bildirimler (283 satır)
    └── Hizmet Jetonları (182 satır)
```

---

## 📋 Değişiklik Özeti

| İşlem | Sayfa | Neden |
|---|---|---|
| 🔴 Sil | team-mgmt | Tekrar — team/account'da var |
| 🔴 Sil | billing-overview | Tekrar — billing-section'da var |
| 🔴 Sil | settings-section | Tekrar — account'da var |
| 🟡 Birleştir | account → Hesap section | Profil + Ekip + Bildirim + Jetonlar |
| 🟢 Sidebar'a ekle | environments, endpoints, operational-webhooks, message-poller, inbound, connectors, integrations, streaming |独立 çalışan sayfalar |
| 🟢 Yeni grup | WEBHOOK'LAR | inbound + operational + poller mantıklı grup |
| 🟢 Yeni grup | ENTEGRASYONLAR | connectors + integrations + streaming mantıklı grup |

---

## 🔄 Birleştirme Haritası

```
ESKI                              → YENİ
─────────────────────────────────────────────────
/team-mgmt                        → /account (Team tab) — SİL
/billing-overview                 → /account (Billing tab) — SİL
/settings-section                 → /account (Settings tab) — SİL
/portal-section                   → /portal (tek sayfa)
/content-mgmt                     → /content (tek sayfa)
/security-section                 → /security (tek sayfa)
/routing-config                   → /config (tek sayfa)
/billing-section                  → /billing (tek sayfa)
```

---

## 🏗️ Uygulama Adımları

### Adım 1: Sidebar Güncellemesi
- `layout.tsx` içindeki `sections` dizisini yeni yapıya göre güncelle
- Silinecek section'ları kaldır (team-mgmt, billing-overview, settings-section)
- Yeni section'ları ekle (WEBHOOK'LAR, ENTEGRASYONLAR, YAPILANDIRMA, GÜVENLİK, PORTAL)

### Adım 2: Yeni Container Sayfaları Oluştur
- `/webhooks` → Gelen + Operasyonel + Poller tab'ları
- `/integrations` → Bağlayıcılar + Entegrasyonlar + Yayın tab'ları
- `/config` → Yönlendirme + Tekrar + Özel Alan + Hız Sınırı + Ortamlar tab'ları
- `/security` → SSO + Denetim + Arka Plan Görevleri tab'ları
- `/portal` → Özelleştir + Yönet tab'ları

### Adım 3: Eski URL Redirect
- Eski URL'leri yeni URL'lere redirect et (Next.js middleware)
- SEO + bookmark koruması

### Adım 4: i18n Güncellemesi
- `tr.json` ve `en.json` dosyalarına yeni nav anahtarları ekle

### Adım 5: Test
- Tüm sayfaların yüklenmesini kontrol et
- Tab geçişlerinin çalıştığını doğrula
- Mobil responsive kontrol

---

## ⚠️ Notlar

- Mevcut component'ler **silinmeyecek** — tab container'lar dynamic import ile çağıracak
- Eski URL'ler redirect edilecek (SEO + bookmark koruması)
- `applications/[id]`, `deliveries/[id]`, `endpoints/[id]` detail sayfaları korunacak
- Admin panel ayrı kalacak (`/admin`)
- Public sayfalar (landing, docs, blog) etkilenmeyecek
- Arka Plan Görevleri (background-tasks) GÜVENLİK altında — operasyonel takip için mantıklı

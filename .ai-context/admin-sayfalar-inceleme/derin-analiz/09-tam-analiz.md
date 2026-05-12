# 🔬 TAM ANALİZ — Tek Pass, Her Şey

> Tarih: 2026-05-13
> Yöntem: Otomatik tarama — tüm dosyalar, tüm pattern'ler
> Kapsam: 30 dashboard sayfası, 7 admin sayfası, 67 bileşen, 20 hook, api.ts

---

## 📊 TOPLAM BULUNAN SORUN: 108

| # | Kategori | Sayı | Kaynak |
|---|----------|------|--------|
| A | Kullanılmayan api.ts metodları | 11 | api.ts taraması |
| B | Backend endpoint müşteri erişemez | 21 | backend ↔ api.ts karşılaştırması |
| C | Memory leak (useEffect cleanup yok) | 5 | bileşen taraması |
| D | Race condition (abort kontrolü yok) | 26 | sayfa taraması |
| E | Pagination eksik | 19 | sayfa taraması |
| F | Raw fetch (apiFetch yerine) | 7 | sayfa taraması |
| G | Kullanılmayan bileşen | 8 | bileşen taraması |
| H | Kullanılmayan hook | 2 | hook taraması |
| I | localStorage-only veri | 2 | bileşen taraması |
| J | any/unknown type | 1 | sayfa taraması |
| K | console.log production'da | 1 | sayfa taraması |

---

## A. KULLANILMAYAN api.ts METODLARI (11)

Bu metodlar `api.ts`'de tanımlı ama hiçbir sayfa çağırmıyor:

| # | Metod | Ne İşe Yarar | Etki |
|---|-------|--------------|------|
| 1 | `webhooksApi.batch` | Toplu webhook gönderme | Müşteri batch yapamıyor |
| 2 | `adminApi.updateSettings` | Admin ayarlarını güncelleme | Raw fetch kullanılıyor |
| 3 | `adminApi.createFeatureFlag` | Feature flag oluşturma | Admin flag oluşturamıyor |
| 4 | `adminApi.updateFeatureFlag` | Feature flag güncelleme | Admin flag güncelleyemiyor |
| 5 | `adminApi.deleteFeatureFlag` | Feature flag silme | Admin flag silemiyor |
| 6 | `teamsApi.get` | Ekip detayı | Ekip detay sayfası yok |
| 7 | `notificationsApi.getUnreadCount` | Okunmamış bildirim sayısı | Badge sayısı gösterilmiyor |
| 8 | `billingApiExtended.getInvoices` | Fatura listesi | Faturalar yüklenmiyor olabilir |
| 9 | `billingApiExtended.getUsage` | Kullanım detayı | Kullanım yüklenmiyor olabilir |
| 10 | `billingApi.getInvoices` | Fatura listesi (duplicate) | Gereksiz tanımlama |
| 11 | `analyticsApi.latencyTrend` | Gecikme trendi | Grafik gösterilmiyor |

---

## B. BACKEND ENDPOINT — MÜŞTERİ ERİŞEMEZ (21)

Bu endpoint'ler backend'de çalışır ama api.ts'de tanımlı olmadığı için müşteri panelinden erişilemez:

### Kimlik Doğrulama (7)
| # | Endpoint | Açıklama | Neden Önemli |
|---|----------|----------|-------------|
| 1 | `POST /auth/2fa/enable` | 2FA başlatma | Güvenlik |
| 2 | `POST /auth/2fa/confirm` | 2FA doğrulama | Güvenlik |
| 3 | `POST /auth/2fa/verify` | 2FA giriş doğrulama | Güvenlik |
| 4 | `POST /auth/2fa/disable` | 2FA kapatma | Güvenlik |
| 5 | `GET /auth/export` | GDPR veri dışa aktarma | Yasal zorunluluk |
| 6 | `POST /auth/revoke-all-tokens` | Tüm token'ları iptal | Güvenlik |
| 7 | `DELETE /auth/account` | Hesap silme | GDPR (ama DangerZoneSection'da direkt çağrı var) |

### Eksik Sayfalar (5)
| # | Endpoint | Açıklama |
|---|----------|----------|
| 8 | `GET/POST /applications/` | Uygulama CRUD |
| 9 | `POST /simulator/` | Simülatör |
| 10 | `GET /stream/deliveries` | SSE stream |
| 11 | `GET /outbound-ips/` | Çıkış IP'leri |
| 12 | `GET/POST/DELETE /devices/` | Cihaz yönetimi |

### Eksik Özellikler (9)
| # | Endpoint | Açıklama |
|---|----------|----------|
| 13 | `GET /webhooks/export` | Webhook export |
| 14 | `POST /webhooks/batch/replay` | Batch replay |
| 15 | `POST /schemas/{id}/validate` | Schema doğrulama |
| 16 | `POST /templates/{id}/apply` | Template uygulama |
| 17 | `POST /sso/test` | SSO test |
| 18 | `POST /custom_domains/{id}/verify` | Domain doğrulama |
| 19 | `POST /billing/refund` | İade |
| 20 | `GET /billing/portal` | Customer portal |
| 21 | `POST /endpoints/{id}/rotate-secret` | Secret rotasyonu |

---

## C. MEMORY LEAK — useEffect Cleanup Eksik (5)

Bu bileşenler `setTimeout` kullanıyor ama cleanup döndürmüyorsa bileşen unmount olduktan sonra timer çalışmaya devam eder:

| # | Bileşen |
|---|---------|
| 1 | `(dashboard)/api-keys/components/NewKeyAlert.tsx` |
| 2 | `(dashboard)/deliveries/[id]/page.tsx` |
| 3 | `(dashboard)/settings/components/ApiKeySection.tsx` |
| 4 | `(dashboard)/settings/components/PasswordSection.tsx` |
| 5 | `(dashboard)/settings/components/ProfileSection.tsx` |

---

## D. RACE CONDITION — AbortController Eksik (26)

Bu sayfalar API çağrısı yapıyor ama bileşen unmount edildiğinde istek iptal edilmiyor:

| # | Sayfa | useEffect |
|---|-------|-----------|
| 1 | `alerts/page.tsx` | 2 |
| 2 | `analytics/page.tsx` | 2 |
| 3 | `api-keys/page.tsx` | 2 |
| 4 | `audit-log/page.tsx` | 2 |
| 5 | `deliveries/[id]/page.tsx` | 2 |
| 6 | `deliveries/page.tsx` | 2 |
| 7 | `endpoints/[id]/page.tsx` | 2 |
| 8 | `endpoints/page.tsx` | 2 |
| 9 | `health/page.tsx` | 2 |
| 10 | `inbound/page.tsx` | 2 |
| 11 | `logs/page.tsx` | 3 |
| 12 | `notifications/page.tsx` | 2 |
| 13 | `page.tsx` (dashboard) | 3 |
| 14 | `playground/playground/page.tsx` | 2 |
| 15 | `portal-customize/page.tsx` | 2 |
| 16 | `portal-manage/page.tsx` | 2 |
| 17 | `rate-limiting/page.tsx` | 2 |
| 18 | `retry-policy/page.tsx` | 2 |
| 19 | `routing/page.tsx` | 2 |
| 20 | `schemas/page.tsx` | 2 |
| 21 | `search/page.tsx` | 3 |
| 22 | `sso/page.tsx` | 2 |
| 23 | `team/page.tsx` | 3 |
| 24 | `templates/page.tsx` | 2 |
| 25 | `transforms/page.tsx` | 3 |
| 26 | `webhooks/webhooks/new/page.tsx` | 2 |

---

## E. PAGINATION EKSİK (19)

Bu sayfalar veri listeliyor ama pagination yok — tüm veri tek seferde yükleniyor:

| # | Sayfa |
|---|-------|
| 1 | `alerts/page.tsx` |
| 2 | `analytics/page.tsx` |
| 3 | `api-importer/page.tsx` |
| 4 | `custom-domain/page.tsx` |
| 5 | `endpoints/page.tsx` |
| 6 | `health/page.tsx` |
| 7 | `inbound/page.tsx` |
| 8 | `page.tsx` (dashboard) |
| 9 | `playground/playground/page.tsx` |
| 10 | `portal-customize/page.tsx` |
| 11 | `rate-limiting/page.tsx` |
| 12 | `schemas/page.tsx` |
| 13 | `signature-verifier/page.tsx` |
| 14 | `templates/page.tsx` |
| 15 | `transforms/page.tsx` |
| 16 | `webhook-builder/page.tsx` |
| 17 | `webhooks/glossary/page.tsx` |
| 18 | `webhooks/guides/page.tsx` |
| 19 | `webhooks/page.tsx` |

---

## F. RAW FETCH — apiFetch Yerine (7)

Bu dosyalar `fetch()` kullanıyor — auth, CSRF, retry, timeout koruması yok:

| # | Dosya | Adet |
|---|-------|------|
| 1 | `playground/content.tsx` | 7x |
| 2 | `admin/settings/page.tsx` | 5x |
| 3 | `admin/system/page.tsx` | 2x |
| 4 | `admin/page.tsx` | 1x |
| 5 | `api-importer/components/SpecInputPanel.tsx` | 1x |
| 6 | `endpoints/[id]/components/SignatureCard.tsx` | 1x |
| 7 | `playground/playground/page.tsx` | 1x |

---

## G. KULLANILMAYAN BİLEŞENLER (8)

Bu bileşenler `dashboard/src/components/`'da tanımlı ama hiçbir sayfa tarafından import edilmiyor:

| # | Bileşen | Ne İşe Yarar |
|---|---------|-------------|
| 1 | `CodeBlock` | Kod bloğu gösterimi |
| 2 | `CookieConsent` | Cookie onay banner'ı |
| 3 | `EmptyState` | Boş durum gösterimi |
| 4 | `Footer` | Sayfa altlığı |
| 5 | `PublicNavbar` | Public sayfa navbar'ı |
| 6 | `SdkTabs` | SDK sekme bileşeni |
| 7 | `ThemeProvider` | Tema sağlayıcı |
| 8 | `ThemeToggle` | Tema değiştirici |

---

## H. KULLANILMAYAN HOOK'LAR (2)

| # | Hook | Ne İşe Yarar |
|---|------|-------------|
| 1 | `useDeliveryStream` | Real-time SSE delivery stream |
| 2 | `useUsername` | Kullanıcı adı hook'u |

---

## I. LOCALSTORAGE-ONLY VERİ (2)

Bu dosyalarda veri sadece localStorage'da — backend'e gönderilmiyor:

| # | Dosya | Sorun |
|---|-------|-------|
| 1 | `playground/content.tsx` | Playground geçmişi localStorage'da |
| 2 | `settings/components/ConsentToggle.tsx` | GDPR onayları localStorage'da, API çağırmıyor |

---

## J. ANY/UNKNOWN TYPE (1)

| # | Dosya | Adet |
|---|-------|------|
| 1 | `notifications/page.tsx` | 1x |

---

## K. CONSOLE.LOG PRODUCTION'DA (1)

| # | Dosya | Satır |
|---|-------|-------|
| 1 | `playground/content.tsx` | `console.log('Captured requests:', data)` |

---

## 📋 ÖNCELİK MATRİSİ

### 🔴 KRİTİK — Hemen (15)
1-4. 2FA endpoint'leri api.ts'de yok
5. GDPR export api.ts'de yok
6-7. Memory leak (5 bileşen)
8. Race condition (26 sayfa — en kritik 5'i)
9. Admin settings raw fetch (5x)
10. Feature flags CRUD yok
11. ConsentToggle API çağırmıyor
12. Outbound IPs sayfası yok
13. Webhook export butonu yok
14. Secret rotasyonu UI yok
15. Latency trend grafiği yok

### 🟡 YÜKSEK — 1-2 hafta (25)
- 11 kullanılmayan api.ts metodu
- 19 pagination eksik sayfa
- Batch replay butonu
- Schema doğrulama butonu
- Template "Kullan" butonu
- SSO test butonu
- Domain doğrulama butonu

### 🟢 ORTA — 1 ay (15)
- 8 kullanılmayan bileşen
- 2 kullanılmayan hook
- Raw fetch → apiFetch dönüşümleri
- any/unknown type düzeltmesi
- console.log kaldırma

---

**Toplam: 108 sorun tespit edildi**

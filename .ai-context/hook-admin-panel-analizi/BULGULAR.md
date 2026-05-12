# Admin Panel — Detaylı Bulgular

> Tarih: 2026-05-12  
> Her sayfa satır satır incelenmiştir.

---

## 01 — Layout (layout.tsx)

### 🔴 Kritik Sorunlar
1. **Client-side auth guard yetersiz** — `user.is_admin` sadece frontend'de kontrol ediliyor. Backend'de her `/admin/*` endpoint'inde ayrıca kontrol yapılmalı. Kullanıcı token'ı ile doğrudan API'ye istek atarak admin verilerine erişebilir.
2. **Document title hardcoded** — `document.title = 'HookSniff — Webhook Teslimat Servisi'` her admin sayfasında aynı. Sayfa bazlı başlık olmalı (ör: "Admin | Kullanıcılar").
3. **Quick Search sadece kullanıcı arıyor** — `router.push(/admin/users?search=...)` hardcoded. Endpoint, event, delivery araması yapılamıyor.

### 🟡 Orta Seviye Sorunlar
4. **Sidebar navigation statik** — `adminNavigation` array'i hardcoded. Plugin veya modüler yapı yok.
5. **Profile dropdown hover ile açılıyor** — `group-hover` kullanılmış, mobilde touch cihazlarda sorun çıkarabilir. `click` event'i olmalı.
6. **Notification bell sabit link** — `/admin/system`'a yönlendiriyor, gerçek notification sayısı gösterilmiyor.
7. **Logout sonrası yönlendirme locale gerektiriyor** — `router.push(/${locale}/login)` — locale undefined olursa 404.

### ✅ Olumlu
- Skip-to-content erişilebilirlik linki
- ARIA landmark'ları (banner, main, aside)
- Dark mode tam destek
- Mobil responsive sidebar

---

## 02 — Overview (page.tsx)

### 🔴 Kritik Sorunlar
1. **Trend hesaplama negatif değerleri handle etmiyor** — `diff !== 0` kontrolü var ama `diff < 0` olduğunda `direction: 'down'` atanıyor ancak `value: Math.abs(diff)` kullanıldığı için negatif trend pozitif gösteriliyor. Yanıltıcı olabilir.
2. **Pie chart verisi yoksa placeholder statik** — CSS bar chart'ta `pct: 60, 30, 10` hardcoded. Gerçek veri olmadığında bile "Free %60, Pro %30, Business %10" gösteriyor — yanıltıcı.

### 🟡 Orta Seviye Sorunlar
3. **Auto-refresh yok** — Sayfa yüklendikten sonra veriler güncellenmiyor. Manuel refresh butonu yok.
4. **Audit log sadece 5 kayıt** — Son aktivite panelinde sadece 5 kayıt, "View All" linki var ama sayfalama yok.
5. **Gelir ₺ formatında** — `₺${(stats?.total_revenue || 0).toLocaleString()}` — para birimi hardcoded. Uluslararası destek için dinamik olmalı.
6. **Recent Signups'ta plan badge rengi yok** — Sadece text, renkli badge olmalı (Users sayfasındaki gibi).
7. **Loading state skeleton sayısı sabit** — `[1, 2, 3, 4]` — grid breakpoint'lerine göre dinamik olmalı.

### ✅ Olumlu
- Parallel API çağrısı (`Promise.all`)
- Error state + retry butonu
- Live webhooks indicator (pulse animasyonu)
- Responsive grid layout

---

## 03 — Users (users/page.tsx)

### 🔴 Kritik Sorunlar
1. **CSV export token'ı URL'de taşıyor** — `window.open(${API}${url}&token=${token})` — token URL'de görünür, loglarda kalabilir. Header ile gönderilmeli.
2. **Impersonate token'ı URL'de** — `?impersonate_token=...` — aynı güvenlik riski.
3. **Ban reason kaydedilmiyor** — `adminApi.createAuditLog?.()` optional chaining ile çağrılıyor, audit log API'si yoksa sessizce başarısız oluyor.
4. **Toplu işlemlerde error handling zayıf** — `Promise.allSettled` kullanılıyor ama başarısız olanların ID'leri gösterilmiyor.
5. **Pagination 20/sayfa hardcoded** — `const perPage = 20` — kullanıcı tarafından değiştirilemiyor.

### 🟡 Orta Seviye Sorunlar
6. **Sıralama client-side** — `sortedUsers` sadece mevcut sayfadaki kullanıcıları sıralıyor. Tüm veri sıralanmıyor.
7. **Search debounce yok** — Her tuş vuruşunda API çağrısı yapılmıyor (form submit ile) ama kullanıcı deneyimi açısından debounce olmalı.
8. **Date range filtresi API'ye gidiyor ama UI'da "All time" varsayılan** — İlk yüklemede tüm kullanıcılar geliyor, filtre state'i boş.
9. **Plan change modal'ında mevcut plan gösterilmiyor** — Sadece selector, "Mevcut plan: Free" bilgisi yok.
10. **Tablo erişilebilirliği** — `<th scope="col">` var ama tablo caption yok.
11. **Checkbox'lar controlled component** — `checked={selectedIds.has(u.id)}` ama `onChange` handler'ı ayrı. Performans iyi.
12. **Alternatif satır renklendirme** — `index % 2 === 0` ile zebra stripe, iyi.

### ✅ Olumlu
- Bulk selection (select all, clear)
- Modal ile onay (ban, plan change)
- CSV export
- Impersonate özelliği
- Responsive tablo

---

## 04 — User Detail (users/[id]/page.tsx)

### 🔴 Kritik Sorunlar
1. **Delivery detail modal'ında XSS riski** — `deliveryDetail.request_body` doğrudan `<pre>` içinde render ediliyor. Eğer JSON içinde HTML/Script varsa XSS olabilir. Sanitizasyon yok.
2. **Email gönderme sonrası state güncellenmiyor** — `handleSendEmail` başarılı olduktan sonra modal kapanıyor ama email geçmişi gösterilmiyor.
3. **Impersonate herhangi bir admin yapabilir** — Sadece `is_admin` kontrolü var, "super admin" veya "owner" rolü yok.

### 🟡 Orta Seviye Sorunlar
4. **Plan history boşsa section gösterilmiyor** — İyi ama loading state'i yok.
5. **Endpoint health'de renk eşikleri hardcoded** — `ep.success_rate >= 99 ? 'bg-green-500' : ep.success_rate >= 95 ? 'bg-yellow-500' : 'bg-red-500'` — ayarlanabilir olmalı.
6. **Daily deliveries chart'ta 14 gün hardcoded** — `analytics.daily_deliveries.slice(-14)` — tarih aralığı seçilemiyor.
7. **Event distribution pie chart'ta renkler hardcoded** — `['#4c6ef5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']` — 5'ten fazla event type varsa renkler tekrar eder.
8. **Delivery attempts tablosu yok** — Sadece modal içinde gösteriliyor, ayrı sayfa yok.
9. **Kullanıcıya email gönderme özelliği var ama template yok** — Manuel subject + body, hazır template'ler olmalı.
10. **Usage stats güncellenme sıklüğü belli değil** — Real-time mı, günlük mü?

### ✅ Olumlu
- Parallel veri çekimi (detail + analytics + plan history)
- Bar chart + Pie chart + Health progress bar
- Delivery replay özelliği
- Impersonate butonu

---

## 05 — Revenue (revenue/page.tsx)

### 🔴 Kritik Sorunlar
1. **Churn rate hesabı backend'de yapılıyor ama frontend'de doğrulanmıyor** — `revenue?.churn_rate?.toFixed(1)` — NaN olabilir.
2. **CSV export token'ı URL'de** — Aynı güvenlik riski.

### 🟡 Orta Seviye Sorunlar
3. **MRR trend sadece yüzde gösteriyor** — `revenue.mrr_trend` mutlak değer olarak gösteriliyor, yüzde hesabı yok.
4. **Churn tablosunda aksiyon yok** — Sadece bilgi gösterimi, "Win back" email gönderme yok.
5. **Plan fiyatları sadece bilgi amaçlı** — Düzenleme linki var ama doğrudan settings'e yönlendirme yok.
6. **Gelir grafiğinde tooltip sadece ₺** — Para birimi hardcoded.
7. **Tarih aralığı "12m" varsayılan** — İlk yüklemede son 12 ay gösteriliyor, iyi.
8. **Empty state var** — "No revenue data" mesajı + emoji, iyi.

### ✅ Olumlu
- Tarih aralığı filtresi (7d, 30d, 90d, 12m, all)
- Manuel refresh butonu
- Pie chart + Legend
- Churn analizi tablosu

---

## 06 — System (system/page.tsx)

### 🔴 Kritik Sorunlar
1. **Health check API'si auth gerektiriyor** — `fetch(${API}/health, { headers: { Authorization: Bearer ${token} } })` — health endpoint'i genelde auth'suz olmalı. Monitoring araçları erişemez.
2. **15 saniyede bir polling** — `setInterval(fetchHealth, 15000)` — SSE veya WebSocket daha verimli olur.
3. **Test webhook'ta SSRF riski** — Kullanıcı herhangi bir URL girebilir (ör: `http://169.254.169.254/latest/meta-data/`). Backend'de SSRF koruması olmalı.
4. **Mock data fallback** — `const mockHealth` API erişilemezse sahte "unknown" durum gösteriliyor. Kullanıcı sorun olduğunu anlamayabilir.

### 🟡 Orta Seviye Sorunlar
5. **Infrastructure tablosu hardcoded** — "Oracle Cloud ARM", "Neon PostgreSQL" vb. sabit değerler. Değişirse kod değişmeli.
6. **Test webhook sonucunda response body sınırsız** — `max-h-40` ile sınırlı ama büyük response'lar DOM'u yavaşlatabilir.
7. **Alert sayısı sadece sayı** — Alert detayları gösterilmiyor, sadece "X active alert rule(s)".
8. **Error logs'ta filtreleme yok** — Tüm son hatalar gösteriliyor, tarih/severity filtresi yok.
9. **Queue details opsiyonel** — `health?.checks?.queue_detail` yoksa gösterilmiyor, loading state'i yok.

### ✅ Olumlu
- 4 servis kartı (API, DB, Redis, Queue)
- Latency progress bar
- Test webhook konsolu
- Otomatik yenileme

---

## 07 — Settings (settings/page.tsx)

### 🔴 Kritik Sorunlar
1. **API key'ler plaintext olarak geliyor** — `resend_api_key`, `webhook_secret` password input'ta gösteriliyor ama API'den plaintext olarak geliyor. Maskelenmeli.
2. **Settings save optimistic update yok** — Kaydet butonuna basılınca tüm sayfa yeniden yükleniyor.
3. **Alert threshold validation yok** — Success rate 0-100 arası olmalı ama validation yok. 150 girilebilir.
4. **CORS origins validation yok** — Geçersiz URL girilebilir.

### 🟡 Orta Seviye Sorunlar
5. **Plan limitleri için min/max validation zayıf** — `max_endpoints_free` için `min={1} max={999}` ama mantıklı sınır yok (0 endpoint?).
6. **Maintenance mode toggle'ı anında etkiliyor** — Kaydetmeden önce bile toggle değişiyor, kullanıcı deneyimi yanıltıcı.
7. **Email settings section'ı Resend'e hardcoded** — SendGrid, Mailgun vb. alternatif yok.
8. **Alert channels sadece 3 seçenek** — Email, Slack, Webhook. Discord, Telegram, PagerDuty yok.
9. **Backup retention için uyarı yok** — 1 gün seçilebilir, bu tehlikeli olabilir.
10. **Retry max attempts 0 yapılabiliyor** — 0 = retry yok, bu bilgi verilmemiş.

### ✅ Olumlu
- 8 ayrı ayar kategorisi
- Toggle switch'ler (maintenance, signups)
- Alert threshold konfigürasyonu
- Success banner (3 saniye)
- Form validation (kısmi)

---

## 08 — Activity (activity/page.tsx)

### 🔴 Kritik Sorunlar
1. **Audit log silinemez** — Admin kendi izlerini silebilir mi? Bu bir güvenlik açığı olabilir. Immutable audit log olmalı.
2. **IP adresi gösteriliyor** — GDPR uyumluluğu için IP maskelenmeli.

### 🟡 Orta Seviye Sorunlar
3. **Action filtresi hardcoded** — `KNOWN_ACTIONS` array'i sabit. Yeni action eklenince kod değişmeli.
4. **Details JSON.stringify ile gösteriliyor** — Büyük detaylar DOM'u yavaşlatabilir.
5. **Pagination offset-based** — `offset: (page - 1) * perPage` — büyük dataset'lerde yavaş. Cursor-based olmalı.
6. **Tarih filtresi yok** — Sadece action filtresi, tarih aralığı yok.
7. **Export özelliği yok** — Audit log CSV/JSON olarak indirilemiyor.
8. **Detay modal'ı yok** — Sadece tablo satırı, tıklayınca detay açılmıyor.

### ✅ Olumlu
- 11 aksiyon tipi, her biri ikon + renk
- Action filtreleme
- Pagination
- IP adresi gösterimi

---

## Genel Bulgular (Tüm Sayfalar)

### 🔴 Kritik (Tümünü Etkileyen)
1. **Token URL'de taşınıyor** — CSV export ve impersonate'te token URL'de. Header ile gönderilmeli.
2. **Client-side auth guard yetersiz** — Backend'de her admin endpoint'inde rol kontrolü zorunlu.
3. **XSS riski** — request_body, details JSON gibi alanlar sanitize edilmiyor.
4. **SSRF riski** — Test webhook'ta kullanıcı URL'i backend'de kontrol edilmeli.
5. **API key plaintext** — Maskelenmeli veya write-only olmalı.

### 🟡 Orta (Tümünü Etkileyen)
6. **i18n eksik** — Bazı hardcoded İngilizce string'ler
7. **Auto-refresh yok** — Sadece system sayfasında 15sn polling
8. **Para birimi hardcoded** — ₺ formatı
9. **Tarih formatı tutarsız** — Bazı yerlerde `toLocaleString`, bazılarında `toLocaleDateString`
10. **Pagination tutarsız** — Bazı sayfalarda 20, bazılarında yok

### ✅ Olumlu (Genel)
- Dark mode tam destek
- Erişilebilirlik (ARIA) iyi
- Responsive tasarım
- Error handling + retry
- Loading skeleton'ları
- i18n altyapısı mevcut

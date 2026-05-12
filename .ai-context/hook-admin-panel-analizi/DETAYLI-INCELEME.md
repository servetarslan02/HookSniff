# Admin Panel — Sayfa Sayfa Detaylı İnceleme

> Her sayfa tek tek, satır satır incelenmiştir.

---

## SAYFA 1: Layout (`admin/layout.tsx`)

### Sayfada Ne Var?
- **Sidebar** (sol, 64px genişliğinde, sabit)
  - Logo: ⚡ ikonu, "Admin Panel" başlığı
  - 6 menü linki: Overview, Users, Revenue, System, Settings, Activity
  - "← Back to Dashboard" linki
  - Theme Toggle (dark/light)
- **Header** (üst, 64px yüksekliğinde)
  - Sol: Hamburger menü (mobil), sayfa başlığı, "Admin" badge
  - Orta: Quick Search input (Enter ile kullanıcı arar)
  - Sağ: Notification bell → system sayfası, Profile dropdown
- **Main Content** (sayfa içeriği buraya render edilir)
- **Mobile Overlay** (siyah yarı saydam, sidebar açıkken)

### Kullanılan Sistemler
| Sistem | Amaç |
|--------|------|
| `next-intl` (`useTranslations`) | i18n — tüm metinler TR/EN |
| `clsx` | Koşullu CSS class birleştirme |
| `useAuth()` (Zustand store) | Kullanıcı bilgisi, logout |
| `usePathname()` | Aktif rota tespiti |
| `useRouter()` | Programatik yönlendirme |
| `ThemeToggle` | Dark/Light mode |
| CSS `transition-transform` | Sidebar animasyonu |
| CSS `group-hover` | Profile dropdown açılması |

### Yapılan İşlemler
1. **Auth Guard:** `user.is_admin` false ise erişim engeli gösterilir
2. **Document Title:** "HookSniff — Webhook Teslimat Servisi" olarak ayarlanır
3. **Quick Search:** Enter'a basılınca `/admin/users?search=...`'a yönlendirir
4. **Logout:** `logout()` çağrılır, login sayfasına yönlendirilir

### Eksikler
- [ ] Document title sayfa bazlı değişmeli
- [ ] Quick Search sadece kullanıcı arıyor, endpoint/event aramıyor
- [ ] Profile dropdown hover ile açılıyor, mobilde sorunlu
- [ ] Notification bell sabit link, gerçek bildirim sayısı yok
- [ ] Sidebar menü hardcoded, dinamik değil

---

## SAYFA 2: Overview (`admin/page.tsx`)

### Sayfada Ne Var?
- **Başlık:** "Platform Overview" + açıklama
- **4 İstatistik Kartı:**
  - 👥 Toplam Kullanıcı (mavi, trend ile)
  - 📦 Toplam Teslimat (emerald, trend ile)
  - 💰 Toplam Gelir (₺ formatında, violet, trend ile)
  - 🔥 Aktif Kullanıcı Bugün (amber, trend ile)
- **Live Webhook Indicator:** Yeşil pulse dot + "X active webhooks currently processing"
- **Users by Plan (Pie Chart):** Free/Pro/Business dağılımı + legend
- **Recent Activity:** Son 5 audit log kaydı + "View All →" linki
- **Recent Signups:** Son kayıt olan kullanıcılar (isim, email, plan, tarih)

### Kullanılan Sistemler
| Sistem | Amaç |
|--------|------|
| `adminApi.getStats()` | Platform istatistikleri |
| `adminApi.getAuditLogs(limit=5)` | Son aktiviteler |
| `StatCard` (Tremor) | İstatistik kartları |
| `PieChart` (Recharts, lazy) | Plan dağılımı grafiği |
| `ResponsiveContainer` | Responsive grafik |
| `Promise.all` | Paralel API çağrısı |
| `useCallback` | Memoize edilmiş fetch fonksiyonu |

### Yapılan İşlemler
1. **Veri Çekimi:** `Promise.all` ile stats + audit logs paralel çekilir
2. **Trend Hesaplama:** Bugünkü değer - dünkü değer, yön yukarı/aşağı
3. **Pie Chart:** `users_by_plan` array'inden `name` + `value` oluşturulur
4. **Empty State:** Veri yoksa CSS bar chart placeholder gösterilir

### Eksikler
- [ ] Auto-refresh yok, manuel refresh butonu yok
- [ ] Trend yüzde olarak gösterilmiyor (sadece mutlak değer)
- [ ] Gelir ₺ hardcoded, para birimi dinamik olmalı
- [ ] Recent Signups'ta plan badge rengi yok
- [ ] Pie chart verisi yoksa placeholder statik (Free %60, Pro %30, Business %10)
- [ ] Loading skeleton sayısı sabit (4), grid breakpoint'lerine göre dinamik olmalı

---

## SAYFA 3: Users (`admin/users/page.tsx`)

### Sayfada Ne Var?
- **Başlık:** "User Management" + açıklama
- **Arama ve Filtre Çubuğu:**
  - Email search input
  - Plan filter (All/Free/Pro/Business)
  - Status filter (All/Active/Banned)
  - Date range (All time/7d/30d/90d)
  - Export CSV butonu
- **Bulk Action Bar** (seçili kullanıcılar varsa):
  - Seçili sayısı
  - 🚫 Ban Selected
  - ✅ Unban Selected
  - 📋 Change Plan
  - ✕ Cancel
- **Kullanıcı Tablosu:**
  - Checkbox (select all / tek tek)
  - ID (ilk 8 karakter)
  - Email (avatar + email)
  - Name
  - Plan (renkli badge + role badge)
  - Status (StatusBadge)
  - Created (tarih)
  - Actions: View, Change Plan, Ban/Activate, Impersonate
- **Pagination:** 20/sayfa, Previous/Next
- **Modal: Ban Reason** — textarea (opsiyonel)
- **Modal: Plan Change** — plan selector
- **Modal: Bulk Action Confirm** — onay

### Kullanılan Sistemler
| Sistem | Amaç |
|--------|------|
| `adminApi.listUsers()` | Kullanıcı listesi (filtreli) |
| `adminApi.updateUserPlan()` | Plan değiştirme |
| `adminApi.updateUserStatus()` | Ban/Activate |
| `adminApi.impersonateUser()` | Kullanıcı gibi görüntüleme |
| `adminApi.exportUsers()` | CSV export |
| `adminApi.createAuditLog()` | Audit log kaydı |
| `StatusBadge` | Durum rozeti |
| `Toast` | Bildirim |
| `Set<string>` | Bulk selection |
| `Promise.allSettled` | Toplu işlem |
| `localeCompare` | Client-side sıralama |

### Yapılan İşlemler
1. **Arama:** Form submit ile API'ye gider
2. **Filtreleme:** Plan, status, date range — API'ye query param olarak gider
3. **Sıralama:** Client-side `localeCompare` ile
4. **CSV Export:** `window.open()` ile yeni sekmede açılır (token URL'de!)
5. **Impersonate:** API'den token alır, yeni sekmede açar
6. **Ban:** Modal ile reason, sonra API çağrısı
7. **Plan Change:** Modal ile yeni plan, sonra API çağrısı
8. **Bulk Actions:** `Promise.allSettled` ile paralel, başarı/başarısız sayacı

### Eksikler
- [ ] CSV export'ta token URL'de taşınıyor (güvenlik riski)
- [ ] Impersonate'te token URL'de
- [ ] Sıralama client-side, sadece mevcut sayfa sıralanıyor
- [ ] Search debounce yok
- [ ] Pagination 20/sayfa hardcoded
- [ ] Tablo erişilebilirliği: caption yok
- [ ] Ban reason audit log'a kaydedilmiyor (API yoksa sessizce başarısız)

---

## SAYFA 4: User Detail (`admin/users/[id]/page.tsx`)

### Sayfada Ne Var?
- **Header:** Geri butonu, kullanıcı adı, 📧 Email butonu, 👁️ Impersonate butonu
- **User Info Card:** ID, Email, Name, Status, Created
- **Management Card:** Plan selector, Status toggle, Usage stats (deliveries, success rate, endpoints)
- **Endpoints Listesi:** URL, Active/Inactive, tarih
- **Plan History:** Değişiklik geçmişi (plan, changed by, tarih)
- **Son Teslimatlar Tablosu:** ID, Event, Status, Attempts, Time, Actions (View Details, Replay)
- **Analitik Grafikler:**
  - Daily Deliveries (Bar Chart, son 14 gün, success/failed stacked)
  - Event Distribution (Pie Chart)
  - Endpoint Health (progress bar + latency)
- **Modal: Email Gönderme** — Subject + Body
- **Modal: Delivery Detay** — Request body, headers, attempt timeline

### Kullanılan Sistemler
| Sistem | Amaç |
|--------|------|
| `adminApi.getUserDetail()` | Kullanıcı detay |
| `adminApi.getUserAnalytics()` | 30 günlük analitik |
| `adminApi.getUserPlanHistory()` | Plan geçmişi |
| `adminApi.sendUserEmail()` | Email gönderme |
| `adminApi.replayDelivery()` | Teslimat tekrarı |
| `webhooksApi.get()` | Teslimat detay |
| `webhooksApi.getAttempts()` | Attempt listesi |
| `BarChart` (Recharts) | Günlük teslimatlar |
| `PieChart` (Recharts) | Event dağılımı |
| `StatusBadge` | Durum rozeti |
| `Toast` | Bildirim |

### Yapılan İşlemler
1. **Paralel Veri Çekimi:** detail + analytics + plan history
2. **Plan Değiştirme:** Selector + Update butonu
3. **Ban/Activate:** Toggle butonu
4. **Email Gönderme:** Modal ile subject + body
5. **Delivery Replay:** Tekrar gönderme
6. **Delivery Detay:** Modal içinde request body, headers, attempts

### Eksikler
- [ ] Delivery detail modal'ında XSS riski (request_body sanitize edilmiyor)
- [ ] Email template yok, manuel subject + body
- [ ] Endpoint health renk eşikleri hardcoded (99, 95)
- [ ] Daily deliveries 14 gün hardcoded
- [ ] Event distribution pie chart'ta 5 renk hardcoded
- [ ] Usage stats güncellenme sıklüğü belli değil

---

## SAYFA 5: Revenue (`admin/revenue/page.tsx`)

### Sayfada Ne Var?
- **Başlık:** "Revenue Analytics" + açıklama
- **Date Range Filter:** 7d, 30d, 90d, 12m, All
- **Refresh Butonu** (animate-spin ikonu)
- **3 İstatistik Kartı:**
  - 💰 MRR (Monthly Recurring Revenue + trend)
  - 📈 Toplam Gelir
  - 📉 Churn Rate (%)
- **Export Report Butonu** (CSV)
- **Plan Prices Info:** Pro: $29/mo, Business: $99/mo
- **Monthly Revenue (Bar Chart):** Aylık gelir, ₺ formatında
- **Revenue by Plan (Pie Chart):** Free/Pro/Business gelir dağılımı + legend
- **Churn Analizi Tablosu:** Email, Name, Plan, Amount, Churn Date

### Kullanılan Sistemler
| Sistem | Amaç |
|--------|------|
| `adminApi.getRevenue()` | Gelir verisi |
| `adminApi.getChurn()` | Churn verisi |
| `adminApi.getSettings()` | Plan fiyatları |
| `adminApi.exportRevenue()` | CSV export |
| `StatCard` (Tremor) | İstatistik kartları |
| `ChartCard` (Tremor) | Grafik kartı |
| `BarChart` (Recharts) | Aylık gelir |
| `PieChart` (Recharts) | Plan dağılımı |
| `DateRange` type | Tarih aralığı filtresi |

### Yapılan İşlemler
1. **Tarih Filtreleme:** `dateRange` state'i ile `allMonthlyData` filtrelenebilir
2. **Refresh:** Manuel buton ile veri yenileme
3. **CSV Export:** `window.open()` ile yeni sekmede (token URL'de)
4. **Plan Fiyatları:** Settings'den çekilir, header'da gösterilir

### Eksikler
- [ ] Churn rate NaN olabilir (backend null dönerse)
- [ ] CSV export'ta token URL'de
- [ ] MRR trend yüzde olarak gösterilmiyor
- [ ] Churn tablosunda "Win back" aksiyonu yok
- [ ] Plan fiyatları düzenlenemiyor (sadece bilgi)
- [ ] Gelir ₺ hardcoded

---

## SAYFA 6: System (`admin/system/page.tsx`)

### Sayfada Ne Var?
- **Başlık:** "System Health" + açıklama
- **Overall Status Banner:** Yeşil/Sarı/Kırmızı pulse + durum mesajı
- **Active Alerts:** Sarı border ile alert sayısı
- **4 Servis Kartı:**
  - 🚀 API Server (uptime)
  - 🐘 Database (latency ms)
  - ⚡ Cache/Redis (latency ms)
  - 📬 Queue (pending/processing/failed)
- **DB Size** (opsiyonel)
- **Queue Details** (opsiyonel)
- **Recent Error Logs** (opsiyonel)
- **Infrastructure Tablosu:** Servis, Sağlayıcı, Detay
- **Test Webhook Konsolu:**
  - Endpoint URL input
  - Event Type input
  - Payload textarea (JSON)
  - Send Test butonu
  - Sonuç: Status Code, Response Time, Response Body

### Kullanılan Sistemler
| Sistem | Amaç |
|--------|------|
| `fetch(/health)` | Sağlık kontrolü |
| `fetch(/admin/alerts)` | Alert listesi |
| `adminApi.testWebhook()` | Test webhook gönderme |
| `setInterval(15000)` | 15 saniyede polling |
| CSS `animate-pulse` | Pulse animasyonu |

### Yapılan İşlemler
1. **Otomatik Yenileme:** 15 saniyede bir health check
2. **Test Webhook:** URL + Event Type + Payload → gönder → sonucu göster
3. **Status Hesaplama:** Tüm servisler OK → yeşil, bazıları degraded → sarı

### Eksikler
- [ ] Health check auth gerektiriyor (monitoring araçları erişemez)
- [ ] 15sn polling — SSE/WebSocket daha verimli
- [ ] Test webhook'ta SSRF riski (kullanıcı herhangi bir URL girebilir)
- [ ] Mock data fallback (API erişilemezse sahte "unknown" durum)
- [ ] Infrastructure tablosu hardcoded
- [ ] Alert detayları gösterilmiyor (sadece sayı)
- [ ] Error logs'ta filtreleme yok

---

## SAYFA 7: Settings (`admin/settings/page.tsx`)

### Sayfada Ne Var?
- **Başlık:** "Platform Settings" + açıklama
- **Success Banner** (3 saniye, yeşil)
- **8 Ayar Kategorisi:**

#### 1. General
- Maintenance Mode (toggle)
- Signups Enabled (toggle)
- Default Plan (select: Free/Pro)

#### 2. Plan Limits (iki kolon: Free / Pro)
- Max Endpoints
- Max Webhooks/Month
- Rate Limit (req/min)
- Retention Days

#### 3. Plan Prices
- Pro: $ (number input)
- Business: $ (number input)

#### 4. Email Settings
- Resend API Key (password input)
- Sender Address (email input)

#### 5. Security
- Webhook Secret (password input)
- Global Rate Limit (req/min)
- CORS Origins (text input)

#### 6. Backup
- Backup Retention (days)

#### 7. Retry
- Max Retry Attempts (0-10)

#### 8. Alert Thresholds
- Success Rate (< % threshold)
- Latency (> ms threshold)
- Consecutive Failures (> per hour)
- Notification Channels: Email, Slack, Webhook (checkbox)

- **Save Buttons:** Alert Settings + Platform Settings (ayrı)

### Kullanılan Sistemler
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

### Yapılan İşlemler
1. **Ayarları Çekme:** GET ile mevcut ayarlar yüklenir
2. **Ayarları Kaydetme:** PUT ile tüm ayarlar gönderilir
3. **Alert Kaydetme:** Her kural için ayrı PUT/POST
4. **Toggle:** Maintenance mode, signups anında state değiştirir

### Eksikler
- [ ] API key'ler plaintext geliyor, maskelenmeli
- [ ] Optimistic update yok, kaydetme sonrası tam yükleme
- [ ] Alert threshold validation yok (0-100 arası olmalı)
- [ ] CORS validation yok
- [ ] Email settings sadece Resend, alternatif yok
- [ ] Alert channels sadece 3 (Discord, Telegram, PagerDuty yok)
- [ ] Backup retention için uyarı yok (1 gün seçilebilir)

---

## SAYFA 8: Activity (`admin/activity/page.tsx`)

### Sayfada Ne Var?
- **Başlık:** "Activity Log" + açıklama
- **Action Filter:** Dropdown (11 aksiyon tipi + All)
- **Sayfa Bilgisi:** "Showing X to Y of Z"
- **Aktivite Tablosu (Desktop):**
  - Action (ikon + renkli badge)
  - Resource (type + ID)
  - Admin (customer ID)
  - Timestamp (Türkçe format)
  - Details (JSON pre + IP adresi)
- **Pagination:** 20/sayfa, Previous/Next

### Kullanılan Sistemler
| Sistem | Amaç |
|--------|------|
| `adminApi.getAuditLogs()` | Audit log listesi |
| Action color map | Renkli badge'ler |
| Action icon map | Emoji ikonlar |
| `KNOWN_ACTIONS` array | Filtre seçenekleri |

### Yapılan İşlemler
1. **Filtreleme:** Action bazlı dropdown
2. **Pagination:** Offset-based (page * perPage)
3. **Format:** Action string'indeki `.` ve `_` boşlukla değiştirilir, capitalize edilir

### Desteklenen Aksiyonlar
LOGIN, REGISTER, ENDPOINT_CREATE, ENDPOINT_DELETE, ENDPOINT_UPDATE, API_KEY_CREATE, API_KEY_DELETE, IMPERSONATE, PASSWORD_CHANGE, 2FA_ENABLE, 2FA_DISABLE

### Eksikler
- [ ] Tarih filtresi yok
- [ ] Export özelliği yok (CSV/JSON)
- [ ] Detay modal'ı yok (tıklayınca detay açılmıyor)
- [ ] Pagination offset-based (büyük dataset'lerde yavaş)
- [ ] Action filtresi hardcoded
- [ ] IP adresi GDPR için maskelenmeli

---

## GENEL EKSİKLER (Tüm Sayfalar)

### Eksik Sayfalar/Özellikler
1. **Dashboard sayfası** — Admin kendi dashboard'unu özelleştiremiyor
2. **Bulk Email** — Toplu email gönderme
3. **API Usage Dashboard** — Kullanıcı başına API çağrı grafiği
4. **Webhook Template Yönetimi** — Admin template oluşturamıyor
5. **IP Whitelist/Blacklist** — IP bazlı erişim kontrolü
6. **Scheduled Reports** — Otomatik rapor gönderimi
7. **Multi-tenant Admin** — Organizasyon bazlı admin
8. **2FA Yönetimi** — Admin panelinde 2FA enable/disable
9. **Custom Roles** — Granular RBAC (Owner/Admin/Support/Viewer)
10. **Keyboard Shortcuts** — Power-user kısayolları

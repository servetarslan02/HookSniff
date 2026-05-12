# 04 — User Detail (Kullanıcı Detay)

**Dosya:** `dashboard/src/app/[locale]/admin/users/[id]/page.tsx`  
**Satır:** ~600  
**Amaç:** Tek bir kullanıcının detaylı bilgisi, yönetimi ve analitiği

---

## Sayfada Ne Var?

### Header
- Geri butonu → `/admin/users`
- Kullanıcı adı/email
- 📧 Send Email butonu
- 👁️ Impersonate butonu

### User Info Card
- ID (full UUID)
- Email
- Name
- Status (badge)
- Created At

### Management Card
- Plan Selector → Free/Pro/Business + Update butonu
- Status Toggle → Ban/Activate butonu
- Usage Stats: Total Deliveries, Success Rate (%), Endpoints Count

### Endpoints Listesi
- URL, Active/Inactive durumu, oluşturulma tarihi

### Plan History
- Plan değişiklik geçmişi
- Kim tarafından değiştirildi (admin email)
- Değişiklik tarihi

### Son Teslimatlar Tablosu
| Kolon | İçerik |
|-------|--------|
| ID | İlk 10 karakter |
| Event | Badge formatında |
| Status | StatusBadge |
| Attempts | Sayı |
| Time | Tarih/saat |
| Actions | View Details, Replay |

### Teslimat Detay Modal
- ID, Status, Event, Attempts, Endpoint URL
- Error Message (varsa)
- Request Body (JSON, max-height scroll)
- Request Headers
- Attempt Timeline (attempt number, status, duration, response)

### Analitik Grafikler
1. **Daily Deliveries (Bar Chart)** — Son 14 gün, success/failed stacked
2. **Event Distribution (Pie Chart)** — En sık kullanılan event type'ları
3. **Endpoint Health** — URL, success rate progress bar, avg latency

### Modal: Email Gönderme
- Subject input
- Body textarea
- Cancel / Send butonları

---

## Kullanılan Sistemler

| Sistem | Amaç |
|--------|------|
| `adminApi.getUserDetail()` | Kullanıcı detay — GET /admin/users/{id} |
| `adminApi.getUserAnalytics()` | 30 günlük analitik — GET /admin/users/{id}/analytics |
| `adminApi.getUserPlanHistory()` | Plan geçmişi — GET /admin/users/{id}/plan-history |
| `adminApi.updateUserPlan()` | Plan değiştirme — PUT /admin/users/{id}/plan |
| `adminApi.updateUserStatus()` | Ban/Activate — PUT /admin/users/{id}/status |
| `adminApi.impersonateUser()` | Impersonate — POST /admin/users/{id}/impersonate |
| `adminApi.sendUserEmail()` | Email gönderme — POST /admin/users/{id}/send-email |
| `adminApi.replayDelivery()` | Teslimat tekrarı — POST /admin/deliveries/{id}/replay |
| `webhooksApi.get()` | Teslimat detay — GET /webhooks/{id} |
| `webhooksApi.getAttempts()` | Attempt listesi — GET /webhooks/{id}/attempts |
| `BarChart` (Recharts) | Günlük teslimatlar |
| `PieChart` (Recharts) | Event dağılımı |
| `StatusBadge` | Durum rozeti |
| `Toast` | Bildirim |

## API Çağrıları

```typescript
const [detailData, analyticsData, planHistoryData] = await Promise.all([
  adminApi.getUserDetail(token, id),          // GET /admin/users/{id}
  adminApi.getUserAnalytics(token, id, 30),   // GET /admin/users/{id}/analytics?days=30
  adminApi.getUserPlanHistory(token, id),     // GET /admin/users/{id}/plan-history
]);
```

## State

```typescript
const [detail, setDetail] = useState<AdminUserDetail | null>(null);
const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
const [newPlan, setNewPlan] = useState('');
const [deliveryDetail, setDeliveryDetail] = useState<DeliveryDetail | null>(null);
const [deliveryAttempts, setDeliveryAttempts] = useState<DeliveryAttempt[]>([]);
const [deliveryLoading, setDeliveryLoading] = useState(false);
const [planHistory, setPlanHistory] = useState([]);
const [showEmailModal, setShowEmailModal] = useState(false);
const [emailSubject, setEmailSubject] = useState('');
const [emailBody, setEmailBody] = useState('');
const [emailSending, setEmailSending] = useState(false);
```

---

## 🔴 Kritik Sorunlar

1. **Delivery detail modal'ında XSS riski** — `deliveryDetail.request_body` doğrudan `<pre>` içinde render ediliyor. JSON içinde HTML/Script varsa XSS olabilir. Sanitizasyon yok.

2. **Email gönderme sonrası state güncellenmiyor** — `handleSendEmail` başarılı olduktan sonra modal kapanıyor ama email geçmişi gösterilmiyor.

3. **Impersonate herhangi bir admin yapabilir** — Sadece `is_admin` kontrolü var, "super admin" veya "owner" rolü yok.

## 🟡 Orta Seviye Sorunlar

4. **Endpoint health'de renk eşikleri hardcoded** — `ep.success_rate >= 99 ? 'bg-green-500' : ep.success_rate >= 95 ? 'bg-yellow-500' : 'bg-red-500'` — ayarlanabilir olmalı.

5. **Daily deliveries chart'ta 14 gün hardcoded** — `analytics.daily_deliveries.slice(-14)` — tarih aralığı seçilemiyor.

6. **Event distribution pie chart'ta renkler hardcoded** — `['#4c6ef5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']` — 5'ten fazla event type varsa renkler tekrar eder.

7. **Kullanıcıya email gönderme template yok** — Manuel subject + body, hazır template'ler olmalı.

8. **Usage stats güncellenme sıklüğü belli değil** — Real-time mı, günlük mü?

## ✅ Olumlu

- Parallel veri çekimi (detail + analytics + plan history)
- Bar chart + Pie chart + Health progress bar
- Delivery replay özelliği
- Impersonate butonu
- Email gönderme modal'ı

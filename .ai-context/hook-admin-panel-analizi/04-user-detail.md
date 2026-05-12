# 04 — User Detail (Kullanıcı Detay)

**Dosya:** `dashboard/src/app/[locale]/admin/users/[id]/page.tsx`  
**Satır:** ~600  
**Amaç:** Tek bir kullanıcının detaylı bilgisi, yönetimi ve analitiği

---

## Header
- Geri butonu → `/admin/users`
- Kullanıcı adı/email
- 📧 Send Email butonu
- 👁️ Impersonate butonu

## Kullanıcı Bilgi Kartı
- ID (full UUID)
- Email
- Name
- Status (badge)
- Created At

## Yönetim Kartı
- **Plan Selector** → Free/Pro/Business + Update butonu
- **Status Toggle** → Ban/Activate butonu
- **Usage Stats:**
  - Total Deliveries
  - Success Rate (%)
  - Endpoints Count

## Endpoints Listesi
- URL, Active/Inactive durumu, oluşturulma tarihi

## Plan History
- Plan değişiklik geçmişi
- Kim tarafından değiştirildi (admin email)
- Değişiklik tarihi

## Son Teslimatlar Tablosu
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

## Müşteri Analitik Grafikleri

### 1. Daily Deliveries (Bar Chart)
- Son 14 gün
- Success (yeşil) + Failed (kırmızı) stacked

### 2. Event Distribution (Pie Chart)
- En sık kullanılan event type'ları

### 3. Endpoint Health
- URL, success rate progress bar, avg latency
- Renk kodları: ≥99% yeşil, ≥95% sarı, <95% kırmızı

## Email Gönderme
- Modal: Subject + Body textarea
- `adminApi.sendUserEmail(token, userId, subject, body)`

## API Çağrıları
```typescript
const [detailData, analyticsData, planHistoryData] = await Promise.all([
  adminApi.getUserDetail(token, id),
  adminApi.getUserAnalytics(token, id, 30),
  adminApi.getUserPlanHistory(token, id),
]);
```

## State
```typescript
const [detail, setDetail] = useState<AdminUserDetail | null>(null);
const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
const [newPlan, setNewPlan] = useState('');
const [deliveryDetail, setDeliveryDetail] = useState<DeliveryDetail | null>(null);
const [deliveryAttempts, setDeliveryAttempts] = useState<DeliveryAttempt[]>([]);
const [planHistory, setPlanHistory] = useState([]);
const [showEmailModal, setShowEmailModal] = useState(false);
const [emailSubject, setEmailSubject] = useState('');
const [emailBody, setEmailBody] = useState('');
```

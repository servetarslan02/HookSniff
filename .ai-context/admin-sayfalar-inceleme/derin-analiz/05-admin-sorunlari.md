# 👑 Admin Panel Sorunları

> Tarih: 2026-05-13
> Kaynak: `dashboard/src/app/[locale]/admin/` + `api/src/routes/admin.rs`

---

## 1. Admin Settings — Raw Fetch Kullanıyor

**Sayfa:** `dashboard/src/app/[locale]/admin/settings/page.tsx`

**Sorun:** 5 yerde `fetch()` kullanılıyor, `adminApi` metodları kullanılmıyor:

```typescript
// Satır 104 — Ayarları çekerken
const res = await fetch(`${API}/admin/settings`, {
    headers: { Authorization: `Bearer ${token}` },
});

// Satır 122 — Alert kurallarını çekerken
const res = await fetch(`${API}/admin/alerts`, {
    headers: { Authorization: `Bearer ${token}` },
});

// Satır 166 — Ayarları kaydederken
const res = await fetch(`${API}/admin/settings`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
});

// Satır 208 — Alert güncellerken
fetch(`${API}/admin/alerts/${existing.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(alertData),
});

// Satır 224 — Alert oluştururken
fetch(`${API}/admin/alerts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(alertData),
});
```

**Sorunlar:**
- CSRF koruması yok (`getCSRFHeaders()` çağrılmıyor)
- Retry logic yok
- Timeout yok
- Error handling farklı (api.ts'deki `getUserFriendlyMessage` kullanılmıyor)

**Çözüm:** Tüm `fetch()` → `adminApi.updateSettings()`, `adminApi` alert metodlarına çevir.

---

## 2. Feature Flags — Sadece Okuma

**Sayfa:** `dashboard/src/app/[locale]/admin/page.tsx`

**Mevcut Kod (satır 80-81):**
```typescript
const flagsData = await adminApi.listFeatureFlags(token);
setFeatureFlags(flagsData.flags || []);
```

**Kullanılmayan Metodlar:**
```typescript
// api.ts'de tanımlı ama hiçbir yerde çağrılmıyor:
adminApi.createFeatureFlag(token, { name, description, is_enabled, rollout_percentage })
adminApi.updateFeatureFlag(token, id, { is_enabled, rollout_percentage })
adminApi.deleteFeatureFlag(token, id)
```

**Gösterim (satır 695-715):**
```typescript
<h2>{t('featureFlagStatus')}</h2>
<p>{featureFlags.filter(f => f.is_enabled).length} / {featureFlags.length}</p>
{featureFlags.slice(0, 3).map(f => (
    <div key={f.id}>{f.name}: {f.is_enabled ? '✅' : '❌'}</div>
))}
```

**Eksik:**
- Flag oluşturma formu
- Toggle ile enable/disable
- Silme butonu
- Rollout percentage ayarı
- Plan bazlı enable/disable

---

## 3. Admin Revenue — Eksik Metrikler

**Sayfa:** `dashboard/src/app/[locale]/admin/revenue/page.tsx`

**Backend'de var ama frontend'de yok:**
- ARPU (Average Revenue Per User)
- LTV (Customer Lifetime Value)
- Cohort analizi
- Net Revenue Retention
- Expansion Revenue
- Gelir projeksiyonu

---

## 4. Admin System — Eksik Kontroller

**Sayfa:** `dashboard/src/app/[locale]/admin/system/page.tsx`

**Backend'de var ama frontend'de yok:**
- Backup yönetimi (manuel backup, restore)
- Log seviyesi ayarı (runtime)
- Servis restart
- Connection pool durumu
- Disk kullanımı

---

## 5. Admin Activity — Eksik Filtreler

**Sayfa:** `dashboard/src/app/[locale]/admin/activity/page.tsx`

**Eksik:**
- Tarih aralığı filtresi
- Actor bazlı filtreleme
- IP bazlı filtreleme
- Export (CSV/JSON)
- Güvenlik olayları filtresi (SSRF, spoofing, replay)

---

## 6. Admin Users — Eksik İşlemler

**Sayfa:** `dashboard/src/app/[locale]/admin/users/page.tsx`

**Eksik:**
- Müşteri notları/etiketleri
- Müşteri geçmişi (tüm aksiyonlar)
- Email gönderme (sadece detay sayfasında)
- Toplu email gönderme
- Müşteri segmentasyonu

---

## 📋 Özet Tablo

| # | Sayfa | Sorun | Öncelik |
|---|-------|-------|---------|
| 1 | Settings | Raw fetch (5 yerde) | 🔴 KRİTİK |
| 2 | Overview | Feature flags sadece okuma | 🔴 KRİTİK |
| 3 | Revenue | Eksik metrikler (ARPU, LTV, cohort) | 🟡 YÜKSEK |
| 4 | System | Eksik kontroller (backup, log, restart) | 🟡 YÜKSEK |
| 5 | Activity | Eksik filtreler (tarih, actor, IP) | 🟡 YÜKSEK |
| 6 | Users | Eksik işlemler (notlar, etiket, segment) | 🟢 ORTA |

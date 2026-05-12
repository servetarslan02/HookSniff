# 📦 Kullanılmayan api.ts Metodları

> Tarih: 2026-05-13
> Kaynak: `dashboard/src/lib/api.ts` + tüm sayfa dosyaları taraması

---

## Nedir?

`api.ts` dosyasında backend'in desteklediği API çağrıları için metodlar tanımlı.
Ama bu metodlardan 8 tanesi hiçbir sayfa tarafından çağrılmıyor.
Yani backend bu işlevleri destekliyor ama müşteri panelinden erişilemiyor.

---

## 1. `endpointsApi.update` ❌ Kullanılmıyor

**Tanım:**
```typescript
// dashboard/src/lib/api.ts — satır 178
update: (token: string, id: string, data: Partial<Endpoint> & { retry_policy?: RetryPolicyConfig }) =>
    apiFetch<Endpoint>(`/endpoints/${id}`, { method: "PUT", body: data, token }),
```

**Backend:**
```rust
// api/src/routes/endpoints.rs
.route("/{id}", put(update_endpoint))
```

**Sorun:** Hiçbir sayfa `endpointsApi.update()` çağırmıyor. Endpoint detay sayfası (`endpoints/[id]/page.tsx`) sadece `endpointsApi.get()` kullanıyor — endpoint URL'si veya açıklaması değiştirilemiyor.

**Etki:** Müşteri mevcut bir endpoint'in URL'sini, açıklamasını veya retry policy'sini güncelleyemiyor.

**Çözüm:** `endpoints/[id]/page.tsx` sayfasına "Düzenle" butonu + form ekle → `endpointsApi.update(token, id, formData)` çağrısı.

---

## 2. `endpointsApi.updateRetryPolicy` ❌ Kullanılmıyor

**Tanım:**
```typescript
// dashboard/src/lib/api.ts — satır 181
updateRetryPolicy: (token: string, id: string, policy: RetryPolicyConfig) =>
    apiFetch<Endpoint>(`/endpoints/${id}/retry-policy`, { method: "PUT", body: policy, token }),
```

**Backend:**
```rust
// api/src/routes/endpoints.rs
.route("/{id}/retry-policy", put(update_retry_policy))
```

**Sorun:** Endpoint detay sayfasında `RetryPolicyCard` bileşeni var ama sadece okuma modunda. Retry policy değiştirilemiyor.

**Etki:** Müşteri endpoint'in retry stratejisini (max attempts, backoff, delay) değiştiremiyor.

**Çözüm:** `RetryPolicyCard` bileşenine "Düzenle" modu ekle → `endpointsApi.updateRetryPolicy()` çağrısı.

---

## 3. `webhooksApi.batch` ❌ Kullanılmıyor

**Tanım:**
```typescript
// dashboard/src/lib/api.ts — satır 210
batch: (token: string, data: { webhooks: Array<{ endpoint_id: string; event?: string; data: unknown }> }) =>
    apiFetch<BatchWebhookResponse>("/webhooks/batch", { method: "POST", body: data, token }),
```

**Backend:**
```rust
// api/src/routes/webhooks.rs
.route("/batch", post(batch_webhooks))
```

**Sorun:** Toplu webhook gönderme özelliği var ama hiçbir sayfa kullanmıyor.

**Etki:** Müşteri tek seferde birden fazla webhook gönderemiyor (bulk operations).

**Çözüm:** Deliveries sayfasına "Toplu Gönder" butonu ekle veya yeni bir "Batch Send" sayfası oluştur.

---

## 4. `adminApi.updateSettings` ❌ Kullanılmıyor

**Tanım:**
```typescript
// dashboard/src/lib/api.ts — satır 562
updateSettings: (token: string, settings: PlatformSettings) =>
    apiFetch<{ success: boolean }>('/admin/settings', { method: 'PUT', body: settings, token }),
```

**Backend:**
```rust
// api/src/routes/admin.rs
.route("/settings", get(get_settings).put(update_settings))
```

**Sorun:** Admin Settings sayfası bu metod yerine doğrudan `fetch()` kullanıyor:
```typescript
// dashboard/src/app/[locale]/admin/settings/page.tsx — satır 104
const res = await fetch(`${API}/admin/settings`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
});
```

**Etki:** 
- CSRF koruması atlanıyor (`getCSRFHeaders()` çağrılmıyor)
- Token yönetimi tutarsız
- Retry logic yok
- Error handling farklı

**Çözüm:** `admin/settings/page.tsx`'deki 5 `fetch()` çağrısını `adminApi.updateSettings()` ve `adminApi` metodlarına çevir.

---

## 5-7. `adminApi.createFeatureFlag` / `updateFeatureFlag` / `deleteFeatureFlag` ❌ Kullanılmıyor

**Tanım:**
```typescript
// dashboard/src/lib/api.ts — satır 569-576
createFeatureFlag: (token, data) => apiFetch('/admin/feature-flags', { method: 'POST', body: data, token }),
updateFeatureFlag: (token, id, data) => apiFetch(`/admin/feature-flags/${id}`, { method: 'PUT', body: data, token }),
deleteFeatureFlag: (token, id) => apiFetch(`/admin/feature-flags/${id}`, { method: 'DELETE', token }),
```

**Backend:**
```rust
// api/src/routes/admin.rs
.route("/feature-flags", get(list_feature_flags).post(create_feature_flag))
.route("/feature-flags/{id}", put(update_feature_flag).delete(delete_feature_flag))
```

**Sorun:** Admin panelinde feature flags sadece okunuyor:
```typescript
// dashboard/src/app/[locale]/admin/page.tsx — satır 80
const flagsData = await adminApi.listFeatureFlags(token);
setFeatureFlags(flagsData.flags || []);
```
Hiçbir yerde `createFeatureFlag`, `updateFeatureFlag` veya `deleteFeatureFlag` çağrılmıyor.

**Etki:** Admin yeni feature flag oluşturamıyor, mevcut flag'leri açıp kapatamıyor veya silemiyor.

**Çözüm:** Admin sayfasına Feature Flags yönetim kartı ekle:
- Flag listesi (toggle ile enable/disable)
- "Yeni Flag" butonu + form (name, description, rollout_percentage)
- Silme butonu (ConfirmDialog ile)

---

## 8. `billingApiExtended.getUsage` ⚠️ Kısmen Kullanılıyor

**Tanım:**
```typescript
// dashboard/src/lib/api.ts
getUsage: (token?: string) => apiFetch('/billing/usage', { token }),
```

**Durum:** `billing/page.tsx`'de çağrılıyor ama hata yönetimi zayıf. Catch bloğu boş olabilir.

**Etki:** Kullanım verisi yüklenemezse müşteri bilgilendirilmiyor.

---

## 📋 Özet Tablo

| # | Metod | Tanımlı | Kullanılıyor | Sorun |
|---|-------|---------|-------------|-------|
| 1 | `endpointsApi.update` | ✅ satır 178 | ❌ | Endpoint düzenleme çalışmıyor |
| 2 | `endpointsApi.updateRetryPolicy` | ✅ satır 181 | ❌ | Retry policy düzenlenemiyor |
| 3 | `webhooksApi.batch` | ✅ satır 210 | ❌ | Toplu webhook gönderilemiyor |
| 4 | `adminApi.updateSettings` | ✅ satır 562 | ❌ | Raw fetch kullanılıyor |
| 5 | `adminApi.createFeatureFlag` | ✅ satır 569 | ❌ | Flag oluşturulamıyor |
| 6 | `adminApi.updateFeatureFlag` | ✅ satır 572 | ❌ | Flag güncellenemiyor |
| 7 | `adminApi.deleteFeatureFlag` | ✅ satır 575 | ❌ | Flag silinemiyor |
| 8 | `billingApiExtended.getUsage` | ✅ | ⚠️ | Hata yönetimi zayıf |

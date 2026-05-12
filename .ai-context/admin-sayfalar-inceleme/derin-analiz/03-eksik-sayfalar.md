# 📄 Eksik Sayfalar — Backend Var, Frontend Yok

> Tarih: 2026-05-13
> Kaynak: `api/src/routes/` + `dashboard/src/app/[locale]/(dashboard)/` karşılaştırması

---

## 1. 📱 Uygulamalar (Applications)

**Backend:** `api/src/routes/applications.rs`

**Endpoint'ler:**
```rust
.route("/", get(list_applications).post(create_application))
.route("/{id}", get(get_application).put(update_application).delete(delete_application))
```

**Frontend:** ❌ Hiçbir sayfa yok. Sidebar'da link yok.

**API.ts:** ❌ `applicationsApi` objesi tanımlı değil.

**Ne yapılmalı:**
1. `dashboard/src/app/[locale]/(dashboard)/applications/page.tsx` oluştur
2. `dashboard/src/app/[locale]/(dashboard)/applications/[id]/page.tsx` oluştur (detay)
3. `api.ts`'ye `applicationsApi` objesi ekle:
```typescript
export const applicationsApi = {
    list: (token: string) => apiFetch<Application[]>('/applications', { token }),
    get: (token: string, id: string) => apiFetch<Application>(`/applications/${id}`, { token }),
    create: (token: string, data: CreateApplication) => apiFetch('/applications', { method: 'POST', body: data, token }),
    update: (token: string, id: string, data: Partial<Application>) => apiFetch(`/applications/${id}`, { method: 'PUT', body: data, token }),
    delete: (token: string, id: string) => apiFetch(`/applications/${id}`, { method: 'DELETE', token }),
};
```
4. Sidebar'a ekle:
```typescript
{ name: t('applications'), href: '/applications', icon: '📱' }
```

---

## 2. 🧪 Simülatör (Simulator)

**Backend:** `api/src/routes/simulator.rs`

**Endpoint'ler:**
```rust
.route("/", post(run_simulation))
```

**Frontend:** ❌ Hiçbir sayfa yok.

**API.ts:** ❌ `simulatorApi` objesi tanımlı değil.

**Ne yapılmalı:**
1. `dashboard/src/app/[locale]/(dashboard)/simulator/page.tsx` oluştur
2. İçerik: Senaryo seçici, endpoint seçici, payload editor, gönder butonu, sonuç paneli
3. `api.ts`'ye `simulatorApi` objesi ekle
4. Sidebar'a ekle (playground'un yanına)

---

## 3. 📡 Stream (SSE Real-time Events)

**Backend:** `api/src/routes/stream.rs`

**Endpoint'ler:**
```rust
.route("/", get(sse_stream))
```

**Frontend:** ❌ Sayfa yok. `useDeliveryStream.ts` hook'u var ama hiçbir sayfa kullanmıyor.

**Ne yapılmalı:**
1. `dashboard/src/app/[locale]/(dashboard)/stream/page.tsx` oluştur
2. `EventSource` API ile SSE bağlantısı
3. Canlı event listesi, filtre, duraklat butonu
4. Sidebar'a ekle

---

## 4. 🌐 Çıkış IP'leri (Outbound IPs)

**Backend:** `api/src/routes/outbound_ips.rs`

**Endpoint'ler:**
```rust
.route("/", get(list_outbound_ips))
```

**Frontend:** ❌ Hiçbir sayfa yok.

**API.ts:** ❌ `outboundIpsApi` objesi tanımlı değil.

**Ne yapılmalı:**
1. `dashboard/src/app/[locale]/(dashboard)/outbound-ips/page.tsx` oluştur
2. İçerik: IP listesi, kopyalama butonu, CIDR format seçici
3. Sidebar'a ekle (config section)

**Neden kritik:** Enterprise müşteriler firewall whitelist yapmak için bu IP'lere ihtiyaç duyar.

---

## 5. 📲 Cihazlar (Devices / Push Notifications)

**Backend:** `api/src/routes/devices.rs`

**Endpoint'ler:**
```rust
.route("/", get(list_devices).post(register_device))
.route("/{id}", delete(delete_device))
```

**Frontend:** ❌ Hiçbir sayfa yok.

**API.ts:** ❌ `devicesApi` objesi tanımlı değil.

**Ne yapılmalı:**
1. `dashboard/src/app/[locale]/(dashboard)/devices/page.tsx` oluştur
2. İçerik: Cihaz listesi, cihaz kaydetme, silme, test bildirim
3. Sidebar'a ekle (account section)

---

## 📋 Özet Tablo

| # | Sayfa | Backend Route | api.ts | Frontend Sayfa | Sidebar | Öncelik |
|---|-------|---------------|--------|----------------|---------|---------|
| 1 | Uygulamalar | `applications.rs` ✅ | ❌ | ❌ | ❌ | 🟡 YÜKSEK |
| 2 | Simülatör | `simulator.rs` ✅ | ❌ | ❌ | ❌ | 🟡 YÜKSEK |
| 3 | Stream | `stream.rs` ✅ | ❌ | ❌ | ❌ | 🟢 ORTA |
| 4 | Çıkış IP'leri | `outbound_ips.rs` ✅ | ❌ | ❌ | ❌ | 🔴 KRİTİK |
| 5 | Cihazlar | `devices.rs` ✅ | ❌ | ❌ | ❌ | 🟢 ORTA |

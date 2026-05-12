# 🛡️ Güvenlik Açıkları

> Tarih: 2026-05-13
> Kaynak: Güvenlik odaklı kod incelemesi

---

## 1. Admin Settings — CSRF Koruması Atlanıyor

**Dosya:** `dashboard/src/app/[locale]/admin/settings/page.tsx`

**Sorun:** `fetch()` kullanıldığı için CSRF koruması atlanıyor:

```typescript
// Bu KORUMASIZ:
const res = await fetch(`${API}/admin/settings`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
});

// Bu KORUMALI (api.ts'deki apiFetch):
await adminApi.updateSettings(token, settings);
// → apiFetch otomatik olarak getCSRFHeaders() ekler
```

**api.ts'deki CSRF koruması:**
```typescript
// dashboard/src/lib/api.ts — satır 42-51
function getCSRFHeaders(method: string): Record<string, string> {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
        if (typeof window !== 'undefined') {
            return { 'Origin': window.location.origin };
        }
    }
    return {};
}
```

**Etki:** Admin ayarları değiştirilirken Origin header gönderilmiyor. CSRF saldırısı ile admin ayarları değiştirilebilir.

---

## 2. 2FA Ayarları Eksik — Admin Hesabı Güvensiz

**Backend:**
```rust
// api/src/routes/auth.rs — satır 134-136
.route("/2fa/enable", post(enable_2fa))
.route("/2fa/confirm", post(confirm_2fa))
.route("/2fa/disable", post(disable_2fa))
```

**Frontend:** Settings sayfasında 2FA bölümü yok.

**Etki:** 
- Admin hesabı 2FA ile korunamıyor
- Hesap ele geçirilme riski yüksek
- Sektör standartlarına uymuyor (Svix, Hookdeck 2FA zorunlu)

---

## 3. GDPR Veri Dışa Aktarma Eksik — Yasal Zorunluluk

**Backend:**
```rust
// api/src/routes/auth.rs — satır 141
.route("/export", get(export_data))

// Satır 1108-1109
/// GET /v1/auth/export — Export all user data (GDPR Article 15 — Right of Access)
async fn export_data(...)
```

**Frontend:** Settings sayfasında "Verilerimi İndir" butonu yok.

**Etki:**
- GDPR Article 15 ihlali — Kullanıcı verilerini dışa aktaramıyor
- GDPR Article 17 ihlali — ConsentToggle API çağırmadığı için onay geri çekilemiyor
- Para cezası riski (yıllık cironun %4'ü veya €20M)

---

## 4. Impersonate Token URL'de — Güvenlik Riski

**Dosya:** `dashboard/src/app/[locale]/admin/users/page.tsx`

**Sorun:** Impersonate işlemi sonrası token URL'de taşınabilir:

```typescript
// api.ts'de impersonateUser çağrısı
const { token } = await adminApi.impersonateUser(token, userId);
// Token URL'de query param olarak geçilmemeli
```

**Etki:** Token browser history'de veya loglarda kalabilir.

**Çözüm:** Token'ı sessionStorage'a yaz, URL'den temizle.

---

## 📋 Özet Tablo

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 1 | CSRF koruması atlanıyor | `admin/settings/page.tsx` | 🔴 KRİTİK |
| 2 | 2FA ayarları eksik | `settings/page.tsx` | 🔴 KRİTİK |
| 3 | GDPR veri dışa aktarma eksik | `settings/page.tsx` | 🔴 KRİTİK |
| 4 | Impersonate token URL'de | `admin/users/page.tsx` | 🟡 YÜKSEK |

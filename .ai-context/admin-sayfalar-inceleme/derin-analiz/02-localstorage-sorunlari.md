# 💾 localStorage Sorunları

> Tarih: 2026-05-13
> Kaynak: Settings sayfası bileşenleri

---

## Nedir?

Bazı veriler sadece tarayıcı localStorage'da saklanıyor.
Bu şu anlama geliyor:
- Kullanıcı farklı bir cihazdan giriş yapınca tercihlerini göremez
- Tarayıcı temizlenince veriler silinir
- Backend bu verileri bilmiyor, raporlayamıyor

---

## 1. NotificationSection — Başlangıç Değerleri localStorage'dan

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/NotificationSection.tsx`

**Sorun:** Tercihler API'ye kaydediliyor (satır 45-55) ama başlangıç değerleri localStorage'dan okunuyor (satır 16-28):

```typescript
// Satır 16-28 — Başlangıç değerleri localStorage'dan
const [emailNotifs, setEmailNotifs] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('hooksniff_email_notifs') !== 'false';  // ← localStorage
});
const [failureAlerts, setFailureAlerts] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('hooksniff_failure_alerts') !== 'false';  // ← localStorage
});
const [weeklyDigest, setWeeklyDigest] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('hooksniff_weekly_digest') === 'true';  // ← localStorage
});

// Satır 31-37 — Her değişiklikte localStorage'a yaz
useEffect(() => {
    localStorage.setItem('hooksniff_email_notifs', String(emailNotifs));
}, [emailNotifs]);
```

**API'ye kaydetme (satır 42-55):**
```typescript
const handleNotificationSave = async () => {
    const { api } = await import('@/lib/api');
    await api.put('/portal/notifications', {
        email_on_failure: failureAlerts,
        email_on_dead_letter: failureAlerts,
        email_on_success: emailNotifs,
        email_on_weekly_digest: weeklyDigest,
        slack_webhook_url: null,
    }, token ?? undefined);
};
```

**Akış:**
1. Kullanıcı tercihleri değiştirir → localStorage'a yazılır (anında)
2. Kullanıcı "Kaydet" butonuna basar → API'ye gönderilir
3. Başka cihazda açar → localStorage boş → varsayılan değerler gösterilir
4. Kullanıcı "Kaydet" basmadıysa → eski tercihler kaybolur

**Çözüm:**
```typescript
// Sayfa yüklenirken önce API'den çek
useEffect(() => {
    async function fetchPreferences() {
        try {
            const prefs = await api.get('/portal/notifications', token);
            setEmailNotifs(prefs.email_on_success ?? true);
            setFailureAlerts(prefs.email_on_failure ?? true);
            setWeeklyDigest(prefs.email_on_weekly_digest ?? false);
        } catch {
            // API başarısız olursa localStorage'a düş
            setEmailNotifs(localStorage.getItem('hooksniff_email_notifs') !== 'false');
        }
    }
    fetchPreferences();
}, [token]);
```

---

## 2. ConsentToggle — Sadece localStorage + Cookie, API Çağırmıyor

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/ConsentToggle.tsx`

**Tam Kaynak Kod:**
```typescript
'use client';
import { useState } from 'react';

export function ConsentToggle({
    consentKey: _consentKey,  // ← consentKey hiç kullanılmıyor!
    storageKey,
}: {
    consentKey: string;
    storageKey: string;
}) {
    const [enabled, setEnabled] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(storageKey) === 'true';  // ← localStorage'dan oku
    });

    const handleToggle = () => {
        const newValue = !enabled;
        setEnabled(newValue);
        localStorage.setItem(storageKey, String(newValue));  // ← localStorage'a yaz
        // Cookie oluştur (backend için)
        if (newValue) {
            document.cookie = `${storageKey}=true; path=/; max-age=${365*24*60*60}; SameSite=Lax`;
        } else {
            document.cookie = `${storageKey}=; path=/; max-age=0`;
        }
        // ❌ API çağrısı YOK!
    };
    // ... render
}
```

**Sorunlar:**
1. `consentKey` parametresi alınıyor ama hiç kullanılmıyor (satır 7: `consentKey: _consentKey`)
2. Sadece localStorage'a yazıyor
3. Cookie oluşturuyor ama backend bu cookie'yi okumuyor (API'de consent endpoint'i yok)
4. Hiçbir API çağrısı yok — backend kullanıcı onaylarını bilmiyor

**Etki:**
- GDPR Article 7: Onay kanıtı yok (backend'de kayıt yok)
- GDPR Article 17: Kullanıcı onayını geri çekmek istese backend bilmiyor
- Farklı cihazlarda onay durumu farklı olabilir

**Çözüm:**
1. Backend'de `consent_log` tablosu oluştur (user_id, consent_type, granted, timestamp)
2. `POST /v1/auth/consent` endpoint'i ekle
3. ConsentToggle'ı güncelle → API çağrısı ekle
4. Sayfa yüklenirken onay durumunu backend'den çek

---

## 📋 Özet

| # | Bileşen | localStorage | API | Cookie | Sorun |
|---|---------|-------------|-----|--------|-------|
| 1 | NotificationSection | ✅ Oku + Yaz | ✅ Kaydet (buton ile) | ❌ | Başlangıç değerleri localStorage'dan |
| 2 | ConsentToggle | ✅ Oku + Yaz | ❌ | ✅ Oluştur | API hiç çağrılmıyor |

**En kritik sorun:** ConsentToggle'ın API çağırmaması — GDPR uyumsuzluğu.

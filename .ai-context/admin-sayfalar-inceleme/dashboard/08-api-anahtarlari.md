# 🔑 API Anahtarları (API Keys)

> Sayfa: `dashboard/src/app/[locale]/dashboard/api-keys/page.tsx`
> Route: `/dashboard/api-keys`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Alt Bileşenler
| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| NewKeyAlert | `./components/NewKeyAlert` | Yeni key gösterimi |
| CreateKeyForm | `./components/CreateKeyForm` | Key oluşturma formu |
| KeyList | `./components/KeyList` | Key listesi |
| ConfirmActionModal | `./components/ConfirmActionModal` | Onay modalları |

### Veri Akışı
- `apiFetch<ApiKey[]>(/api-keys)` → key listesi
- `apiFetch(/api-keys, POST, {name})` → key oluşturma
- `apiFetch(/api-keys/{id}, DELETE)` → key silme
- `apiFetch(/api-keys/{id}/rotate, POST)` → key rotasyonu

### ApiKey Interface
```typescript
interface ApiKey {
  id: string;
  name: string | null;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}
```

## Özellikler

### CRUD İşlemleri
- ✅ **Listeleme** — Tüm API key'leri
- ✅ **Oluşturma** — İsim ile key oluşturma
- ✅ **Silme** — ConfirmActionModal ile
- ✅ **Rotasyon** — Eski key'i yenileme
- ✅ **Yeni key gösterimi** — NewKeyAlert bileşeni

### UI Bileşenleri
- ✅ Error banner (kapatılabilir)
- ✅ New key alert (bir kez gösterilir)
- ✅ Create key form
- ✅ Key listesi
- ✅ Delete onay modalları (danger varyantı)
- ✅ Rotate onay modalları (warning varyantı)

### Erişilebilirlik
- ✅ aria-label dismiss butonunda
- ✅ i18n tüm metinlerde
- ✅ Dark mode tam destek

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- Bileşenlere ayrılmış yapı (NewKeyAlert, CreateKeyForm, KeyList, ConfirmActionModal)
- Key rotasyonu özelliği
- Prefix gösterimi (güvenlik)
- last_used_at gösterimi
- is_active durumu
- getErrorMessage kullanımı
- useCallback ile fetchKeys memoization

### ⚠️ Potansiyel Sorunlar
- **Key kopyalama** — NewKeyAlert'de kopyalama butonu var mı bilinmiyor
- **Key gizleme** — Yeni key gösterildikten sonra tekrar görülemiyor
- **Toplu silme yok** — Tek tek silme
- **Key adı düzenleme yok** — Sadece oluşturma
- **İs_active toggle yok** — Pasif yapma butonu yok

### 🔴 Eksiklikler
- Key kullanım istatistikleri yok (kaç kez kullanıldı)
- Key bazlı izin/scope sistemi yok
- Key süresi (expiry) yok
- Key IP whitelist yok
- Toplu key yönetimi yok
- Key kullanım grafiği yok

---

## 🔧 Yapılacaklar (2026-05-13)

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/api-keys/page.tsx`
- **Sorun:** 2 useEffect, fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)

### 🔒 Memory Leak

#### ML-01: NewKeyAlert — setTimeout Cleanup Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/api-keys/components/NewKeyAlert.tsx`
- **Sorun:** `setTimeout` kullanılıyor ama `clearTimeout` yok.
- **Adımlar:**
  1. useEffect içinde timer oluştur
  2. Return'de `clearTimeout(timer)` ekle

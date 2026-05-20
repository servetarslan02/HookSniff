# 2026-05-20 — Portal Customize Sayfa Hatası Düzeltildi

## Sorun
Kullanıcı hesap sayfasındaki "Portal Özelleştir" sekmesine tıklayınca sayfa açılmıyor, direkt hata mesajı gösteriyordu:
"Portal yapılandırması kaydedilemedi ↻ Tekrar dene"

## Kök Neden Analizi
- API endpoint'leri正常 çalışıyor (curl ile doğrulandı)
- Edge proxy正常 çalışıyor
- `usePortalConfig()` hook'u config yüklerken hata alırsa, `configError` set oluyordu
- Sayfa bu hatayı görünce TÜM sayfayı bloklayıp hata mesajı gösteriyordu
- Üstelik hata mesajı "kaydedilemedi" diyordu, ama asıl sorun "yüklenemedi" idi

## Yapılan Düzeltmeler

### 1. Sayfa artık bloklanmıyor
- Eski davranış: `configError` varsa → tüm sayfa hata ekranı
- Yeni davranış: `configError` varsa → sarı uyarı banner, form default değerlerle çalışmaya devam eder

### 2. Doğru hata mesajları
- Yükleme hatası: "Portal ayarları yüklenemedi" (yeni: `portalLoadFailed`)
- Kaydetme hatası: "Portal yapılandırması kaydedilemedi" (mevcut: `portalSaveFailed`)

### 3. Retry mekanizması
- Eski: `window.location.reload()` (tüm sayfa yenilenir)
- Yeni: `refetch()` (sadece config API'si tekrar çağrılır)

### 4. Çeviri anahtarları
- `portalLoadFailed` — TR + EN
- `portalLoadFailedDesc` — TR + EN

## Değişilen Dosyalar
- `dashboard/src/app/[locale]/(dashboard)/portal-customize/page.tsx` — 318 satır
- `dashboard/src/messages/tr.json` — 2 yeni key
- `dashboard/src/messages/en.json` — 2 yeni key

## Commit
`b66f6e9b` — Vercel otomatik deploy tetiklenecek

## Not
Asıl sorun (config yüklenememesi) hala devam ediyor olabilir. Muhtemel nedenler:
- Vercel'de `NEXT_PUBLIC_API_URL` yanlış ayarlanmış olabilir
- Token süresi dolmuş olabilir (JWT 15 dk)
- CORS sorunu

Bu düzeltme ile sayfa artık bloklanmayacak, kullanıcı formu kullanabilecek.

# ⚙️ Ayarlar (Settings)

> Sayfa: `dashboard/src/app/[locale]/dashboard/settings/page.tsx`
> Route: `/dashboard/settings`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
6 ayrı bölüm (section bileşenleri):

| Bölüm | Bileşen | Açıklama |
|-------|---------|----------|
| Profil | ProfileSection | Ad, email, avatar |
| Şifre | PasswordSection | Şifre değiştirme |
| API Key | ApiKeySection | API key gösterimi |
| Bildirimler | NotificationSection | Bildirim tercihleri |
| Gizlilik | PrivacyConsentSection | GDPR onayları |
| Tehlike | DangerZoneSection | Hesap silme |

## Özellikler
- ✅ Profil düzenleme
- ✅ Şifre değiştirme
- ✅ API key gösterimi
- ✅ Bildirim tercihleri
- ✅ Gizlilik onayları (GDPR)
- ✅ Hesap silme (tehlikeli alan)
- ✅ Bileşenlere ayrılmış yapı

## Tespit Edilen Durumlar
### ✅ İyi Yönler
- Bileşenlere ayrılmış yapı (6 section)
- GDPR uyumlu (PrivacyConsentSection)
- Danger zone ayrılmış
- i18n desteği

### 🔴 Eksiklikler
- İki faktörlü doğrulama (2FA) ayarı
- Oturum yönetimi (aktif oturumlar)
- Veri dışa aktarma (GDPR export)
- Dil/ayar tercihleri
- Tema tercihleri (dark/light/auto)

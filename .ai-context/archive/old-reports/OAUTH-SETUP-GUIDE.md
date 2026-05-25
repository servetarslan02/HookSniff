# 🔐 OAuth Kurulum Rehberi — Adım Adım

> Servet, bu rehberi takip et. Kod yazmana gerek yok, sadece web sitelerinde tıklama yapacaksın.

---

## Adım 1: Google OAuth Client ID Bul

1. **Tarayıcıda aç:** https://console.cloud.google.com/apis/credentials
2. **Proje seç:** Sol üstten `hooksniff-app` projesini seç
3. **OAuth 2.0 Client ID ara:** "OAuth 2.0 Client IDs" bölümünde bir tane olmalı
4. **Tıkla** → Detay açılacak
5. **Client ID kopyala:** `xxx.apps.googleusercontent.com` formatında olacak
6. **Bana söyle** — bu değeri GCP Secret Manager'a gireceğim

> ⚠️ Eğer OAuth Client yoksa:
> - "Create Credentials" → "OAuth client ID" tıkla
> - Application type: **Web application**
> - Name: `HookSniff`
> - Authorized redirect URIs: `https://hooksniff-api-1046140057667.europe-west1.run.app/v1/oauth/google/callback`
> - "Create" tıkla
> - Client ID ve Client Secret'i kopyala

---

## Adım 2: GitHub OAuth App Oluştur

1. **Tarayıcıda aç:** https://github.com/settings/developers
2. **"New OAuth App" tıkla** (veya "Register a new application")
3. **Bilgileri gir:**
   - **Application name:** `HookSniff`
   - **Homepage URL:** `https://hooksniff.vercel.app`
   - **Application description:** `Webhook delivery platform` (opsiyonel)
   - **Authorization callback URL:** `https://hooksniff-api-1046140057667.europe-west1.run.app/v1/oauth/github/callback`
4. **"Register application" tıkla**
5. **Client ID kopyala** — sayfada gösterilecek
6. **"Generate a new client secret" tıkla**
7. **Client Secret kopyala** — sadece bir kere gösterilir!
8. **Her iki değeri bana söyle**

---

## Adım 3: Secret Manager'a Değerleri Gir

Bana değerleri verdikten sonra ben bu komutları çalıştıracağım:

```bash
# Google Client ID güncelle
gcloud secrets versions add google-client-id --data-file=- --project=hooksniff-app <<< "BURAYA_GOOGLE_CLIENT_ID"

# GitHub Client ID güncelle
gcloud secrets versions add github-client-id --data-file=- --project=hooksniff-app <<< "BURAYA_GITHUB_CLIENT_ID"

# GitHub Client Secret güncelle
gcloud secrets versions add github-client-secret --data-file=- --project=hooksniff-app <<< "BURAYA_GITHUB_CLIENT_SECRET"
```

> ⚠️ Google Client Secret zaten kayıtlı (REDACTED-...), sadece Client ID eksik.

---

## Adım 4: Cloud Build Tetikle

Secret'lar güncellendikten sonra:
1. GitHub'a push yapacağım → Cloud Build otomatik tetiklenir
2. Veya manuel: `gcloud builds trigger --project=hooksniff-app`
3. Build log: https://console.cloud.google.com/cloud-build/history?project=hooksniff-app

---

## Adım 5: Test Et

1. https://hooksniff.vercel.app/login adresine git
2. "Sign in with Google" butonuna tıkla
3. Google hesabınla giriş yap
4. Dashboard'a yönlendirilmelisin ✅

---

## Troubleshooting

### "Redirect URI mismatch" hatası
- Google Cloud Console'da redirect URI'nin doğru olduğundan emin ol:
  `https://hooksniff-api-1046140057667.europe-west1.run.app/v1/oauth/google/callback`

### "Bad credentials" hatası (GitHub)
- Client Secret'in doğru kopyaladığından emin ol
- Secret sadece bir kere gösterilir, kaybettiysen yeni oluştur

### Cloud Build başarısız
- Build log'larını kontrol et
- Secret'ların doğru adlarla kayıtlı olduğundan emin ol

---

## Ne Zaman Hazır?

Bana şunları söyle:
1. ✅ Google Client ID (xxx.apps.googleusercontent.com)
2. ✅ GitHub Client ID
3. ✅ GitHub Client Secret

Ben geri kalan her şeyi halledeceğim.

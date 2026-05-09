# 🚀 HookSniff Deploy Rehberi

> Son güncelleme: 2026-05-09
> Servet, bu rehberi adım adım takip et. Her adımda takılırsan bana sor.

---

## Adım 1: Vercel Dashboard (5 dk)

### 1.1 Build Hatasını Kontrol Et
1. https://vercel.com adresine git
2. **hooksniff** projesine tıkla
3. **Deployments** sekmesine git
4. En son deploy'a tıkla
5. **Building** veya **Error** mu yazıyor?
6. Eğer **Error** ise → Build Logs'u aç, bana gönder

### 1.2 Manuel Redeploy
1. Deployments sekmesinde en son deploy'ın yanındaki **"..."** butonuna bas
2. **Redeploy** seç
3. "Redeploy" onayla
4. 1-3 dakika bekle
5. https://hooksniff.vercel.app adresini kontrol et

### 1.3 Environment Variables
1. **Settings** → **Environment Variables**
2. Şu değişkenin tanımlı olduğundan emin ol:
   ```
   NEXT_PUBLIC_API_URL = https://hooksniff-api-1046140057667.europe-west1.run.app/v1
   ```

---

## Adım 2: GitHub Actions CI/CD (Otomatik)

CI/CD `.github/workflows/deploy.yml` ile yapılandırıldı:

1. `main` branch'e push → CI çalışır (lint, test, build)
2. CI başarılı → Deploy tetiklenir
3. Docker image build + push → Artifact Registry
4. Cloud Run servisleri güncellenir

### Gerekli GitHub Secrets
- `GCP_SA_KEY` — GCP service account JSON key

### Manuel Deploy (opsiyonel)
```bash
# Authenticate
gcloud auth activate-service-account --key-file=gcp-sa-key.json
gcloud config set project hooksniff-app

# Build + Push + Deploy
docker build -f Dockerfile.api -t europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/api:latest .
docker push europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/api:latest
gcloud run deploy hooksniff-api --image europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/api:latest --region europe-west1
```

---

## Adım 3: Cloudflare DNS (5 dk)

### 3.1 Cloudflare'a Gir
1. https://dash.cloudflare.com adresine git
2. Zone'unu seç

### 3.2 DNS Kayıtları

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `api` | `hooksniff-api-1046140057667.europe-west1.run.app` | ✅ Proxied |
| CNAME | `dashboard` | `cname.vercel-dns.com` | ✅ Proxied |

---

## Adım 4: Test Et (5 dk)

### 4.1 API Health Check
```bash
curl https://hooksniff-api-1046140057667.europe-west1.run.app/health
# → {"status":"ok"}
```

### 4.2 Dashboard Test
1. https://hooksniff.vercel.app adresine git
2. Kayıt ol veya giriş yap
3. Dashboard yükleniyor mu kontrol et

### 4.3 Webhook Test
```bash
# Endpoint oluştur
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \
  -H "Authorization: Bearer hr_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://webhook.site/YOUR_URL"}'

# Webhook gönder
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \
  -H "Authorization: Bearer hr_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"endpoint_id": "YOUR_ENDPOINT_ID", "event": "test.ping", "data": {"hello": "world"}}'
```

---

## ⚠️ Güvenlik Hatırlatması

**Tüm token'ları yenile!** Chat'te paylaşmıştın:
- GitHub PAT → Settings → Developer Settings → Personal Access Tokens → Delete & Recreate
- GCP SA JSON → GCP Console → Service Accounts → Create New Key
- Polar tokens → Polar Dashboard → Settings → Tokens → Revoke

---

## 📞 Takıldığın Yerde

Her adımda sorun yaşarsan bana:
1. Hangi adımda takıldığını söyle
2. Varsa hata mesajını gönder
3. Screenshot da gönderebilirsin

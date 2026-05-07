# 🚀 HookSniff Deploy Rehberi

> Servet, bu rehberi adım adım takip et. Her adımda takılırsan bana sor.

---

## Adım 1: Vercel Dashboard'ı Düzelt (5 dk)

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
5. https://hooksniff.vercel.app/en/about adresini kontrol et

### 1.3 Vercel Proje Ayarlarını Kontrol Et
1. **Settings** → **General**
2. **Root Directory** → `dashboard` olmalı (veya boş)
3. **Framework Preset** → Next.js olmalı
4. **Build & Development Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 1.4 Environment Variables
1. **Settings** → **Environment Variables**
2. Şu değişkenin tanımlı olduğundan emin ol:
   ```
   NEXT_PUBLIC_API_URL = https://api.hooksniff.is-a.dev/v1
   ```

---

## Adım 2: Render'a Deploy (10 dk)

### 2.1 Render Hesabı Aç
1. https://render.com adresine git
2. GitHub ile giriş yap (servetarslan02 hesabın)

### 2.2 Blueprint Deploy
1. https://dashboard.render.com/blueprints adresine git
2. **"New Blueprint Instance"** butonuna bas
3. GitHub repo: `servetarslan02/HookSniff` seç
4. Branch: `main`
5. **"Apply"** butonuna bas

Render otomatik olarak şunları oluşturacak:
- `hooksniff-api` (Web Service — Docker)
- `hooksniff-worker` (Worker — Docker)

### 2.3 Secret'ları Gir
Render Dashboard'da her servis için:

**hooksniff-api** servisine tıkla → **Environment** sekmesi:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:REDACTED_PASSWORD@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require` |
| `REDIS_URL` | `rediss://default:gQAAAAAAAYCPAAIgcDI1ZGFhYWUxZGRhZjM0YjhhYTQ1OGFjOGEzZTg1OTMzNg@integral-ostrich-98447.upstash.io:6379` |
| `POLAR_ACCESS_TOKEN` | `polar_oat_MG9p6TbzA7YjRWtFruRB8YUPa1CG2tkwVAJXI32Zw9F` |
| `POLAR_WEBHOOK_SECRET` | `polar_whs_bjhiDZvCoWIoGvrgBBVm49ZhMIKmX7hSekMt92hxmnB` |
| `RESEND_API_KEY` | `re_BGbQVTfq_NyahSBBbiS4GERnctr7DN8Xu` |

**hooksniff-worker** servisi için de aynı `DATABASE_URL`, `REDIS_URL`, `RESEND_API_KEY` gir.

### 2.4 Custom Domain Ekle
1. **hooksniff-api** servisine tıkla
2. **Settings** → **Custom Domains**
3. **"Add Custom Domain"** → `api.hooksniff.is-a.dev` yaz
4. Render sana bir DNS record verecek (CNAME)

### 2.5 Health Check
Deploy tamamlandıktan sonra:
- `https://hooksniff-api.onrender.com/health` adresini aç
- `{"status":"ok"}` görmeliysin

---

## Adım 3: Cloudflare DNS (5 dk)

### 3.1 Cloudflare'a Gir
1. https://dash.cloudflare.com adresine git
2. **is-a.dev** zone'unu seç (veya arat)

### 3.2 DNS Kayıtları Ekle

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `api` | `hooksniff-api.onrender.com` | ✅ Proxied |

> Not: `hooksniff` ve `www` kayıtları zaten is-a-dev/register PR'ında yapılacak.
> Eğer PR onaylandıysa, bunlar otomatik oluşur.

---

## Adım 4: Resend Domain Doğrulama (5 dk)

### 4.1 Resend Dashboard
1. https://resend.com adresine git
2. **Domains** → **Add Domain**
3. `hooksniff.is-a.dev` ekle

### 4.2 DNS Kayıtları
Resend sana DNS kayıtları verecek. Cloudflare'da ekle:

| Type | Name | Content |
|------|------|---------|
| TXT | `_resend` | (Resend'in verdiği değer) |
| MX | `@` | (Resend'in verdiği değer) |

### 4.3 Doğrulama
1. DNS kayıtlarını ekledikten sonra Resend'de **"Verify"** butonuna bas
2. Doğrulanınca `noreply@hooksniff.is-a.dev` çalışacak

---

## Adım 5: Test Et (5 dk)

### 5.1 API Health Check
```bash
curl https://api.hooksniff.is-a.dev/health
```
Beklenen: `{"status":"ok"}`

### 5.2 Dashboard Test
1. https://hooksniff.vercel.app/en/login adresine git
2. Kayıt ol veya giriş yap
3. Dashboard yükleniyor mu kontrol et

### 5.3 Webhook Test
Dashboard'dan yeni endpoint oluştur ve test webhook gönder.

---

## ⚠️ Güvenlik Hatırlatması

**Tüm token'ları yenile!** Chat'te paylaşmıştın:
- GitHub PAT → Settings → Developer Settings → Personal Access Tokens → Delete & Recreate
- Vercel token → Vercel Dashboard → Settings → Tokens → Revoke
- Neon password → Neon Dashboard → Settings → Reset Password
- Upstash token → Upstash Dashboard → Redis → REST API → Rotate
- Polar tokens → Polar Dashboard → Settings → Tokens → Revoke
- Resend key → Resend Dashboard → API Keys → Delete & Recreate
- Render key → Render Dashboard → API Keys → Revoke
- Cloudflare tokens → Cloudflare Dashboard → My Profile → API Tokens → Revoke
- Grafana key → Grafana Dashboard → API Keys → Delete

---

## 📞 Takıldığın Yerde

Her adımda sorun yaşarsan bana:
1. Hangi adımda takıldığını söyle
2. Varsa hata mesajını gönder
3. Screenshot da gönderebilirsin

Hızlı çözerim! 💪

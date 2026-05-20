# 2026-05-20 — Deploy Rehberi ve Bilinen Sorunlar

## 🚀 Deploy Süreci

### Vercel Deploy (Dashboard)
- **Repo:** https://github.com/servetarslan02/HookSniff
- **Vercel Project:** `hooksniff-dash` (ID: `prj_cSIVYHpCoAtoihRp8xlXIun1KVSR`)
- **Dashboard URL:** https://hooksniff.vercel.app
- **Trigger:** `main` branch'ine push → otomatik deploy

#### ⚠️ KRİTİK: vercel.json Yapılandırması
Next.js projesi **`dashboard/`** dizininde. Ama `vercel.json` kök dizinde.

**DOĞRU yapılandırma:**
```json
{
  "buildCommand": "cd dashboard && rm -rf .next && npm ci && npm run build && sh ../scripts/fix-manifest.sh",
  "outputDirectory": "dashboard/.next",
  "framework": "nextjs",
  "installCommand": "cd dashboard && npm ci"
}
```

**YANLIŞ yapılandırma (deploy hatasına neden olur):**
```json
{
  "buildCommand": "rm -rf .next && npm ci && npm run build && sh scripts/fix-manifest.sh",
  "outputDirectory": ".next",
  "installCommand": "npm ci"
}
```

**Neden yanlış?** Kök dizinde `npm ci` çalışırsa sadece `pg` paketi yüklenir. Dashboard'ın bağımlılıkları (`next-intl`, `next`, `react` vb.) yüklenmez → `Cannot find module 'next-intl/plugin'` hatası.

#### Bilinen Vercel Hataları
| Hata | Sebep | Çözüm |
|------|-------|-------|
| `Cannot find module 'next-intl/plugin'` | `npm ci` kök dizinde çalışıyor | `installCommand`'a `cd dashboard &&` ekle |
| `Output directory not found` | `outputDirectory` yanlış | `dashboard/.next` olarak ayarla |
| BLOCKED | Git committer GitHub user ile eşleşmiyor | `git config user.email` + `user.name` ayarla |
| `TypeScript error` | `next build` tip hatası | `next.config.js`'de `typescript.ignoreBuildErrors: true` |

### Cloud Build Deploy (API + Worker)
- **Proje:** `hooksniff-app` (GCP)
- **Config:** `cloudbuild.yaml`
- **Trigger:** GCP Cloud Build tetikleyici

#### Cloud Build Adımları
1. `npm install pg && node run-migrations.js` — DB migration
2. `docker build -f Dockerfile.api` — API image
3. `docker build -f Dockerfile.worker` — Worker image
4. Push images to `europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/`
5. `gcloud run deploy hooksniff-api` — Cloud Run deploy

#### Cloud Build Hataları
| Hata | Sebep | Çözüm |
|------|-------|-------|
| `PERMISSION_DENIED` | API kapalı | GCP Console'dan ilgili API'yi enable et |
| `Firebase Hosting API disabled` | Hosting API kapalı | [Bu linkten](https://console.developers.google.com/apis/api/firebasehosting.googleapis.com/overview?project=1046140057667) enable et |
| Migration hatası | DB connection | `DATABASE_URL` secret'ını kontrol et |

### Neon DB
- **Proje:** `hookrelay` (org: Servet, Free tier)
- **Connection:** `ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech`

---

## 🔑 Hesap Bilgileri (Güncel)

| Servis | Bilgi |
|--------|-------|
| **Admin giriş** | email: servetarslan02@gmail.com |
| **Dashboard URL** | https://hooksniff.vercel.app |
| **API URL** | https://hooksniff-api-1046140057667.europe-west1.run.app |
| **Vercel Project** | hooksniff-dash (`prj_cSIVYHpCoAtoihRp8xlXIun1KVSR`) |
| **GCP Projesi** | hooksniff-app |

---

## 📝 Bugünkü Oturum (2026-05-20 20:21–21:00 GMT+8)

### Yapılan İşler
1. **Vercel Build Fix** — `vercel.json`'da `installCommand` ve `buildCommand` düzeltildi
   - Sorun: `npm ci` kök dizinde çalışıyordu → `next-intl` bulunamıyordu
   - Çözüm: `cd dashboard && npm ci` olarak değiştirildi
2. **Icon Barrel Fix** — `Send` ve `X` icon'ları `components/icons.ts`'ye eklendi
3. **Deploy tetiklendi** — `709f8c16` commit'i push edildi, Vercel BUILDING

### Kullanılan Araçlar
- Neon DB bağlantısı ile veritabanı kontrol edildi (73 teslimat mevcut)
- Vercel API ile deploy durumu kontrol edildi
- `webhooksApi.list` endpoint'inin doğru veri döndüğü doğrulandı

### Sonraki Adımlar
- [ ] Vercel deploy READY olmasını bekle ve kontrol et
- [ ] Dashboard'da teslimat ve arama sayfalarının çalıştığını doğrula
- [ ] GitHub ve Vercel token'larını değiştir (rotate et)

# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-15 20:20 GMT+8 (Oturum 167)
> Bu dosya GitHub'da kalıcıdır. Her oturum başı okunur, oturum sonunda güncellenir.

---

## 📖 Okuma Rehberi

Bu dosyayı ilk kez okuyorsan:
1. Önce `MEMORY.md`'yi oku — proje hakkında genel bilgi
2. Bu dosyadaki "✅ Tamamlanan" bölümü → son neler yapılmış
3. "📋 Sıradaki İşler" bölümü → şimdi ne yapılacak
4. "Servet Görevleri" → kullanıcıya ait manuel işler

---

## ✅ Tamamlanan (Son Oturum — 2026-05-15)

### Cloud Build Fix (Oturum 167) ✅
1. **`bool as f64` hatası düzeltildi** — `api/src/jobs/metrics_push.rs:76`
   - `api_ok as f64` → `if api_ok { 1.0 } else { 0.0 }`
   - 20+ failed build çözüldü (commit: 4274718)
2. **SSL warning düzeltildi** — `run-migrations.js`
   - Connection string'den `sslmode` temizlendi (commit: adee2090)
3. **Cloud Build logları incelendi** — tüm adımlar başarılı
4. **Neon DB analizi** — 60+ tablo, 12 MB, cache hit 99.79%
5. **84 kullanılmayan index silindi** — DB 13 MB → 12 MB
6. **Seq scan analizi tamamlandı** — endpoints, customers, notifications sorunlu

---

## 📋 Sıradaki İşler

### Öncelik 0 — Neon Seq Scan Optimizasyonu (EN KRİTİK)

**Problem:** Bazı tablolarda PostgreSQL index yerine tüm tabloyu baştan sona okuyor (seq scan). Şu an 12 MB olduğu için sorun değil ama veri büyüyünce yavaşlayacak.

| Tablo | Seq Scan | Index Scan | Etki |
|-------|----------|------------|------|
| endpoints | 72,720 | 308 | 235x fazla okuma |
| customers | 13,639 | 1,241 | 11x fazla okuma |
| notifications | 9,952 | 670 | 15x fazla okuma |
| invoices | 1,328 | 55 | 24x fazla okuma |
| webhook_queue | 90,011 | 83,438 | ~1.1x (orta) |
| deliveries | 5,031 | 2,372 | ~2x (orta) |

**Yapılacak:**
1. `api/src/` altındaki Rust kodunda bu tabloları sorgulayan yerleri bul
2. SELECT sorgularına uygun WHERE clause ekle (örn: `WHERE customer_id = $1`)
3. Eksik index'leri oluştur
4. `cargo test --lib` ile doğrula
5. Cloud Build'de deploy et

### Öncelik 1 — Güvenlik (P0 kalan)
| # | Görev | Durum | Dosya |
|---|-------|-------|-------|
| 1 | HS-038f: Timing attack — login hataları farklı mesajlar | ⬜ | auth.rs |
| 2 | HS-038g: serde_json hata gösteriyor | ⬜ | error.rs |
| 3 | HS-038h: Email enumeration — register mesajı | ⬜ | auth.rs |
| 4 | HS-038j: rate_limit.rs unwrap() — panic riski | ⬜ | rate_limit.rs |

### Öncelik 2 — i18n Büyük İş
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 5 | 920+ hardcoded İngilizce string → Türkçe | ⬜ | Birden fazla oturum |
| 6 | HS-068: Türkçe çeviri hataları | ⬜ | |

### Öncelik 3 — Performance (Kalan)
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 7 | Cloudflare Workers (Edge deploy) | 🔶 v1 yazıldı | Deploy için Servet: KV namespace oluştur + wrangler login |
| 8 | Read Replica (Neon) | ❌ | Free tier desteklemiyor |

### Öncelik 4 — P2 Kalan
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 9 | HS-047: blog/[slug] 1922 satır mega component | ⬜ | Refactoring |
| 10 | HS-065: 920+ hardcoded string (i18n) | ⬜ | Büyük iş |
| 11 | HS-070: output:standalone | ⬜ | Vercelde gerekli değil |
| 12 | HS-071: HSTS header | ✅ | Zaten mevcut |

---

## 👤 Servet Görevleri (Kullanıcıya ait manuel işler)

| Görev | Durum | Not |
|-------|-------|-----|
| iyzico hesap aç | ❌ | Vergi levhası + banka hesabı gerekli |
| Domain kararı | ❌ | hooksniff.vercel.app yeterli şimdilik |
| GitHub Actions dakikası | ❌ | CI bitmiş, yenilenmeli |
| **Cloudflare Workers deploy** | ⚠️ | wrangler login + KV namespace oluştur |
| Stripe payout + identity verification | ❌ | Polar.sh için gerekli |

---

## 🔧 Teknik Notlar

### Neon DB Bağlantı
```
postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require
```
- Endpoint: ep-frosty-bar-al0hyt9d (eu-central-1, Frankfurt)
- Proje adı: hookrelay (Neon'da)
- Branch: production (tek branch)
- 2FA gerekli (Google authenticator)

### GCP Cloud Build
- Proje: hooksniff-app
- Trigger: deploy-on-push (GitHub push → otomatik build)
- cloudbuild.yaml → Docker build → Cloud Run deploy
- Build süresi: ~6-8 dakika

### Rust Toolchain
- rustc 1.95.0, cargo 1.95.0
- `source $HOME/.cargo/env` ile cargo çalışır
- `cargo check` → derleme kontrolü
- `cargo test --lib` → test çalıştırma
- `cargo clippy --workspace` → lint kontrolü

### Vercel Deploy
- Root Directory = `dashboard` (Project Settings'te ayarlı)
- `vercel.json` → buildCommand, outputDirectory override
- GitHub push → otomatik deploy
- Hobby plan: 100 deploy/gün limiti

### Git
- Email: servetarslan02@users.noreply.github.com
- Conventional commits: "fix:", "feat:", "docs:" kullan
- Oturum sonunda mutlaka push et

---

## ⚠️ Bilinen Sorunlar

1. **Seq scan fırtınası** — endpoints, customers, notifications (yukarıda detay)
2. **Compute limiti aşılmış** — Neon Free tier 191.99 saat, 193.39 kullanılmış
3. **920+ hardcoded İngilizce string** — dashboard'da Türkçe çeviri
4. **GitHub Actions dakikaları bitmiş** — CI failure
5. **Grafana trial bitiyor** — 20 Mayıs'a kadar
6. **Resend domain** — hooksniff.is-a.dev FAILED, onboarding@resend.dev kullanılıyor

---

## 📊 Proje İstatistikleri

- **Toplam oturum:** 167+
- **Son deploy:** 2026-05-15 19:37 GMT+8 (başarılı)
- **DB boyutu:** 12 MB
- **Tablo sayısı:** 60+ (çoğu boş)
- **Index sayısı:** 149 (84'ü silindi)
- **Cache hit ratio:** 99.79%

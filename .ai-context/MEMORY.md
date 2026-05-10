# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-11 02:12 GMT+8

## Kullanıcı
- **Servet Arslan** — servetarslan02 (GitHub)
- Türkiye, teknik bilgi yok, ilk proje
- Hedef: $500/ay gelir, sonra şirket kur
- Dil: Türkçe

## Çalışma Kuralları
- Oturumlar 1 saat, yetişmeyebilir
- `.ai-context/` GitHub'da kalıcı hafıza
- Her oturum sonunda MEMORY.md + NEXT_SESSION.md güncelle
- Local dosyalar silinir, önemli bilgiler GitHub'a commit et
- **Rust compile + test zorunlu** — gözle bakarak yetmez
- **npm install çalıştır** — yarım iş bırakma
- **Conventional commits** — "Oturum XX:" değil, "fix:", "feat:", "docs:" kullan

## Hesap Bilgileri
- Admin: servetarslan02@gmail.com / Alayci_165 (business, admin)
- Demo: demo@hooksniff.com / Demo1234! (free, non-admin)
- API: hooksniff-api-1046140057667.europe-west1.run.app
- Dashboard: https://hooksniff.vercel.app

## 📊 Güncel İlerleme (2026-05-11 00:52)

| Kategori | Toplam | Tamamlanan | Kalan |
|----------|--------|-----------|-------|
| 🚨 P0 | 14 | 14 | 0 |
| 🔴 P1 | 44 | 46 | 0 |
| 🟡 P2 | 38 | 32 | 6 |
| 🟢 P3 | 13 | 7 | 6 |
| **TOPLAM** | **103** | **99** | **4** |

## Oturum 94 (2026-05-10 22:58 - 23:54) ✅
- **12 major dependency güncellendi:**
  - sha2 0.10→0.11, hmac 0.12→0.13
  - thiserror 1→2, jsonwebtoken 9→10 (+ rust_crypto)
  - axum 0.7→0.8, tower 0.4→0.5, tower-http 0.5→0.6
  - opentelemetry 0.24→0.32, opentelemetry-otlp 0.17→0.32
  - tonic 0.12→0.14, reqwest 0.12→0.13
  - tracing-opentelemetry 0.25→0.32 (patched vendor)
- **Dashboard TypeScript:** 148 hata düzeltildi (0 hata)
- **Testler:** 999/999 geçti (979 API + 20 worker)
- **Commits:** `7d89aa1`, `c7d6236`, `815705d` — main branch
- **Paralel agent kullanımı:** 5 agent aynı anda çalıştırıldı (axum, otel, ts-fix, remaining-deps, test)

## Güncel Bağımlılık Versiyonları (Oturum 95 sonrası)
| Paket | Versiyon | Durum |
|---|---|---|
| axum | 0.8 | ✅ en güncel |
| tower | 0.5 | ✅ en güncel |
| tower-http | 0.6 | ✅ en güncel |
| opentelemetry | 0.32 | ✅ en güncel |
| opentelemetry-otlp | 0.32 | ✅ en güncel |
| tracing-opentelemetry | 0.32 | ⚠️ patched vendor (upstream 0.33 bekleniyor) |
| tonic | 0.14 | ✅ en güncel |
| thiserror | 2 | ✅ en güncel |
| jsonwebtoken | 10 | ✅ en güncel |
| sha2 | 0.11 | ✅ en güncel |
| hmac | 0.13 | ✅ en güncel |
| reqwest | 0.13 | ✅ en güncel |
| sqlx | 0.8 | ✅ en güncel |
| redis | 1.2 | ✅ en güncel |
| rand | 0.10 | ✅ en güncel |
| prometheus | 0.14 | ✅ en güncel |

## Ertelemeye Devam Edenler
- HS-065: 920+ hardcoded string (büyük iş) — fiyatlandırma i18n ile birlikte yapılacak
- HS-084: iyzico iptal — Polar.sh devam, kod pasif kalsın, şirketleşince aktif edilir
- HS-090: SDK otomatik güncelleme sistemi (detaylı araştırma gerekli, lansman sonrası)
- tracing-opentelemetry vendor patch kaldırma (upstream 0.33 çıkınca)
- Dependabot major PR'ları: TypeScript 6, Tailwind 4, Recharts 3, Next.js 16 (dikkatli olunmalı)

## Fiyatlandırma Kararı (Oturum 97)
- Avrupa: USD ($29/$99), Türkiye: ₺ (₺149/₺449) — Polar.sh multi-currency
- iyzico pasif kalacak, kod silinmeyecek
- Fiyat gösterimi i18n ile birlikte yapılacak (HS-065 kapsamında)

## Oturum 95 (2026-05-11 00:00 - 00:20) ✅
- **4 major dependency güncellendi:**
  - sqlx 0.7→0.8 (encode_by_ref Result dönüş tipi değişti)
  - redis 0.25→1.2 (sorunsuz geçti)
  - rand 0.8→0.10 (OsRng→SysRng, RngCore→TryRng, thread_rng→rng, distributions→distr)
  - prometheus zaten 0.14'müş (NEXT_SESSION.md'de yanlış yazılmış)
- **Dashboard npm update:** react 19.2.6, next 15.5.18, next-intl 4.11.1, @types/node 20.19.40
- **Testler:** 999/999 geçti (979 API + 20 worker)
- **ESLint:** clean
- **Commit:** `cb3ed64` — main branch
- **Tüm Rust major bağımlılıkları artık en güncel!** 🎉

## Oturum 96 (2026-05-11 00:57 - 01:50) ✅
- **Staging testleri:** Health, login, rate limit (429 @ 25), webhook DB write → 2/2 delivered ✅
- **Worker sorunları çözüldü:**
  - `channel_binding=require` sqlx 0.8 uyumsuz → strip edildi
  - Cloud Run startup probe timeout → health server DB'den önce başlatıldı
  - Worker'da DATABASE_URL/REDIS_URL eksik → Cloud Run API ile eklendi (GCP SA credentials ile)
  - CI `cancel-in-progress: true` → false yapıldı
- **Worker deprecation fix:** `clone_from_slice` → `try_from` (signing.rs)
- **SDK retry (HS-081):** 7 SDK'ya eklendi → 11/11 SDK'da retry var
- **Test coverage:** Worker 48 test (+28 yeni), Dashboard 2824 test, API 979 test
- **Issue tracker:** HS-077/078/079/081/083/086/087 çözüldü (96/103)
- **Commits:** `e753a03`→`eee1de6` (8 push)
- **Kalan 7:** HS-065 (i18n), HS-082 (version), HS-084 (iyzico), HS-085 (db.rs), HS-088-089 (frontend test)

## Oturum 97 (2026-05-11 01:58 - 02:12) ✅
- **HS-088: AuthGuard component test** — 16 test yazıldı (loading, redirect, authenticated, transition, edge cases)
- **HS-082: SDK version mismatch** — tüm SDK'lar 0.2.0'a eşitlendi
  - Node, Python, Ruby, PHP: 0.1.0 → 0.2.0
  - Java, Kotlin: 0.3.0 → 0.2.0
  - Rust, C#, Elixir: zaten 0.2.0
  - Publish guide güncellendi
- **Testler:** API 979/979, Worker 48/48, Dashboard 3132/3132 (137 dosya)
- **Commit:** `425ce6c` — main branch
- **Kalan 5:** HS-065 (i18n), HS-084 (iyzico), HS-085 (db.rs), HS-089 (SSO test - zaten var, 47 test), SDK publish

## Oturum 91-93 (2026-05-10 22:08 - 22:53) ✅
- HS-019: WebSocket max_connections=1000
- HS-020: Circuit breaker worker'a entegre
- HS-021: Billing webhook idempotency
- HS-022: Throttle state in-memory (documented)
- HS-023: FIFO modülü worker'a entegre
- HS-047: blog/[slug] refactoring
- HS-067: Müşteri hikayeleri disclaimer
- HS-068: Türkçe çeviri düzeltmeleri
- HS-080: ESLint 8→9 migration (flat config)
- HS-077: 6 stale branch silindi
- HS-079: Conventional commits standardı
- Compile ✅ Test 1030/1030 ✅ Lint ✅

## 🔧 Zorunlu Kurulumlar ve Testler

### Her Yeni Oturumda Kurulu Olması Gereken Programlar
1. **Rust toolchain** — `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y`
2. **Node.js + npm** — zaten kurulu olmalı
3. **Git** — zaten kurulu olmalı

### Kurulum Kontrol Komutları
```bash
source "$HOME/.cargo/env" && rustc --version && cargo --version
node --version && npm --version
```

### Her Değişiklik Sonrası Zorunlu Testler
```bash
cargo check
cargo test -p hooksniff-api --lib
cargo test -p hooksniff-worker
cd dashboard && npm run lint && npx tsc --noEmit
git add -A && git commit -m "type: message" && git pull --rebase origin main && git push origin main
```

### Erteleme Kuralı
- ❌ "Daha sonra yaparız" YASAK
- ❌ "Bu riskli, dokunmayalım" YASAK (önce araştır, sonra karar ver)
- ✅ Yapılabilen hemen yapılır
- ✅ Büyük işler bile olsa başla, parça parça ilerle

### İş Kalite Kuralları
- ❌ **Yarım iş yasak** — başladığın işi bitir, compile et, test et, push et
- ❌ **Hızlıya kaçmak yasak** — "çabuk bitireyim" diye atlanmaz
- ❌ **Üstün körü iş yasak** — compile + test zorunlu
- ❌ **Erteleme yasak** — "daha sonra", "büyük iş", "riskli" kabul edilmez
- ✅ **Detaylı değerlendirme** — her iş titizlikle kontrol edilecek
- ✅ **Parça parça ilerle** — büyük işleri böl, her parçayı doğrula
- ✅ **Sor** — emin değilsen Servet'e sor, tahmin yürütme

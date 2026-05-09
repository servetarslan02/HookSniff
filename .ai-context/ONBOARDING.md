# 🪝 HookSniff — Yeni Oturum Rehberi

> Her yeni oturumda ilk olarak bunu oku.
> Son güncelleme: 2026-05-10

---

## ⚠️ KRİTİK KURAL: REPO AYRIMI

| İş Türü | Repo | Açıklama |
|---------|------|----------|
| Hata düzeltme, fix, refactor | `servetarslan02/HookSniff` | Orijinal repo, main branch |
| Yeni özellik geliştirme | `servetarslan02/hooksniff-lab` | Lab repo, test → onay → merge |
| Mobil uygulama | `servetarslan02/hooksniff-mobile` | Ayrı repo, main branch |
| AI Agent katmanı | `servetarslan02/hooksniff-lab` | Lab repo, Servet onayı beklemede |

**Kural:** Yeni özellikler lab repo'da geliştirilir, test edilir, Servet onay verirse ana repo'ya merge edilir.

---

## Biz Kimiz?

- **Servet Arslan** — Proje sahibi, kod bilmiyor, Türkiye
- **AI Agent** — Tüm teknik işlerden sorumlu (Rust, Next.js, DevOps)

## Proje: HookSniff

Webhook delivery servisi. Geliştiricilere yönelik.
- Rakipler: Svix ($490/ay), Hookdeck ($39/ay), Hook0
- Fiyat: Free $0 / Pro $29 / Business $99
- Hedef: $500/ay gelir → şirket kur

## Hafıza Sistemi

Tüm hafıza `.ai-context/` klasöründe tutulur.

### Her yeni oturumda:
1. `git pull origin main`
2. Bu dosyayı oku (`.ai-context/ONBOARDING.md`)
3. `.ai-context/MEMORY.md` — proje durumu, oturum geçmişi
4. `.ai-context/NEXT_SESSION.md` — sıradaki işler
5. Kaldığın yerden devam et

### Klasör Yapısı:
```
.ai-context/
├── MEMORY.md              ← Uzun vadeli hafıza
├── NEXT_SESSION.md        ← Sonraki oturum planı
├── ONBOARDING.md          ← Bu dosya
├── README.md              ← İndeks
│
├── audit/                 ← Kod denetim raporları (8 dosya)
├── mobile/                ← Mobil uygulama planları (5 dosya)
├── sdk/                   ← SDK strateji ve rehberler (4 dosya)
├── market/                ← Pazar, rekabet analizi (7 dosya)
├── logs/                  ← Günlük oturum logları (4 dosya)
└── strategy/              ← Strateji raporları (31 dosya, dokunulmaz)
```

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| API | Rust + Axum (port 3000) |
| Worker | Rust (background webhook delivery) |
| Dashboard | Next.js 15 (Vercel'de) |
| Veritabanı | PostgreSQL (Neon, serverless) |
| Cache | Redis (Upstash, serverless) |
| Hosting | Google Cloud Run (API + Worker) |
| CDN | Cloudflare |
| Monitoring | Grafana Cloud (OpenTelemetry) |
| Ödeme | Polar.sh (global) + iyzico (TR) |
| Email | GCloud Gmail API |
| SDK | 11/11 yayınlandı ✅ |

## Servis Durumları

| Servis | Durum | URL |
|--------|-------|-----|
| Dashboard | ✅ Çalışıyor | https://hooksniff.vercel.app |
| API | ✅ Çalışıyor | GCP Cloud Run |
| Worker | ✅ Çalışıyor | GCP Cloud Run |
| Neon DB | ✅ Aktif | Serverless PostgreSQL |
| Upstash Redis | ✅ Aktif | Serverless Redis |
| Polar.sh | ✅ Aktif | $29/$99 plan |
| Gmail API | ✅ Aktif | Service account |
| Grafana Cloud | ✅ Aktif | OpenTelemetry |
| Cloudflare R2 | ✅ Hazır | 10GB depolama |
| iyzico | ❌ Hesap açılacak | TR ödemeler |

## Kritik Kurallar

### Güvenlik
- `.env.production` asla GitHub'a push etme
- Token paylaşımı: sadece chat'te, sonra rotate

### TLS
- Tüm TLS bağımlılıkları rustls kullanır (OpenSSL yok)

### Deploy
- Dashboard: Vercel (otomatik, GitHub push'ta)
- API + Worker: Google Cloud Run

### CI/CD
- Repo **private** → GitHub Actions 2K dk/ay limit
- Local CI: `scripts/ci-local.sh`
- Cloud Build: 120 dk/gün free

## Proje Yapısı

```
HookSniff/
├── api/                 → Rust API sunucusu (Axum)
├── worker/              → Background webhook delivery
├── dashboard/           → Next.js 15 frontend (Vercel)
├── sdks/                → 11 dilde SDK
├── portal/              → Embeddable customer portal
├── cli/                 → CLI tool
├── docs/                → OpenAPI spec (3171 satır) + dokümantasyon
├── .ai-context/         → AI hafıza dosyaları
├── TODO.md              → Yapılacaklar
├── FEATURES.md          → Feature tracker
└── STATUS.md            → Genel durum
```

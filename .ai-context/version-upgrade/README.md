# 📋 Versiyon Geçiş Rehberi — HookSniff

> Oluşturulma: 2026-05-16
> Kapsam: Tüm sistem bileşenlerinin versiyon envanteri ve geçiş planı

---

## İçindekiler

| Dosya | İçerik |
|-------|--------|
| `README.md` | ← Bu dosya. Genel bakış |
| `01-envanter.md` | Mevcut vs en son versiyon karşılaştırması |
| `02-rust-backend.md` | Rust backend güncelleme rehberi |
| `03-dashboard-major.md` | Next.js 16, Tailwind 4, TS 6, recharts 3, ESLint 10 |
| `04-altyapi.md` | Docker, Node.js, PostgreSQL güncellemeleri |
| `05-onerilen-siralama.md` | Adım adım uygulama planı |
| `06-ek-bulgular.md` | GitHub Actions, CI/CD, SDK runtime'ları, MCP |
| `07-derin-tarama.md` | Rust SDK, Edge Proxy, Monitoring, CLI, DevDeps |
| `08-sdk-dil-detay.md` | Tüm SDK'ların dil/framework spesifik versiyonları |
| `09-en-derin-tarama.md` | Kaynak kod, test, güvenlik, mimari detaylar |

---

## Özet

| Kategori | Toplam | Güncel | Güncelleme Gerekli |
|----------|--------|--------|--------------------|
| Rust crates (ana proje) | 28 | 27 | 1 (minor patch) |
| Rust SDK | 10 | 7 | **3 (major uyumsuz)** |
| NPM packages (dashboard) | 17 | 10 | 7 (5 major, 2 minor/patch) |
| NPM packages (edge-proxy) | 4 | 1 | **3 (major)** |
| NPM packages (docs-sdk) | 6 | 3 | **3 (React 19, Docusaurus)** |
| NPM packages (CLI) | 1 | 0 | **1 (commander major)** |
| GitHub Actions | 15 | 5 | **10 (major)** |
| Docker images | 7 | 3 | **4 (Node 22, PostgreSQL 17)** |
| Monitoring | 2 | 0 | **2 (Prometheus, Grafana)** |
| SDK dilleri | 11 | 3 | **8 (Kotlin, Swift, Rust, Ruby major)** |
| SDK runtimes | 6 | 3 | 3 (Go, Python, Ruby) |
| Dev dependencies | 10 | 6 | 4 (jest-axe, eslint-plugin, etc.) |

## Risk Dağılımı

- 🟢 **Düşük risk:** Rust patch'leri, minor npm güncellemeleri
- 🟡 **Orta risk:** TypeScript 6, ESLint 10, recharts 3, Node 22, PostgreSQL 17
- 🔴 **Yüksek risk:** Next.js 16, Tailwind CSS 4

## Tahmini Süre

**Toplam: 7-9 oturum** (her biri ~1 saat)

---

## 📊 Final İstatistikler

- **Taranan dosya:** 8,093
- **Taranan bileşen:** ~70+
- **Güncelleme gerekli:** ~45+
- **Rust test fonksiyonu:** 1,181
- **Dashboard test dosyası:** 138
- **API route modülü:** 39
- **SDK sayısı:** 11 dil
- **Dokümantasyon:** 10 belge, ~50 KB

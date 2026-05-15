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

---

## Özet

| Kategori | Toplam | Güncel | Güncelleme Gerekli |
|----------|--------|--------|--------------------|
| Rust crates | 28 | 21 | 7 (patch seviyesi) |
| NPM packages | 17 | 10 | 7 (3 major, 4 minor/patch) |
| Altyapı | 5 | 3 | 2 (Node LTS, PostgreSQL) |

## Risk Dağılımı

- 🟢 **Düşük risk:** Rust patch'leri, minor npm güncellemeleri
- 🟡 **Orta risk:** TypeScript 6, ESLint 10, recharts 3, Node 22, PostgreSQL 17
- 🔴 **Yüksek risk:** Next.js 16, Tailwind CSS 4

## Tahmini Süre

**Toplam: 7-9 oturum** (her biri ~1 saat)

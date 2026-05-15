# 📦 Önerilen Uygulama Sıralaması

> Toplam tahmini süre: 7-9 oturum
> Her oturum ~1 saat

---

## Kritik Kural

**Her adımdan sonra:**
1. `npm run build` veya `cargo check` çalıştır
2. Local test et (mümkünse)
3. Commit + push
4. Cloud Build deploy'unu kontrol et
5. Sonraki adıma geç

**Asla tek seferde tüm güncellemeleri yapma!**

---

## Faz 1: Hazırlık (1 oturum)

| # | Görev | Süre | Not |
|---|-------|------|-----|
| 1.1 | Git branch oluştur: `upgrade/major-updates` | 5 dk | Tüm güncellemeler bu branch'te |
| 1.2 | Mevcut durumu test et | 15 dk | `npm run build`, `cargo check` |
| 1.3 | `.ai-context/version-upgrade/` oku | 15 dk | Bu rehberleri takip et |
| 1.4 | Backup: DB dump (Neon) | 15 dk | Neon Console'dan export |

---

## Faz 2: Minor/Patch Güncellemeleri (1 oturum)

| # | Görev | Süre | Risk |
|---|-------|------|------|
| 2.1 | `cargo update` — Rust minor patches | 10 dk | 🟢 |
| 2.2 | `npm update` — NPM minor patches | 10 dk | 🟢 |
| 2.3 | `next-intl` 4.11 → 4.12 | 10 dk | 🟢 |
| 2.4 | `vitest` 4.1.5 → 4.1.6 | 5 dk | 🟢 |
| 2.5 | `dompurify` 3.4.2 → 3.4.3 | 5 dk | 🟢 |
| 2.6 | Build test + commit | 20 dk | — |

---

## Faz 3: TypeScript 6 (1 oturum)

| # | Görev | Süre | Risk |
|---|-------|------|------|
| 3.1 | `npm install -D typescript@latest` | 5 dk | 🟡 |
| 3.2 | `npx tsc --noEmit` — tip kontrolü | 15 dk | 🟡 |
| 3.3 | Hataları düzelt (import assert → with) | 20 dk | 🟡 |
| 3.4 | `npm run build` — full build test | 10 dk | — |
| 3.5 | Commit + push | 5 dk | — |

---

## Faz 4: ESLint 10 (1 oturum)

| # | Görev | Süre | Risk |
|---|-------|------|------|
| 4.1 | `npm install -D eslint@latest eslint-config-next@latest` | 5 dk | 🟡 |
| 4.2 | Eski config kontrolü (.eslintrc → eslint.config.js) | 15 dk | 🟡 |
| 4.3 | `eslint-env` yorumlarını kaldır | 10 dk | 🟡 |
| 4.4 | `npx eslint .` — lint test | 10 dk | 🟡 |
| 4.5 | `npm run build` — full build test | 10 dk | — |
| 4.6 | Commit + push | 5 dk | — |

---

## Faz 5: recharts 3 (1 oturum)

| # | Görev | Süre | Risk |
|---|-------|------|------|
| 5.1 | `npm install recharts@latest` | 5 dk | 🟡 |
| 5.2 | recharts kullanım tara (`grep -r "recharts"`) | 10 dk | 🟡 |
| 5.3 | Breaking change'leri düzelt | 25 dk | 🟡 |
| 5.4 | `npm run build` — full build test | 10 dk | — |
| 5.5 | Görsel test (chart'lar çalışıyor mu?) | 10 dk | — |
| 5.6 | Commit + push | 5 dk | — |

---

## Faz 6: Tailwind CSS 4 (1-2 oturum)

| # | Görev | Süre | Risk |
|---|-------|------|------|
| 6.1 | `npx @tailwindcss/upgrade` — otomatik tool | 15 dk | 🔴 |
| 6.2 | postcss.config.mjs kontrol | 10 dk | 🔴 |
| 6.3 | CSS import kontrol (@tailwind → @import) | 10 dk | 🔴 |
| 6.4 | Utility rename'leri kontrol et | 20 dk | 🔴 |
| 6.5 | Border rengi kontrol (currentColor değişikliği) | 15 dk | 🔴 |
| 6.6 | Ring kontrol (3px → 1px) | 10 dk | 🔴 |
| 6.7 | `npm run build` — full build test | 10 dk | — |
| 6.8 | Görsel test (tüm sayfalar) | 20 dk | — |
| 6.9 | Commit + push | 5 dk | — |

---

## Faz 7: Next.js 16 (2-3 oturum)

### Oturum 7A: Güncelleme

| # | Görev | Süre | Risk |
|---|-------|------|------|
| 7.1 | `npx @next/codemod@canary upgrade latest` | 15 dk | 🔴 |
| 7.2 | `npm install next@latest react@latest react-dom@latest` | 5 dk | 🔴 |
| 7.3 | next.config.js kontrol (turbopack config) | 15 dk | 🔴 |
| 7.4 | Async API kontrolü | 20 dk | 🔴 |
| 7.5 | `npm run build` — build test | 10 dk | — |

### Oturum 7B: Düzeltmeler

| # | Görev | Süre | Risk |
|---|-------|------|------|
| 7.6 | Build hatalarını düzelt | 30 dk | 🔴 |
| 7.7 | Middleware → Proxy (gerekirse) | 15 dk | 🔴 |
| 7.8 | `npm run build` — tekrar test | 10 dk | — |
| 7.9 | Commit + push | 5 dk | — |

### Oturum 7C: Test

| # | Görev | Süre | Risk |
|---|-------|------|------|
| 7.10 | Görsel test (tüm sayfalar) | 30 dk | — |
| 7.11 | Performance test (Turbopack) | 15 dk | — |
| 7.12 | Final commit + merge to main | 15 dk | — |

---

## Faz 8: Altyapı (1 oturum)

| # | Görev | Süre | Risk |
|---|-------|------|------|
| 8.1 | Dockerfile.dashboard: node:20 → node:22 | 5 dk | 🟡 |
| 8.2 | cloudbuild.yaml: node:20-slim → node:22-slim | 5 dk | 🟡 |
| 8.3 | docker-compose.yml: postgres:16 → postgres:17 | 5 dk | 🟢 |
| 8.4 | Build test + commit + push | 15 dk | — |
| 8.5 | Cloud Build deploy kontrol | 15 dk | — |

---

## Kontrol Listesi (Her Faz Sonrası)

- [ ] `npm run build` başarılı mı?
- [ ] `cargo check --workspace` başarılı mı? (Rust değişikliklerinde)
- [ ] Local `npm run dev` çalışıyor mu?
- [ ] Tarayıcıda görsel test yapıldı mı?
- [ ] Git commit yapıldı mı?
- [ ] Cloud Build deploy başarılı mı?
- [ ] API health check OK mu?
- [ ] Dashboard erişilebilir mi?

---

## Rollback Planı

Her faz için ayrı branch oluştur. Sorun çıkarsa:

```bash
# Branch'ten çık
git checkout main

# Branch'i sil (gerekirse)
git branch -D upgrade/major-updates

# Eski haline dön
git pull origin main
```

Cloud Build otomatik olarak main branch'teki son başarılı commit'i yeniden deploy edecek.

---

## Acil Durum

Eğer production deploy bozulursa:

1. **Panik yapma** — Cloud Build son başarılı image'ı kullanır
2. **Rollback:** `git revert HEAD && git push origin main`
3. **Manuel rollback:** GCP Console → Cloud Run → Revisions → eski revision'a trafik gönder
4. **Neon DB:** Etkilenmez (sadece local docker PostgreSQL)

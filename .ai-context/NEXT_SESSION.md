# NEXT_SESSION.md — Sonraki Oturum Rehberi

> **Son güncelleme:** 2026-05-12 02:41 GMT+8
> **Son commit:** `71d2fee9` (main)
> **Son oturum:** AŞAMA 1 Kritik Güvenlik (19/22 tamamlandı)

## Hemen Başla

1. `git pull origin main` — en son değişiklikleri al
2. Bu dosyayı oku — kaldığın yeri öğren
3. `IMPLEMENTATION-PLAN.md` — tam plan için bak

## Bir Sonraki Görev: AŞAMA 2 — YÜKSEK GÜVENLİK & ASYNC

### 2.1 Async Rust Yüksek (#23-26)
- [ ] `reqwest::Client` per-request → shared client yap (`api/src/`, `worker/src/`)
- [ ] Blocking file I/O in async → `tokio::task::spawn_blocking` (`worker/src/`)
- [ ] Unbounded mpsc channel in WebSocket → bounded channel (`api/src/ws/`)
- [ ] Poisoned mutex panics → `try_lock` veya graceful handling (`api/src/`)

### 2.2 Crypto & Auth Yüksek (#27-30)
- [ ] Argon2id parametreleri OWASP altı → m=19456, t=2, p=1 kontrol et (`api/src/auth/jwt.rs`)
- [ ] Admin authorization client-side only → backend admin check ekle (`admin/layout.tsx`)
- [ ] Playground token localStorage'da → httpOnly cookie (`playground/page.tsx`)
- [ ] Playground token URL path'te → query param veya header (`playground/page.tsx`)

### 2.3 Rate Limiting Yüksek (#31-32)
- [ ] API-level rate limit middleware gap → tüm endpoint'leri kapsa
- [ ] Bazı endpoint'ler atlanıyor → middleware chain kontrol

### 2.4 Worker Yüksek (#33-37)
- [ ] Zombie reaper increments attempt count without delivery
- [ ] No retry for DB commit failures
- [ ] Email delivery uses blocking I/O in async
- [ ] Email delivery creates new HTTP client per call
- [ ] Fan-out bug — target config not used

### 2.5 Infrastructure Yüksek (#38-42)
- [ ] No rollback strategy
- [ ] Hardcoded secrets in Helm values.yaml
- [ ] Git history'de OTEL credentials (BFG ile temizle)
- [ ] DATABASE_URL local credentials git history'de
- [ ] DNS rebinding SSRF

### 2.6 Destructive Actions (#43-44)
- [ ] Destructive action'larda confirmation yok
- [ ] No i18n in API Importer

## AŞAMA 1'de Kalanlar (3 madde)
- [ ] #11: `password_hash` column NOT NULL yap
- [ ] #12: Missing migration files (13 SQL)
- [ ] #13: Hardcoded DB credentials temizle

## Kritik Hatırlatmalar
- **GitHub PAT:** `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` (Servet rotate edecek)
- **Oturum süresi:** 1 saat — işleri batch'le, sık commit yap
- **Push etmeyi unutma!** Her oturum sonunda `git push origin main`
- **İlerleme kaydı:** `.ai-context/logs/YYYY-MM-DD-session.md` dosyasını güncelle

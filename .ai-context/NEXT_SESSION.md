# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-11 00:52 GMT+8

---

## ✅ Oturum 95 Tamamlandı (2026-05-11 00:00 - 00:52)

### Bağımlılık Güncellemeleri
- sqlx 0.7→0.8 ✅
- redis 0.25→1.2 ✅
- rand 0.8→0.10 ✅
- npm update (react, next, next-intl, @types/node) ✅
- Dashboard build fix (vitest.config tsconfig exclude) ✅

### Güvenlik Düzeltmeleri (9 agent paralel)
- HS-001/002/003: Auth rate limiting (verify_email, verify_2fa, refresh_token) ✅
- HS-008: Contact form rate limit ✅
- HS-013: CSP hardening (unsafe-inline/eval kaldırıldı) ✅
- HS-014: Polar ID'ler env var yapıldı ✅
- HS-067: PayStack→PayFlow isim değişikliği ✅
- HS-004/005/009: Zaten düzeltilmiş ✅

### SDK İyileştirmeleri
- HS-081: Retry logic eklendi (Node, Python, Go) ✅
- HS-077: Stale branch temizliği ✅
- HS-082: SDK version sync — sdks-fix agent çalışıyor (kendi push'unu yapar)

### Toplam Commit (Oturum 95)
```
cb3ed64 chore(deps): upgrade sqlx 0.7→0.8, redis 0.25→1.2, rand 0.8→0.10
c6ded13 docs: update memory for session 95
761247f fix(dashboard): exclude test files from Next.js build type-check
62377b7 docs: update memory timestamps for session 95
56a2f2b fix(security): add rate limiting to auth and contact endpoints
d7c59a8 fix(security): harden CSP headers and add HSTS
22a3656 fix(legal): rename PayStack to avoid real company conflict
9db4fae fix(security): replace hardcoded secrets with placeholders
4247192 docs: update issue tracker — HS-067/014 status
0906273 chore: clean stale dependabot branches (HS-077)
3156ec4 feat(sdks): add client-side retry logic to Node, Python, Go (HS-081)
```

---

## 🟡 Sıradaki Oturum: #96 — İLK SIRA BUNLAR

### 1. Kalan SDK Düzeltmeleri (sdks-fix agent'dan kalabilir)
| ID | Sorun | Durum |
|----|-------|-------|
| HS-082 | Kotlin/Java version mismatch | ⏳ Agent çalışıyor olabilir |
| HS-038 | CLI HOOKRELAY→HOOKSNIFF env vars | ⏳ Agent çalışıyor olabilir |
| HS-083 | OpenAPI schema vs actual API mismatch | ⬜ |

### 2. iyzico Entegrasyonu (HS-084) — TÜRKİYE İÇİN KRİTİK
- iyzico fatura handler yok
- Servet'in iyzico hesabı açılacak (vergi levhası + banka hesabı)
- Hesap açıldıktan sonra handler implementasyonu yapılacak

### 3. i18n (HS-065) — EN BÜYÜK İŞ
- 920+ hardcoded İngilizce string
- Dashboard sayfaları Türkçe/Almanca/Japonca gösterilmiyor
- Parçalanması gerekiyor: sayfa sayfa veya component component

### 4. Test Coverage (HS-085-089)
| ID | Modül | Satır |
|----|-------|-------|
| HS-085 | db.rs | 1,029 |
| HS-086 | delivery/mod.rs | 404 |
| HS-087 | worker/main.rs | 807 |
| HS-088 | AuthGuard component | — |
| HS-089 | SSO page | — |

### 5. Dependabot Major PR'ları
- TypeScript 5→6 (major)
- Tailwind 3→4 (major)
- Recharts 2→3 (major)
- Next.js 15→16 (major)
- Her biri tek tek denenmeli

### 6. OpenAPI Schema Mismatch (HS-083)
- SDK'ler ile OpenAPI spec arasında uyumsuzluk
- Dokümantasyon güncellenmeli

### 7. Git History Secret Temizliği (HS-014 devam)
- Grafana token rotate (operasyonel — Servet yapacak)
- BFG ile git history temizliği (opsiyonel)

---

## 📊 İlerleme

| Kategori | Toplam | Tamamlanan | Kalan |
|----------|--------|-----------|-------|
| 🚨 P0 | 14 | 13 | 1 |
| 🔴 P1 | 44 | 46 | 0 |
| 🟡 P2 | 38 | 25 | 13 |
| 🟢 P3 | 13 | 3 | 10 |
| **TOPLAM** | **103** | **87** | **16** |

---

## 🔧 Zorunlu Kurallar (Her Oturum)

### Kurulum Kontrolü
```bash
source "$HOME/.cargo/env" && rustc --version && cargo --version
node --version && npm --version
```

### Her Değişiklik Sonrası Zorunlu
1. `cargo check`
2. `cargo test -p hooksniff-api --lib && cargo test -p hooksniff-worker`
3. `cd dashboard && npm run lint && npx tsc --noEmit`
4. `git push`

### Erteleme YASAK
- "Daha sonra yaparız" → ❌ Hemen yap
- "Riskli dokunmayalım" → ❌ Araştır, test et, yap
- "Büyük iş" → ❌ Parçala, başla

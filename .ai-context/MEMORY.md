# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-10 22:53 GMT+8

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

## 📊 Güncel İlerleme (2026-05-10 22:53)

| Kategori | Toplam | Tamamlanan | Kalan |
|----------|--------|-----------|-------|
| 🚨 P0 | 14 | 13 | 1 |
| 🔴 P1 | 44 | 46 (+9 yanlış/notlu) | 0 |
| 🟡 P2 | 38 | 21 | 17 |
| 🟢 P3 | 13 | 1 | 12 |
| **TOPLAM** | **103** | **81** | **22** |

## Oturum 91 (2026-05-10 22:08 - 22:23) ✅
- HS-019: WebSocket max_connections=1000
- HS-020: Circuit breaker worker'a entegre
- HS-021: Billing webhook idempotency (Stripe/Polar/iyzico)
- 9 dosya, 4 commit
- Compile ✅ Test 20/20 ✅ 31/31 ✅

## Oturum 92 (2026-05-10 22:32 - 22:40) ✅
- HS-022: Throttle state in-memory (documented)
- HS-023: FIFO modülü worker'a entegre
- worker/src/fifo.rs oluşturuldu
- 2 dosya, 1 commit
- Compile ✅ Test 1030/1030 ✅

## Oturum 93 (2026-05-10 22:37 - 22:53) ✅
- HS-047: blog/[slug] 1922→308 satır (data.ts)
- HS-067: Müşteri hikayeleri disclaimer eklendi
- HS-068: Türkçe çeviri düzeltmeleri
- HS-080: ESLint 8→9 migration (flat config)
- HS-077: 6 stale branch silindi
- HS-079: Conventional commits standardı
- npm install çalıştırıldı, lint ✅
- 8 dosya, 5 commit
- Compile ✅ Test 1030/1030 ✅ Lint ✅

## Ertelemeye Devam Edenler
- HS-078: Dependabot PR'lar (major bump, tek tek test gerekir)
- HS-065: 920+ hardcoded string (büyük iş)
- HS-081-089: SDK/test coverage (P3)

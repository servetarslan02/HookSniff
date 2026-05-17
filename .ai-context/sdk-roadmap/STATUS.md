# SDK Durum Tablosu

> Son güncelleme: 2026-05-17 23:55 GMT+8

## Genel Bakış

| # | SDK | Dil | Yöntem | Versiyon | Kalite | Durum |
|---|-----|-----|--------|----------|--------|-------|
| 1 | **Node.js** | TypeScript | Svix'ten adapte | 0.5.0 | %70-75 | ✅ Tamamlandı |
| 2 | **Python** | Python | Svix SDK doğrudan | 1.0.0 | %80 | ✅ Tamamlandı |
| 3 | **Go** | Go | Svix SDK doğrudan | 1.0.0 | %80 | ✅ Tamamlandı |
| 4 | Rust | Rust | Svix'ten adapte | — | — | ⬜ Sıradaki |
| 5-11 | 7 SDK | Çeşitli | Svix'ten adapte | — | — | ⬜ Beklemede |

## Adaptasyon Yöntemi
1. Svix SDK'yı kopyala
2. `svix` → `hooksniff` yeniden adlandır (bulk find-replace)
3. API base URL'ini değiştir
4. Svix-specific features kaldır (autoconfig, streaming, ingest, connectors)
5. Syntax-check yap
6. GitHub'a push et

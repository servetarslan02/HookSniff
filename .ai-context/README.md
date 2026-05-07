# .ai-context — AI Session Memory

Bu klasör AI助手 tarafından oturum bilgilerini korumak için kullanılır.
Tüm dosyalar GitHub'da saklanır — workspace silinse bile korunur.

## Yeni Oturumda İlk Okunacak

1. **`ONBOARDING.md`** — Genel rehber, proje yapısı, kurallar
2. **`EXTERNAL_TOKENS.md`** — Tüm API token'ları
3. **`MEMORY.md`** — Proje durumu, servisler
4. **`NEXT_SESSION.md`** — Öncelikli yapılacaklar

## Tüm Dosyalar

| Dosya | Amaç |
|-------|------|
| `ONBOARDING.md` | Yeni oturum rehberi (burası) |
| `EXTERNAL_TOKENS.md` | Tüm API token ve secret'lar |
| `MEMORY.md` | Proje durumu, credential referansı |
| `NEXT_SESSION.md` | Sonraki oturum yapılacaklar |
| `YYYY-MM-DD.md` | Günlük detaylı log |

## Hafıza Akışı

```
Oturum başı:
  git pull → ONBOARDING.md oku → EXTERNAL_TOKENS.md oku → devam et

Oturum sırasında:
  Değişiklik yap → MEMORY.md/SESSION_NOTES.md güncelle

Her 8 dk:
  Cron job → otomatik commit + push (hafıza dosyaları)
```

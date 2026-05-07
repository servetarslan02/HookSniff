# NEXT_SESSION.md — Sonraki Oturum

> 2026-05-08 06:45

## MVP Tamamlandı! 🎉

13/13 madde tamamlandı. Artık v1.1'e geçebiliriz.

## Yeni Oturumda Ne Söyle

Şunu de:

> "MVP bitti, v1.1'e geçiyoruz. TODO.md'deki v1.1 maddelerine bak: Embeddable Customer Portal, CLI Tool, Inbound Webhook Proxy, Webhook Transformations. Hangisinden başlayalım?"

## v1.1 Öncelik Sırası (Öneri)
1. **CLI Tool** — `cli/index.js` kısmen hazır, bitir
2. **Embeddable Customer Portal** — `portal/embed.js` var ama başlanmamış
3. **Webhook Transformations** — payload dönüştürme (map, filter, enrich)
4. **Inbound Webhook Proxy** — en büyük rekabet avantajı ama en zor

## Kullanıcı Yapacak (Bloklar)
- Render Docker build düzelt
- Resend domain doğrulama
- Domain kararı (eu.org vs .com)
- iyzico hesap aç

## Dosya Referansları
- CLI: `cli/index.js`
- Portal: `portal/embed.js`
- Transformations: `api/src/transform/`
- TODO: `TODO.md` (root)
- MVP: `MVP.md` (root, tamamlandı)

## Hatırlatmalar
- Hafıza dosyaları `.ai-context/` klasöründe
- Her oturum başında `git pull origin main`
- Her önemli değişiklikten sonra `git push origin main`

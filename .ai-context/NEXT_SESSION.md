# NEXT_SESSION.md — Sıradaki İşler

> 2026-05-08 06:00

## Hemen Kontrol Et
1. API sağlık: `curl -s https://hooksniff-api-sdjufmaqka-ew.a.run.app/v1/health`
2. Dashboard: https://hooksniff.vercel.app açılıyor mu
3. Neon DB bağlantısı çalışıyor mu

## Acil Yapılacaklar
1. Domain kararı ver — eu.org (ücretsiz, 1-2 gün onay) mi .com ($12/yıl) mi?
2. Resend domain doğrulama — domain gelince DNS'e TXT + MX ekle
3. iyzico hesabı aç — Türk müşteriler için ödeme
4. Grafana OTEL test et — monitoring çalışıyorsa dashboard'a ekle

## Ürün Yapılacaklar
Detaylı liste: `TODO.md` (root, 27 madde)

Öncelik sırası:
1. UI'sı eksik backend'leri tamamla (playground, delivery details, retry policy, signature rotation, rate limit)
2. Free tier limitini 1,000 → 10,000'e artır
3. Standard Webhooks header'larını ekle
4. Embeddable portal'ı bitir
5. Test coverage yaz

## Domain Planı (Tekrar)
- eu.org: https://nic.eu.org/arf/en/ → `hooksniff.eu.org` başvur, NS: Cloudflare
- .com: Cloudflare Registrar → `hooksniff.com` ($12/yıl)
- Domain gelince: Cloudflare DNS → Cloud Run custom domain → Resend doğrulama

## SDK Publish Planı (İleride)
- npm'de `@hooksniff` scope'unu reserve et (başkası almasın)
- PyPI'de `hooksniff` adını reserve et
- crates.io'da `hooksniff` adını reserve et

# 2026-05-17 — Vercel Build Fix (package-lock sync)

## Sorun
Vercel build hatası — `npm ci` başarısız:
```
npm error `npm ci` can only install packages when your package.json and package-lock.json
or npm-shrinkwrap.json are in sync.
Missing: webpack@5.106.2 from lock file
Missing: @testing-library/dom@10.4.1 from lock file
... (50+ missing packages)
```

## Kök Neden
`dashboard/package.json`'a yeni bağımlılıklar eklenmiş ama `npm install` çalıştırılmadığı için
`dashboard/package-lock.json` güncellenmemiş. `npm ci` (clean install) lock dosyası ile
`package.json` birebir eşleşmesini gerektirir.

## Çözüm
`dashboard/` dizininde `npm install` çalıştırılarak lock dosyası yenilendi.
782 satır ekleme, 18 satır silme → 729 paket eklendi.

**Değişen dosya:** `dashboard/package-lock.json`

## Not
Bu tür sorunlar `package.json` elle düzenlenip `npm install` çalıştırılmadan push edildiğinde oluşur.
**Kural:** package.json değişirse → her zaman `npm install` çalıştır → lock dosyasını da commit et.

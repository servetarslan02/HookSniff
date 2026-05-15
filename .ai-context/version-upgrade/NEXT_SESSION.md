# Next Session — Version Upgrade

> Son güncelleme: 2026-05-16 06:30 GMT+8

---

## Hemen Yap

1. `SISTEM-RAPORU.md` oku — ne var ne yok
2. `UYGULAMA-PLANI.md` oku — 23 faz, 201 madde
3. `HAFIZA.md` oku — önceki oturumda ne yapıldı
4. Kaldığın yerden devat et

## Nereden Başla?

`UYGULAMA-PLANI.md`'deki tik atılmamış ilk faz'dan başla.

Şu anki durum: **Faz 1 — Hazırlık** (hiçbir şey yapılmadı)

```
- [ ] Git branch oluştur: `upgrade/system-updates`
- [ ] Mevcut durumu test et: `cargo check --workspace && cd dashboard && npm run build`
- [ ] Neon DB backup al
```

## Sıralama (ÖNEMLİ!)

Sırayla git, atlama:

1. Faz 1: Hazırlık
2. Faz 2: Minor/Patch
3. Faz 3: TypeScript 6
4. Faz 4: ESLint 10
5. Faz 5: recharts 3
6. Faz 6: Tailwind 4
7. Faz 7: Next.js 16
8. Faz 8-23: Geri kalanı

Her fazdan sonra:
- `npm run build` veya `cargo check` çalıştır
- Test et
- Commit + push
- Sonraki faza geç

## Kurallar

- Tek seferde tüm güncellelemeleri yapma
- Her adımda test et
- Emin değilsen sor
- `UYGULAMA-PLANI.md`'deki tikleri güncelle `[ ]` → `[x]`
- `HAFIZA.md`'yi güncelle (ne yapıldı, ne kaldı)
- Oturum sonunda push et

## Hesap Bilgileri

- Admin: servetarslan02@gmail.com / Alayci_165
- Dashboard: https://hooksniff.vercel.app
- API: https://hooksniff-api-1046140057667.europe-west1.run.app
- Repo: https://github.com/servetarslan02/HookSniff

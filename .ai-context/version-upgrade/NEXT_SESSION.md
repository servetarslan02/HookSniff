# Next Session — Version Upgrade

> Son güncelleme: 2026-05-17 03:56 GMT+8

---

## Hemen Yap

1. `HAFIZA.md` oku — önceki oturumda ne yapıldı
2. `UYGULAMA-PLANI.md` oku — tik atılmış yerleri kontrol et
3. Kaldığın yerden devam et

## Nereden Başla?

**Branch:** `upgrade/system-updates` (zaten var, 9 commit pushed)

Sıradaki fazlar (npm install gerektirir, Servet onayı ile):

```
- [ ] Faz 2 Dashboard: npm update (dikkatli ol, memory limiti var)
- [ ] Faz 3: TypeScript 6
- [ ] Faz 4: ESLint 10
- [ ] Faz 5: recharts 3
- [ ] Faz 6: Tailwind 4
- [ ] Faz 7: Next.js 16
```

**ÖNEMLİ:** npm install/çalıştırma Servet'in uyarısı — memory limiti yüzünden çöküyor. CI'da yapılmalı veya dikkatli olunmalı.

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

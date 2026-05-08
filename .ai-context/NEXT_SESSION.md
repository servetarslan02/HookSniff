# NEXT_SESSION.md — Sonraki Oturum

> Son güncelleme: 2026-05-08 16:56 GMT+8

## Yeni Oturumda Ne Söyle

HookSniff projesi Cloud Run'da çalışıyor. API healthy. Şimdi kalite ve temizlik zamanı.

---

## Öncelik 1: CI/CD Temizliği

### Unused Code Temizliği
~152 unused warning var. İki seçenek:
- **Hızlı**: Her crate'in `lib.rs` veya `main.rs`'ine `#![allow(dead_code, unused_imports, unused_variables)]` ekle
- **Temiz**: Gerçekten kullanılmayan kodları sil

### Formatting Diff Azaltma
- `dashboard/package-lock.json` büyük diff'ler oluşturuyor
- Çözüm: `npm install` sonrası lockfile'ı commit et, sonra `.gitattributes` ile binary marker ekle
- VEYA: lockfile'ı gitignore'a ekle (tavsiye edilmez, reproducible build için gerekli)

## Öncelik 2: Servet'in Yapması Gereken

1. **GitHub token yenile** — eski token mesajda açık paylaşıldı
2. **Polar.sh yeni token** — ödeme sistemi için
3. **Domain kararı** — eu.org veya .com
4. **Resend domain doğrulama**
5. **iyzico hesap**

## Öncelik 3: Feature Eksikleri

- Dashboard'da gerçek veri gösterimi (API'ye bağla)
- WebSocket real-time delivery
- Billing entegrasyonu (Polar.sh + iyzico)
- Email bildirimleri (Resend)
- R2 bucket oluştur + storage entegrasyonu
- Grafana monitoring kurulumu

---

## Teknik Notlar

### Cloud Run
- API: `europe-west1`, 2GB RAM, 1 CPU
- Worker: `europe-west1`, 1GB RAM, 1 CPU
- Secret Manager'da 10 secret var

### Veritabanı
- Neon PostgreSQL, eu-central-1
- Migration'lar: `api/migrations/` klasöründe

### GitHub Actions
- CI: fmt + clippy + test (hepsi continue-on-error)
- Deploy: Cloud Run'a Docker image push
- `GCP_SA_KEY` secret'ı ayarlı

---

## Hafıza Kuralları
Her oturum sonunda:
1. `.ai-context/MEMORY.md` güncelle
2. `.ai-context/NEXT_SESSION.md` güncelle
3. `STATUS.md` güncelle
4. `git add -A && git commit && git push origin main`
5. **Gereksiz dosyaları commit etme** — sadece proje dosyaları

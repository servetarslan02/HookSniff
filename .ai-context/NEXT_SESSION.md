# NEXT_SESSION.md — Yeni Oturum Rehberi

> Son güncelleme: 2026-05-09 01:27 GMT+8

---

## ⚠️ KRİTİK KURAL: REPO AYRIMI

| İş Türü | Repo | Branch |
|---------|------|--------|
| Hata düzeltme, fix, refactor | `servetarslan02/HookSniff` (orijinal) | main |
| Yeni web özellikleri | `servetarslan02/hooksniff-lab` (lab) | feature/... |
| Mobil uygulama | `servetarslan02/hooksniff-mobile` | main |
| Market research, plan, notlar | `.ai-context/` klasörü (her iki repo'da) | main |

---

## ⚠️ CI POLİTİKASI (Servet Kararı — 2026-05-09)

**GitHub Actions kullanılmAYACAK.** Yerine local CI:

### Local CI Komutları
```bash
source "$HOME/.cargo/env"
cargo fmt --check
cargo clippy -- -D warnings
cargo test
cargo build --release
cd dashboard && npm install && npm run build
```

### PR Merge İşlemi
1. Local CI çalıştır → hepsi geçsin
2. Format düzeltmesi varsa: `cargo fmt` → GitHub API ile push
3. GitHub API ile squash merge (admin override)
4. main-protection ruleset: CI check yok, sadece PR zorunlu

### Neden?
- GitHub Actions dakika limiti (private repo, 2000 dk/ay)
- Hesapta $12 ödenmemiş fatura
- Local CI ücretsiz ve daha hızlı

---

## 🚀 Yeni Oturuma Başlarken

### 1. Adım: Hafıza Dosyalarını Oku
```bash
# .ai-context/ klasöründen GitHub API ile çek
MEMORY.md ve NEXT_SESSION.md oku
```

### 2. Adım: Gerekirse Projeyi Klonla
```bash
cd /root/.openclaw/workspace
git clone https://github.com/servetarslan02/HookSniff.git
cd HookSniff
```

### 3. Adım: Rust Kur (eğer yoksa)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
```

---

## 📌 Proje Bilgileri

| Bilgi | Değer |
|-------|-------|
| **Repo** | https://github.com/servetarslan02/HookSniff |
| **Dashboard** | https://hooksniff.vercel.app |
| **API** | https://hooksniff-api-1046140057667.europe-west1.run.app |
| **Worker** | https://hooksniff-worker-1046140057667.europe-west1.run.app |

---

## ⏳ BEKLEYEN İŞLER

### Servet'in görevleri:
- **iyzico hesap** — vergi levhası + banka hesabı
- **GitHub billing** — $12 fatura (opsiyonel)

### Deploy Sonrası Eklenecek Env Var'lar
- `EMAIL_BASE_URL` — `https://hooksniff.vercel.app`
- `FCM_SERVER_KEY` — Firebase Cloud Messaging server key

### Teknik Borç
- sqlx 0.7.4 → 0.8 upgrade
- 107 eski domain referansı
- console.log kalıntıları

---

## ✅ SON TAMAMLANAN İŞLER (Oturum 15)

1. PR #31 merge edildi (5 backend feature)
2. Local CI ile doğrulandı (29/29 test)
3. CI politikası değişti (GitHub Actions → local CI)
4. main-protection ruleset güncellendi

---

## 🔄 Hafıza Kuralları

Her oturum sonunda:
1. `.ai-context/MEMORY.md` güncelle
2. `.ai-context/NEXT_SESSION.md` güncelle
3. GitHub API ile push et

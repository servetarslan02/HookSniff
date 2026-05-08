# NEXT_SESSION.md — Yeni Oturum Rehberi

> Son güncelleme: 2026-05-08 23:25 GMT+8

---

## ⚠️ KRİTİK KURAL: REPO AYRIMI

| İş Türü | Repo | Branch |
|---------|------|--------|
| Hata düzeltme, fix, refactor | `servetarslan02/HookSniff` (orijinal) | main |
| Yeni web özellikleri | `servetarslan02/hooksniff-lab` (lab) | feature/... |
| **AI Agent katmanı** | `servetarslan02/HookSniff` | `ai-agent-layer` |
| Mobil uygulama | `servetarslan02/hooksniff-mobile` | main |

---

## 🤖 AI AGENT KATMANI — DURUM

### Tamamlanan (Oturum 14 — 2026-05-08 23:25)
- ✅ Katman 1: DB Migration (030_ai_agents.sql)
  - agents, agent_events, agent_routes, agent_rate_limits tablolari
- ✅ Katman 2: API Routes
  - Agent CRUD: create, list, get, update, delete
  - Event API: emit, list events
  - Routing: create, list, delete routes
  - Rate limit: get, update per agent
  - Auth: X-Agent-Key header + Argon2id
- ✅ Dashboard sayfalari
  - Agent listesi (/dashboard/agents)
  - Agent detay (/dashboard/agents/[id])
  - Sidebar'da AI Agents linki
- ✅ 18/18 test gecti, Clippy temiz
- ✅ GitHub'a push edildi: `ai-agent-layer` branch

### Sıradaki (Bir sonraki oturum)
- ⏳ Katman 3: Dashboard gelistirme
  - Agent monitoring sayfasi
  - Routing gorsel editor
  - Event timeline
- ⏳ Katman 4: Guvenlik + Monitoring
  - Agent davranis profili
  - Anomaly detection
  - Audit log
- ⏳ Deploy: Cloud Run'a deploy

### Branch
```
git checkout ai-agent-layer
```

---

## 🚀 Yeni Oturuma Başlarken

### 1. Adım: Projeyi Klonla
```bash
cd /root/.openclaw/workspace
git clone https://x-access-token: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@github.com/servetarslan02/HookSniff.git
cd HookSniff
git checkout ai-agent-layer
```

### 2. Adım: Rust Kur (eğer yoksa)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
```

### 3. Adım: Hafıza Dosyalarını Oku
```bash
cat .ai-context/MEMORY.md
cat .ai-context/NEXT_SESSION.md
```

---

## 📌 Proje Bilgileri

| Bilgi | Değer |
|-------|-------|
| **Repo** | https://github.com/servetarslan02/HookSniff |
| **GitHub Token** | `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` |
| **Dashboard** | https://hooksniff.vercel.app |
| **API** | https://hooksniff-api-1046140057667.europe-west1.run.app |
| **Worker** | https://hooksniff-worker-1046140057667.europe-west1.run.app |
| **Region** | europe-west1 (GCP Cloud Run) |
| **DB** | Neon PostgreSQL (eu-central-1) |
| **Cache** | Upstash Redis (64MB) |
| **Storage** | Cloudflare R2 (hooksniff-storage) |
| **AI Agent Branch** | `ai-agent-layer` |

---

## ❌ KALAN SORUNLAR

### CI Hataları (ana repo — main branch)
- Clippy lints failure
- Run tests failure
- Dashboard build failure
- Rust dependency audit failure

### Servet'in görevleri:
- **iyzico hesap** — vergi levhası + banka hesabı

### Eksik Backend (Mobil için)
1. Push notification (FCM/APNs)
2. Şifre sıfırlama API'si
3. Email doğrulama API'si
4. Refresh token
5. 2FA

---

## 🔄 Hafıza Kuralları

Her oturum sonunda:
1. `.ai-context/MEMORY.md` güncelle
2. `.ai-context/NEXT_SESSION.md` güncelle
3. `git add -A && git commit && git push origin ai-agent-layer`

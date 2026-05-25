# 📋 Sonraki Oturum Rehberi — Cold Start

> **Son güncelleme:** 2026-05-26

## 🚀 Hızlı Başlangıç

```bash
cd /root/.openclaw/workspace/HookSniff && git pull origin main
cat .ai-context/cold-start-optimizasyonu/NEXT_SESSION.md
cat .ai-context/cold-start-optimizasyonu/UYGULAMA-PLANI.md
```

## 📍 Sıradaki Adım: FAZ 1 — Minimum Instance

| # | Adım | Dosya | Açıklama |
|---|------|-------|----------|
| 1 | cloudbuild.yaml | `cloudbuild.yaml` | minScale: "1" ekle |
| 2 | Cloud Run deploy | CLI | --min-instances 1 |
| 3 | Test | — | Cold start süresi ölçülebilir değil |

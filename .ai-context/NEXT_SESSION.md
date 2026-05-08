# NEXT_SESSION.md — Yeni Oturum Rehberi

> Son güncelleme: 2026-05-09 00:03 GMT+8

---

## ⚠️ KRİTİK KURAL

**%100 kusursuz çalışacak. Yarım yamalak iş yok.**

Her özellik tek tek tamamlanacak:
1. Yaz → Test et → Hataları düzelt → Tekrar test et → Onayla
2. Sonraki özelliğe geç
3. Hiçbir şey "yarım" kalmayacak

---

## 🚀 Yeni Oturuma Başlarken

### 1. Adım: Oku
```bash
cat .ai-context/AI_AGENT_STATUS.md    # Durum raporu (NE YAPILACAK)
cat .ai-context/AI_AGENT_README.md    # Kullanım kilavuzu
cat .ai-context/AI_AGENT_TEST.md      # Test senaryoları
```

### 2. Adım: Başla
Aşama 1'den başla: **Agent CRUD'ı tamamla**

### 3. Adım: Sıra
1. Agent CRUD → TAMAMLA → test et
2. Event sistemi → TAMAMLA → test et
3. Dashboard → TAMAMLA → test et
4. SDK'lar → TAMAMLA → test et
5. Performans → TAMAMLA → test et
6. Deploy → TAMAMLA → test et

---

## 📌 Bilgiler

| Bilgi | Değer |
|-------|-------|
| **Repo** | https://github.com/servetarslan02/HookSniff |
| **Branch** | `ai-agent-layer` |
| **GitHub Token** | `[TOKEN_GITHUBDA_SAKLANIYOR]` |

---

## 🔄 Hafıza Kuralları

Her oturum sonunda:
1. `.ai-context/AI_AGENT_STATUS.md` güncelle (yapılan + yapılacak)
2. `.ai-context/MEMORY.md` güncelle
3. `git add -A && git commit && git push origin ai-agent-layer`

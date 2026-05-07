# HEARTBEAT.md

## Her Heartbeat'te Yapılacaklar

### 1. GitHub'dan Pull (EN ÖNEMLİ)
Oturum başında hafıza dosyalarının güncel olduğundan emin ol:
```bash
cd /root/.openclaw/workspace && git pull origin main --rebase 2>&1
```

### 2. Hafıza Dosyalarını Güncelle
Önemli bir konuşma veya iş sonrası bu dosyaları güncelle:
- MEMORY.md — genel hafıza
- CONTEXT.md — proje bağlamı
- TODO.md — yapılacaklar
- SESSION_NOTES.md — oturum notları

### 3. GitHub'a Push
Değişiklik varsa push et:
```bash
cd /root/.openclaw/workspace && git add MEMORY.md CONTEXT.md TODO.md SESSION_NOTES.md && git commit -m "memory: otomatik güncelleme $(date +%Y-%m-%d_%H:%M)" && git push origin main
```

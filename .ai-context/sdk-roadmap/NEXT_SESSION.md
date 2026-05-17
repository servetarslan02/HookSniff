# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-18 03:48 GMT+8
> Bu dosya GitHub'da kalıcıdır. Her oturum başı okunur, oturum sonunda güncellenir.

## 🎯 Sıradaki: Kotlin SDK Publish

10/11 SDK v1.0.0 olarak yayınlandı. Sadece **Kotlin** kaldı.

### Hızlı Başlangıç:
```bash
git pull origin main
cat .ai-context/sdk-roadmap/MEMORY.md
```

### Kotlin Publish Adımları:
1. `cd sdks/kotlin`
2. Svix-specific dosyaları sil (connector configs, polling, streaming)
3. API dosyalarını temizle (Authentication, Endpoint, Statistics, Message, HookSniff)
4. `./gradlew build -x test` — build et
5. Publish et:
   ```bash
   export JAVA_HOME=/opt/jdk-17.0.12
   GPG_KEY=$(gpg --export-secret-keys --armor 5F815C019784733D)
   ./gradlew publishToSonatype closeAndReleaseSonatypeStagingRepository \
     -PNEXUS_USERNAME=f0wXBf \
     -PNEXUS_PASSWORD='EYLV763IsQVseaffdOXNScf2HZlcLDGEK' \
     -PsigningKey="$GPG_KEY" \
     -PsigningPassword=""
   ```
6. Ayrı repoya push et: `hooksniff-kotlin`
7. Ana repoya push et
8. Bu dosyayı güncelle

### Sonra:
- Test coverage artırma (tüm SDK'lar)
- Faz 8-15 yeni özellikler

## 📊 Mevcut Durum

- 10/11 SDK: v1.0.0, yayında
- 1 SDK (Kotlin): v1.0.0, kod hazır ama publish edilmedi
- Tüm SDK'lar ayrı repolarda
- GPG key keyserver'da mevcut
- Sonatype credentials çalışıyor

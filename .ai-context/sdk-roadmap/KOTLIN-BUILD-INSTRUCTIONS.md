# Kotlin SDK — Build & Publish Talimatları

> Son güncelleme: 2026-05-18 04:00 GMT+8

## ⚠️ Ön Koşul

Bu sunucuda Java kurulu değil. Build işlemi Java gerektirir.

### Java Kurulumu (eğer yoksa)
```bash
# Ubuntu/Debian
sudo apt install openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

## Build Adımları

```bash
cd sdks/kotlin
./gradlew build -x test
```

## Publish Adımları

```bash
cd sdks/kotlin

# GPG key export
GPG_KEY=$(gpg --export-secret-keys --armor [REDACTED])

# Publish to Maven Central (Sonatype)
./gradlew publishToSonatype closeAndReleaseSonatypeStagingRepository \
  -PNEXUS_USERNAME=[REDACTED] \
  -PNEXUS_PASSWORD='[REDACTED]' \
  -PsigningKey="$GPG_KEY" \
  -PsigningPassword=""
```

## Ayrı Repoya Push

```bash
# hooksniff-kotlin reposuna push et
git remote add kotlin https://github.com/servetarslan02/hooksniff-kotlin.git
git push kotlin main
```

## Yapılan Düzeltmeler (2026-05-18)

1. **gradle.properties** — Oluşturuldu (Maven Central publish config)
2. **Authentication.kt** — Package düzeltmesi (`com.hooksniff` → `com.hooksniff.kotlin`)
3. **Endpoint.kt** — Svix-specific metodlar kaldırıldı (bulkReplay, recover, replayMissing, getStats, transformation*)
4. **Message.kt** — Svix-specific kod kaldırıldı (MessagePoller, expungeAllContents, precheck, ApplicationIn)
5. **MessageIn.kt** — `application` field kaldırıldı (Svix-specific)
6. **HookSniffHttpClient.kt** — Orijinal haline döndürüldü (suspend inline reified)
7. **WebhookTest.kt** — Hatalı class adı düzeltildi (WebhookVerificationError → WebhookVerificationException)
8. **README.md** — Güncellendi

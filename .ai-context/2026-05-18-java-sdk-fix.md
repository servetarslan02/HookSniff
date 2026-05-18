# 2026-05-18 — Java SDK Kapsamlı Düzeltme

## Yapılan Düzeltmeler (14 dosya, +317/-1056 satır)

### 🔴 Kritik Düzeltmeler
1. **String `==` bug'ı** — `HookSniffHttpClient.java`'da `method.toUpperCase() == "POST"` referans karşılaştırmasıydı, `.equals()` ile değiştirildi. Auto-idempotency key özelliği tamamen çalışmıyordu.
2. **Null body POST/PUT/PATCH** — POST, PUT, PATCH isteklerinde body null ise boş JSON object (`{}`) gönderiliyor artık.
3. **Testler tamamen yeniden yazıldı** — Eski testler var olmayan sınıfları referans alıyordu (`com.hooksniff.webhooks.Webhook`, `HookSniffException.fromStatusCode()`, vb.). JUnit 4 ile uyumlu yeni testler yazıldı.

### 🟠 Ciddi Düzeltmeler
4. **Default API URL** — `https://api.hooksniff.com` → `https://hooksniff-api-1046140057667.europe-west1.run.app`
5. **HookSniff ana sınıf** — 14 resource için eksik getter metotları eklendi (authentication, endpoint, eventType, health, message, messageAttempt, statistics, environment, backgroundTask, operationalWebhook, messagePoller, inbound, connector)
6. **Authentication** — `appPortalAccess()` ve `expireAll()` metotları eklendi
7. **Statistics** — `aggregateAppStats()` ve `getAppEndpointStats()` metotları eklendi
8. **MessagePoller** — API'ye uygun şekilde yeniden yazıldı (`poll`, `seek`, `commit`)
9. **Endpoint** — `recover()`, `replayMissing()`, `bulkReplay()`, `getStats()` metotları eklendi

### 🟡 Kalite Düzeltmeleri
10. **Retry jitter** — Exponential backoff'a jitter eklendi
11. **Bozuk test dosyaları silindi** — `lib/src/test/com/` dizinindeki 5 bozuk test dosyası kaldırıldı
12. **wiremock bağımlılığı kaldırıldı** — Kullanılmayan wiremock-jre8 build.gradle'dan çıkarıldı

## Dosyalar
- `HookSniffHttpClient.java` — string fix, null body fix, jitter
- `HookSniffOptions.java` — default URL fix
- `HookSniff.java` — 14 getter metodu eklendi
- `Authentication.java` — appPortalAccess, expireAll eklendi
- `Statistics.java` — aggregateAppStats, getAppEndpointStats eklendi
- `MessagePoller.java` — API'ye uygun yeniden yazım
- `Endpoint.java` — recover, replayMissing, bulkReplay, getStats eklendi
- `HookSniffTest.java` — tamamen yeniden yazıldı
- `build.gradle` — JUnit fix, wiremock kaldırıldı

## Sonatype Publish
- Central Portal upload başarılı: Deployment ID `cd03e7b5-dc17-44a2-9601-210afae246b6` (AUTOMATIC)
- Upload credential'ları: f0wXBf / EYLV763IsQVseaffdOXNScf2HZlcLDGEK
- Publish script eklendi: `publish.sh`
- GPG key pair oluşturuldu (server'da, no passphrase)
- deploy.gradle güncellendi (env-based credentials)

## Commit
- `f3a3eb4` — `fix(java-sdk): critical bugs and missing features`
- `a734246` — `fix: test compilation error - HookSniffOptions is final`
- `d29d0df` — `chore: add publish script and env-based credentials`

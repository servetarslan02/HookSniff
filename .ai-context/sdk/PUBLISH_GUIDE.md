# SDK Publish Rehberi — Kalan 5 SDK

> Son güncelleme: 2026-05-09 06:25 GMT+8
> Oturum: 26

---

## Genel Durum

| SDK | Versiyon | Platform | Durum | Publish Yöntemi |
|-----|----------|----------|-------|-----------------|
| Node.js | 0.1.0 | npm | ✅ Yayında | `npm publish` |
| Python | 0.1.0 | PyPI | ✅ Yayında | `twine upload` |
| Rust | 0.2.0 | crates.io | ✅ Yayında | `cargo publish` |
| C# | 0.1.0 | NuGet | ✅ Yayında | `dotnet nuget push` |
| Go | v0.1.0 | pkg.go.dev | ✅ Tag atıldı | `git tag` |
| Swift | v0.1.0 | Swift Package Index | ✅ Tag atıldı | `git tag` |
| **Java** | 0.1.0 | Maven Central | ⏳ | Maven + GPG |
| **Kotlin** | 0.2.0 | Maven Central | ⏳ | Gradle + GPG |
| **Ruby** | 0.1.0 | RubyGems | ⏳ | `gem push` |
| **PHP** | 0.1.0 | Packagist | ⏳ | GitHub submit |
| **Elixir** | 0.2.0 | Hex.pm | ⏳ | `mix hex.publish` |

---

## 1. Java — Maven Central

### Ön Koşullar
- [x] GPG key hazır: `7306B334`
- [x] Sonatype OSSRH hesabı var
- [x] `pom.xml` doğru yapılandırılmış
- [ ] Maven kurulu olmalı
- [ ] `~/.m2/settings.xml` dosyası olmalı

### settings.xml Oluştur
```xml
<!-- ~/.m2/settings.xml -->
<settings>
  <servers>
    <server>
      <id>ossrh</id>
      <username>OSSRH_USERNAME</username>
      <password>OSSRH_PASSWORD</password>
    </server>
  </servers>
  <profiles>
    <profile>
      <id>ossrh</id>
      <activation>
        <activeByDefault>true</activeByDefault>
      </activation>
      <properties>
        <gpg.executable>gpg</gpg.executable>
        <gpg.passphrase>GPG_PASSPHRASE</gpg.passphrase>
      </properties>
    </profile>
  </profiles>
</settings>
```

### Publish Komutları
```bash
cd sdks/java

# 1. GPG key'i import et (eğer farklı makinede)
gpg --import secret-key.asc

# 2. Compile + test
mvn clean compile test

# 3. Source + Javadoc jar oluştur
mvn source:jar javadoc:jar

# 4. GPG ile imzala
mvn gpg:sign

# 5. Deploy (staging)
mvn deploy

# 6. Sonatype UI'dan release et
# https://s01.oss.sonatype.org → Staging Repositories → hooksniff-sdk → Close → Release
```

### Alternatif: central-publishing-maven-plugin ile
```bash
cd sdks/java
mvn clean deploy -P release
```
Bu otomatik olarak imzalar, upload eder ve release eder.

---

## 2. Kotlin — Maven Central

### Ön Koşullar
- [x] GPG key hazır: `7306B334`
- [x] Sonatype OSSRH hesabı var
- [x] `build.gradle.kts` doğru yapılandırılmış
- [ ] Gradle kurulu olmalı (veya Gradle wrapper eklenmeli)
- [ ] `~/.gradle/gradle.properties` dosyası olmalı

### Gradle Wrapper Ekle (opsiyonel ama önerilir)
```bash
cd sdks/kotlin
gradle wrapper --gradle-version 8.5
```
Bu `gradlew` ve `gradle/wrapper/` klasörü oluşturur. Sonraki oturumda `./gradlew` kullanılabilir.

### gradle.properties Oluştur
```properties
# ~/.gradle/gradle.properties
ossrhUsername=OSSRH_USERNAME
ossrhPassword=OSSRH_PASSWORD
signing.keyId=7306B334
signing.password=GPG_PASSPHRASE
signing.secretKeyRingFile=/path/to/secring.gpg
```

### Publish Komutları
```bash
cd sdks/kotlin

# 1. Compile + test
./gradlew build

# 2. Publish to Maven Central
./gradlew publishAllPublicationsToOssrhRepository
```

### Gradle Wrapper Olmadan (Gradle kurulu ise)
```bash
cd sdks/kotlin
gradle build
gradle publishAllPublicationsToOssrhRepository
```

---

## 3. Ruby — RubyGems

### Ön Koşullar
- [ ] Ruby kurulu olmalı (>= 2.7)
- [ ] RubyGems hesabı olmalı
- [ ] `gem signin` ile giriş yapılmış olmalı

### Publish Komutları
```bash
cd sdks/ruby

# 1. Ruby kur (eğer yoksa)
# macOS: brew install ruby
# Ubuntu: sudo apt install ruby ruby-dev
# Windows: https://rubyinstaller.org

# 2. RubyGems'e giriş
gem signin
# Email: support@hooksniff.dev
# Password: RubyGems şifre

# 3. Gem'i build et
gem build hooksniff.gemspec
# hooksniff-0.1.0.gem oluşacak

# 4. Publish et
gem push hooksniff-0.1.0.gem

# 5. Doğrula
gem info hooksniff
```

### Sorun Giderme
- **OpenSSL hatası**: `brew install openssl` veya `sudo apt install libssl-dev`
- **Certificate hatası**: `export SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt`
- **Yetki hatası**: RubyGems'te `hooksniff` gem adı başkasına ait olabilir, farklı isim düşün

---

## 4. PHP — Packagist

### Ön Koşullar
- [x] `composer.json` doğru yapılandırılmış
- [ ] Packagist hesabı olmalı
- [ ] GitHub repo public olmalı

### Publish Komutları
```bash
# 1. Packagist'e git: https://packagist.org/packages/submit

# 2. Repo URL'sini gir:
#    https://github.com/servetarslan02/HookSniff

# 3. Packagist otomatik olarak sdks/php/composer.json'i okur

# 4. "Check" butonuna tıkla → paket adı: hooksniff/hooksniff-php

# 5. "Submit" butonuna tıkla

# 6. GitHub webhook otomatik kurulur (sonraki push'larda otomatik güncellenir)
```

### Manuel Publish (eğer otomatik olmazsa)
```bash
# composer.json'da version field'ı güncelle
# Her push'ta Packagist otomatik güncellenir

# Manuel tetikleme:
# Packagist → Package → "Update" butonu
```

### Not
- Packagist'te paket adı: `hooksniff/hooksniff-php`
- Kullanım: `composer require hooksniff/hooksniff-php`
- GitHub repo public olmalı (Packagist public repo ister)

---

## 5. Elixir — Hex.pm

### Ön Koşullar
- [ ] Elixir kurulu olmalı (>= 1.14)
- [ ] Hex.pm hesabı olmalı
- [ ] `mix hex.auth` ile giriş yapılmış olmalı

### Publish Komutları
```bash
cd sdks/elixir

# 1. Elixir kur (eğer yoksa)
# macOS: brew install elixir
# Ubuntu: sudo apt install elixir
# Windows: https://elixir-lang.org/install.html

# 2. Hex.pm'e giriş
mix hex.auth
# Email: support@hooksniff.dev
# Password: Hex.pm şifre

# 3. Dependencies yükle
mix deps.get

# 4. Compile
mix compile

# 5. Publish et
mix hex.publish

# 6. Onayla (y/n sorusu)
# Y

# 7. Doğrula
mix hex.info hooksniff
```

### Sorun Giderme
- **hex not found**: `mix local.hex --force`
- **deps hatası**: `mix deps.clean --all && mix deps.get`
- **version hatası**: `mix.exs` dosyasındaki `@version` değerini kontrol et

---

## Hızlı Özet (Servet İçin)

### Bilgisayarında Olması Gerekenler
1. **Java SDK**: Java + Maven + GPG key
2. **Kotlin SDK**: Java + Gradle + GPG key
3. **Ruby SDK**: Ruby + RubyGems hesabı
4. **PHP SDK**: Sadece Packagist'e submit (browser)
5. **Elixir SDK**: Elixir + Hex.pm hesabı

### Sıra
1. **PHP** — En kolay, sadece Packagist'e submit
2. **Ruby** — `gem push` tek komut
3. **Elixir** — `mix hex.publish` tek komut
4. **Java** — Maven + GPG + Sonatype staging
5. **Kotlin** — Gradle + GPG + Sonatype staging

### Hesap Gereksinimleri
| Platform | Hesap | URL |
|----------|-------|-----|
| Maven Central | Sonatype OSSRH | https://s01.oss.sonatype.org |
| RubyGems | RubyGems | https://rubygems.org/sign_up |
| Packagist | Packagist | https://packagist.org/register |
| Hex.pm | Hex.pm | https://hex.pm/signup |

---

## Otomatik Publish Script (Gelecekte)

Her SDK için GitHub Actions workflow'u oluşturulabilir:
- `.github/workflows/publish-java.yml`
- `.github/workflows/publish-kotlin.yml`
- `.github/workflows/publish-ruby.yml`
- `.github/workflows/publish-php.yml` (Packagist webhook)
- `.github/workflows/publish-elixir.yml`

**Not**: Servet GitHub Actions CI kullanılmayacağını belirtti (billing sorunu). Bu yüzden local publish tercih edildi.

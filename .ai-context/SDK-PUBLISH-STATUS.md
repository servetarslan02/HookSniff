# 📦 SDK Publish Durumu — 2026-05-11 19:00

## Yayınlananlar ✅ (5/11)
| SDK | Versiyon | Registry |
|-----|----------|----------|
| Node.js | 0.3.0 | npm → hooksniff-sdk |
| Python | 0.3.0 | PyPI → hooksniff |
| Rust | 0.3.0 | crates.io → hooksniff |
| Go | v0.3.0 | git tag atıldı |
| Swift | v0.3.0 | git tag atıldı |

## Kalan ⏳ (6/11)
| SDK | Sorun | Sonraki Adım |
|-----|-------|-------------|
| Java | Sonatype validation fail → javadoc/sources JAR gerekli | mvn -DskipTests (javadoc ekle) |
| Kotlin | Java ile aynı | Java çözülünce otomatik |
| PHP | Packagist webhook | packagist.org'da repo bağla |
| Ruby | Servet'in PC'sinde Ruby kur | rubyinstaller.org |
| C# | Servet'in PC'sinde .NET | publish-sdks.ps1 çalıştır |
| Elixir | Servet'in PC'sinde Elixir kur | elixir-lang.org |

## Java Maven Central — Yapılan
- pom.xml: okhttp3, javax.annotation, gson-fire, jackson, jsr305 eklendi ✅
- GPG key oluşturuldu (E1AD09DC951D1FC23917FE3A0ABE364998532534) ✅
- Bundle upload başarılı ama validation fail ❌
- Çözüm: javadoc.skip=false + sources JAR ekle

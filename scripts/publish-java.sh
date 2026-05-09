#!/usr/bin/env bash
# Java SDK — Maven Central Publish
# Kullanım: chmod +x scripts/publish-java.sh && ./scripts/publish-java.sh
#
# Ön koşullar:
#   1. Maven kurulu: brew install maven (macOS) veya apt install maven (Linux)
#   2. GPG key import edilmiş: gpg --import secret-key.asc
#   3. ~/.m2/settings.xml doğru yapılandırılmış (aşağıya bakın)
#
# ~/.m2/settings.xml içeriği:
# <settings>
#   <servers>
#     <server>
#       <id>ossrh</id>
#       <username>OSSRH_USERNAME</username>
#       <password>OSSRH_PASSWORD</password>
#     </server>
#   </servers>
#   <profiles>
#     <profile>
#       <id>ossrh</id>
#       <activation><activeByDefault>true</activeByDefault></activation>
#       <properties>
#         <gpg.executable>gpg</gpg.executable>
#         <gpg.passphrase>GPG_PASSPHRASE</gpg.passphrase>
#       </properties>
#     </profile>
#   </profiles>
# </settings>

set -euo pipefail

cd "$(dirname "$0")/../sdks/java"

echo "🧹 Clean + Compile..."
mvn clean compile

echo "🧪 Test..."
mvn test

echo "📦 Source + Javadoc jar..."
mvn source:jar javadoc:jar

echo "🔐 GPG sign..."
mvn gpg:sign

echo "📤 Deploy to Maven Central (staging)..."
mvn deploy

echo ""
echo "✅ Java SDK deployed to staging!"
echo "🔗 https://central.sonatype.com → Staging Repositories → Release"
echo ""
echo "⚠️  Sonatype UI'dan staging repository'yi release etmen lazım!"

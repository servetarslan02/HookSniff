.PHONY: help local stop restart reset fix status logs logs-api logs-worker logs-db clean build deploy-build deploy-test deploy-push

# Default target
help: ## Show this help
	@echo "🪝 HookSniff — Komutlar"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ── Ana Komutlar ──

local: ## Her şeyi localde başlat
	@echo "🚀 HookSniff başlatılıyor..."
	docker compose up -d --build
	@echo ""
	@echo "✅ Başlatılıyor! İlk açılış 5-10 dakika sürebilir."
	@echo ""
	@echo "   Dashboard: http://localhost:3001"
	@echo "   API:       http://localhost:3000/health"
	@echo ""
	@echo "   Loglar:    make logs"

stop: ## Tüm servisleri durdur
	docker compose down
	@echo "⏹️  Durduruldu"

# ── SDK Testler ──

test: ## Tüm SDK testlerini çalıştır
	@bash run-tests.sh all

test-go: ## Go SDK testleri
	@bash run-tests.sh go

test-rust: ## Rust SDK testleri
	@bash run-tests.sh rust

test-node: ## Node.js SDK testleri
	@bash run-tests.sh node

test-python: ## Python SDK testleri
	@bash run-tests.sh python

restart: ## Yeniden başlat
	docker compose restart
	@echo "🔄 Yeniden başlatıldı"

reset: ## Sıfırla (veritabanı dahil)
	@echo "⚠️  Tüm veriler silinecek! 5 saniye içinde Ctrl+C ile iptal edebilirsin."
	@sleep 5
	docker compose down -v
	docker compose up -d --build
	@echo "🧹 Sıfırlandı ve yeniden başlatıldı"

fix: ## Sorunları otomatik çöz
	@echo "🔧 Sorun çözücü çalışıyor..."
	@echo ""
	@echo "1/4 Servisler durduruluyor..."
	@docker compose down 2>/dev/null || true
	@echo "2/4 Cache temizleniyor..."
	@docker system prune -f 2>/dev/null || true
	@echo "3/4 Servisler başlatılıyor..."
	@docker compose up -d --build
	@echo "4/4 Sağlık kontrolü..."
	@sleep 10
	@docker compose ps
	@echo ""
	@echo "✅ Tamamlandı! http://localhost:3001 adresini kontrol et"

status: ## Ne durumda göster
	@echo "🪝 HookSniff Durum"
	@echo ""
	@docker compose ps 2>/dev/null || echo "❌ Servisler çalışmıyor. 'make local' ile başlat."
	@echo ""
	@echo "Dashboard: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001 2>/dev/null || echo 'kapalı')"
	@echo "API:       $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health 2>/dev/null || echo 'kapalı')"

# ── Loglar ──

logs: ## Tüm log'ları göster
	docker compose logs -f

logs-api: ## API log'ları
	docker compose logs -f api

logs-worker: ## Worker log'ları
	docker compose logs -f worker

logs-db: ## Veritabanı log'ları
	docker compose logs -f postgres

# ── Build ──

build: ## Docker image'larını build et (dev)
	docker compose build

clean: ## Her şeyi temizle
	docker compose down -v --rmi all
	@echo "🧹 Her şey temizlendi"

# ── Utilities ──

generate-secret: ## Rastgele secret oluştur
	@openssl rand -hex 32

generate-api-key: ## Örnek API key oluştur
	@echo "hr_live_$(openssl rand -hex 16)"

db-shell: ## PostgreSQL kabuğu aç
	docker compose exec postgres psql -U hooksniff -d hooksniff

# ═══════════════════════════════════════════════════════════════════
# Self-Host — Tek komutla kendi sunucunuzda çalıştırın
# ═══════════════════════════════════════════════════════════════════

self-host: ## Tek komutla self-host kurulum
	@echo "🪝 HookSniff Self-Host Kurulumu"
	@echo ""
	@echo "1/5 Ortam değişkenleri kontrol ediliyor..."
	@if [ ! -f .env ]; then \
		echo "   ⚠️  .env dosyası yok, .env.example'dan oluşturuluyor..."; \
		cp .env.example .env; \
		echo "   📝 .env dosyasını düzenleyin: nano .env"; \
	fi
	@echo "2/5 Docker image'lar build ediliyor..."
	@docker compose build --quiet 2>/dev/null || docker compose build
	@echo "3/5 Servisler başlatılıyor..."
	@docker compose up -d
	@echo "4/5 Sağlık kontrolü bekleniyor (20 saniye)..."
	@sleep 20
	@echo "5/5 Durum kontrolü..."
	@docker compose ps
	@echo ""
	@echo "✅ HookSniff Self-Host Hazır!"
	@echo ""
	@echo "   Dashboard: http://localhost:3001"
	@echo "   API:       http://localhost:3000/health"
	@echo ""
	@echo "   İlk kullanıcı: POST http://localhost:3000/v1/auth/register"
	@echo "   Loglar:        make logs"
	@echo "   Durdur:        make stop"

self-host-status: ## Self-host durumunu göster
	@echo "🪝 HookSniff Self-Host Durum"
	@echo ""
	@docker compose ps 2>/dev/null || echo "❌ Servisler çalışmıyor. 'make self-host' ile başlat."
	@echo ""
	@echo "Dashboard: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001 2>/dev/null || echo 'kapalı')"
	@echo "API:       $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health 2>/dev/null || echo 'kapalı')"
	@echo ""
	@echo "Veritabanı:"
	@docker compose exec -T postgres psql -U hooksniff -d hooksniff -c "SELECT COUNT(*) as customers FROM customers;" 2>/dev/null || echo "  Bağlanılamadı"
	@docker compose exec -T postgres psql -U hooksniff -d hooksniff -c "SELECT COUNT(*) as endpoints FROM endpoints;" 2>/dev/null || true
	@docker compose exec -T postgres psql -U hooksniff -d hooksniff -c "SELECT COUNT(*) as deliveries FROM deliveries;" 2>/dev/null || true

self-host-backup: ## Veritabanını yedekle
	@echo "📦 Veritabanı yedekleniyor..."
	@mkdir -p backups
	@docker compose exec -T postgres pg_dump -U hooksniff -d hooksniff > backups/hooksniff_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Yedeklendi: backups/hooksniff_$$(date +%Y%m%d_%H%M%S).sql"

self-host-update: ## Self-host güncellemesi (git pull + rebuild)
	@echo "🔄 Güncelleniyor..."
	@git pull origin main
	@docker compose build --quiet
	@docker compose up -d
	@echo "✅ Güncellendi ve yeniden başlatıldı"

# ── Coverage ──

coverage: ## Test coverage report (cargo-tarpaulin)
	@bash scripts/coverage.sh --html
	@echo ""
	@echo "📊 Coverage report: coverage/tarpaulin-report.html"

# ── Benchmarks ──

bench: ## API benchmark'lerini çalıştır
	@PATH="$$HOME/.cargo/bin:$$PATH" bash scripts/benchmark.sh all

bench-report: ## Benchmark HTML raporu oluştur
	@PATH="$$HOME/.cargo/bin:$$PATH" bash scripts/benchmark.sh report
	@echo ""
	@echo "📊 Rapor: api/target/criterion/report/index.html"

# ═══════════════════════════════════════════════════════════════════
# Deployment Komutları (Production)
# ═══════════════════════════════════════════════════════════════════

deploy-build: ## Production image'ları build et (ARM64)
	@echo "🔨 Production image'lar build ediliyor..."
	docker build -f deploy/Dockerfile.api.prod -t hooksniff-api:latest .
	docker build -f deploy/Dockerfile.worker.prod -t hooksniff-worker:latest .
	@echo ""
	@echo "✅ Build tamamlandı!"
	@echo "   hooksniff-api:latest    $$(docker images hooksniff-api:latest --format '{{.Size}}')"
	@echo "   hooksniff-worker:latest $$(docker images hooksniff-worker:latest --format '{{.Size}}')"

deploy-test: ## Production build'i localde test et
	@echo "🧪 Production build test ediliyor..."
	@echo ""
	@if [ ! -f deploy/env.production.example ]; then \
		echo "❌ deploy/env.production.example bulunamadı!"; \
		exit 1; \
	fi
	@if [ ! -f .env ]; then \
		echo "⚠️  .env dosyası yok, production env example'dan oluşturuluyor..."; \
		cp deploy/env.production.example .env; \
	fi
	@echo "📦 Image'lar build ediliyor..."
	docker build -f deploy/Dockerfile.api.prod -t hooksniff-api:test .
	docker build -f deploy/Dockerfile.worker.prod -t hooksniff-worker:test .
	@echo ""
	@echo "🚀 Servisler başlatılıyor (docker-compose.prod.yml)..."
	docker compose -f deploy/docker-compose.prod.yml up -d
	@echo ""
	@echo "⏳ Sağlık kontrolü bekleniyor (15 saniye)..."
	@sleep 15
	@echo ""
	@echo "📊 Servis durumları:"
	@docker compose -f deploy/docker-compose.prod.yml ps
	@echo ""
	@echo "💚 API sağlık kontrolü:"
	@curl -sf http://localhost:3000/health 2>/dev/null && echo " ✅" || echo " ❌ Başarısız"
	@echo ""
	@echo "📝 Loglar: docker compose -f deploy/docker-compose.prod.yml logs -f"
	@echo "⏹️  Durdur: docker compose -f deploy/docker-compose.prod.yml down"

deploy-push: ## Image'ları registry'ye push et
	@echo "📤 Image'lar push ediliyor..."
	@if [ -z "$(REGISTRY)" ]; then \
		echo "❌ REGISTRY değişkeni tanımlı değil!"; \
		echo "   Kullanım: make deploy-push REGISTRY=ghcr.io/your-org"; \
		exit 1; \
	fi
	@echo "Tag: $(REGISTRY)/hooksniff-api:latest"
	docker tag hooksniff-api:latest $(REGISTRY)/hooksniff-api:latest
	docker tag hooksniff-worker:latest $(REGISTRY)/hooksniff-worker:latest
	docker push $(REGISTRY)/hooksniff-api:latest
	docker push $(REGISTRY)/hooksniff-worker:latest
	@echo "✅ Push tamamlandı!"

deploy-compose: ## Production compose ile başlat (local test)
	@echo "🚀 Production compose başlatılıyor..."
	docker compose -f deploy/docker-compose.prod.yml up -d --build
	@echo "✅ Başlatıldı! Loglar: docker compose -f deploy/docker-compose.prod.yml logs -f"

deploy-stop: ## Production compose durdur
	docker compose -f deploy/docker-compose.prod.yml down
	@echo "⏹️  Production servisleri durduruldu."

# ── Local CI/CD (GitHub Actions yerine) ──

ci: ## Local CI — tümünü çalıştır (lint + test + build + security)
	@bash local-ci.sh all

ci-test: ## SDK testlerini çalıştır
	@bash local-sdk-test.sh all

ci-publish: ## SDK publish dry-run
	@bash local-sdk-publish.sh dry-run all

ci-publish-live: ## SDK publish — gerçekten yükle (TOKEN'lar gerekli)
	@bash local-sdk-publish.sh publish $(SDK)

ci-security: ## Güvenlik taraması
	@bash local-ci.sh security

# ── OpenAPI Codegen ──

codegen: ## Tüm SDK'lar için type/model üret
	python3 openapi-codegen.py all

codegen-validate: ## OpenAPI spec doğrula
	python3 openapi-codegen.py validate

codegen-node: ## Node.js types üret
	python3 openapi-codegen.py node

codegen-python: ## Python models üret
	python3 openapi-codegen.py python

codegen-go: ## Go structs üret
	python3 openapi-codegen.py go

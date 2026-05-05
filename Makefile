.PHONY: help local stop restart reset fix status logs logs-api logs-db clean build

# Default target
help: ## Show this help
	@echo "🪝 HookRelay — Komutlar"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ── Ana Komutlar ──

local: ## Her şeyi localde başlat (3 servis: PostgreSQL + API + Dashboard)
	@echo "🚀 HookRelay local ortam başlatılıyor..."
	docker compose -f docker-compose.local.yml up -d --build
	@echo ""
	@echo "✅ Başlatılıyor! İlk açılış 5-10 dakika sürebilir."
	@echo ""
	@echo "   Dashboard: http://localhost:3001"
	@echo "   API:       http://localhost:3000/health"
	@echo ""
	@echo "   Loglar:    make logs"

stop: ## Tüm servisleri durdur
	docker compose -f docker-compose.local.yml down
	@echo "⏹️  Durduruldu"

restart: ## Yeniden başlat
	docker compose -f docker-compose.local.yml restart
	@echo "🔄 Yeniden başlatıldı"

reset: ## Sıfırla (veritabanı dahil, her şey silinir)
	@echo "⚠️  Tüm veriler silinecek! 5 saniye içinde Ctrl+C ile iptal edebilirsin."
	@sleep 5
	docker compose -f docker-compose.local.yml down -v
	docker compose -f docker-compose.local.yml up -d --build
	@echo "🧹 Sıfırlandı ve yeniden başlatıldı"

fix: ## Sorunları otomatik çöz
	@echo "🔧 Sorun çözücü çalışıyor..."
	@echo ""
	@echo "1/4 Servisler durduruluyor..."
	@docker compose -f docker-compose.local.yml down 2>/dev/null || true
	@echo "2/4 Cache temizleniyor..."
	@docker system prune -f 2>/dev/null || true
	@echo "3/4 Servisler başlatılıyor..."
	@docker compose -f docker-compose.local.yml up -d --build
	@echo "4/4 Sağlık kontrolü..."
	@sleep 10
	@docker compose -f docker-compose.local.yml ps
	@echo ""
	@echo "✅ Tamamlandı! http://localhost:3001 adresini kontrol et"

status: ## Ne durumda göster
	@echo "🪝 HookRelay Durum"
	@echo ""
	@docker compose -f docker-compose.local.yml ps 2>/dev/null || echo "❌ Servisler çalışmıyor. 'make local' ile başlat."
	@echo ""
	@echo "Dashboard: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001 2>/dev/null || echo 'kapalı')"
	@echo "API:       $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health 2>/dev/null || echo 'kapalı')"

# ── Loglar ──

logs: ## Tüm log'ları göster
	docker compose -f docker-compose.local.yml logs -f

logs-api: ## API log'ları
	docker compose -f docker-compose.local.yml logs -f api

logs-db: ## Veritabanı log'ları
	docker compose -f docker-compose.local.yml logs -f postgres

# ── Build ──

build: ## Docker image'larını build et
	docker compose -f docker-compose.local.yml build

clean: ## Her şeyi temizle (image'lar dahil)
	docker compose -f docker-compose.local.yml down -v --rmi all
	@echo "🧹 Her şey temizlendi"

# ── Eski Komutlar (Full Stack) ──

dev: ## Full stack başlat (Kafka + Temporal dahil)
	@echo "⚠️  Bu komut Kafka ve Temporal gerektirir. 'make local' daha basit."
	docker compose up -d --build

prod: ## Production modu
	docker compose -f docker-compose.prod.yml up -d --build

# ── Utilities ──

generate-secret: ## Rastgele secret oluştur
	@openssl rand -hex 32

generate-api-key: ## Örnek API key oluştur
	@echo "hr_live_$(openssl rand -hex 16)"

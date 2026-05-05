.PHONY: help local stop restart reset fix status logs logs-api logs-worker logs-db clean build

# Default target
help: ## Show this help
	@echo "🪝 HookRelay — Komutlar"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ── Ana Komutlar ──

local: ## Her şeyi localde başlat
	@echo "🚀 HookRelay başlatılıyor..."
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
	@echo "🪝 HookRelay Durum"
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

build: ## Docker image'larını build et
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
	docker compose exec postgres psql -U hookrelay -d hookrelay

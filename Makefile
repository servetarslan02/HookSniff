.PHONY: help infra api worker dashboard dev stop clean logs test

# Default target
help: ## Show this help
	@echo "🪝 HookRelay — Development Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Quick start: make dev"

# ── Full Stack ──

dev: ## Start everything (API + Worker + Dashboard + Infra)
	@echo "🚀 Starting HookRelay..."
	docker compose up -d
	@echo ""
	@echo "✅ HookRelay is starting up!"
	@echo "   API:       http://localhost:3000"
	@echo "   Dashboard: http://localhost:3001"
	@echo "   Temporal:  http://localhost:8081"
	@echo ""
	@echo "   Run 'make logs' to see output"

stop: ## Stop all services
	docker compose down

clean: ## Stop and remove all data
	docker compose down -v
	@echo "🧹 All data removed"

restart: ## Restart all services
	docker compose restart

logs: ## Show logs (all services)
	docker compose logs -f

logs-api: ## Show API logs
	docker compose logs -f api

logs-worker: ## Show Worker logs
	docker compose logs -f worker

logs-dashboard: ## Show Dashboard logs
	docker compose logs -f dashboard

# ── Infrastructure Only ──

infra: ## Start only infrastructure (DB + Queue + Temporal)
	docker compose up -d cockroachdb redpanda temporal temporal-ui create-topics
	@echo "✅ Infrastructure started"

# ── Individual Services (for development) ──

api: ## Run API locally (requires infra)
	cd api && cargo run

worker: ## Run Worker locally (requires infra)
	cd worker && cargo run

dashboard: ## Run Dashboard locally
	cd dashboard && npm run dev

# ── Build ──

build: ## Build all Docker images
	docker compose build

build-api: ## Build API image
	docker compose build api

build-dashboard: ## Build Dashboard image
	docker compose build dashboard

# ── Database ──

db-shell: ## Open CockroachDB shell
	docker compose exec cockroachdb cockroach sql --insecure

db-migrate: ## Run database migrations
	@echo "Running migrations..."
	@for f in migrations/*.sql; do \
		echo "  → $$f"; \
		docker compose exec -T cockroachdb cockroach sql --insecure -d hookrelay < $$f 2>/dev/null || true; \
	done
	@echo "✅ Migrations complete"

# ── Testing ──

test: ## Run all tests
	cd api && cargo test

test-integration: ## Run integration tests
	cd api && cargo test --test integration

# ── Status ──

status: ## Check service status
	@echo "🪝 HookRelay Status"
	@echo ""
	@echo "API:"
	@curl -s http://localhost:3000/health 2>/dev/null && echo " ✅ Running" || echo " ❌ Not running"
	@echo ""
	@echo "Dashboard:"
	@curl -s http://localhost:3001 2>/dev/null > /dev/null && echo " ✅ Running" || echo " ❌ Not running"
	@echo ""
	@echo "Database:"
	@docker compose exec -T cockroachdb cockroach node status --insecure --host=cockroachdb 2>/dev/null | head -2 || echo " ❌ Not running"
	@echo ""
	@echo "Queue:"
	@docker compose exec -T redpanda rpk cluster health --api-urls=localhost:9644 2>/dev/null | head -2 || echo " ❌ Not running"

# ── Production ──

prod: ## Start in production mode
	docker compose -f docker-compose.yml up -d --build
	@echo "🚀 Production mode started"

# ── Utilities ──

generate-secret: ## Generate a random secret
	@openssl rand -hex 32

generate-api-key: ## Generate a sample API key
	@echo "hr_live_$(openssl rand -hex 16)"

.PHONY: help setup infra api worker dashboard clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Initial setup: copy env, create DB
	cp -n .env.example .env 2>/dev/null || true
	@echo "✅ Environment file ready"

infra: ## Start infrastructure (CockroachDB, Kafka, Temporal)
	docker-compose up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@echo "✅ Infrastructure running"
	@echo "   CockroachDB:  localhost:26257"
	@echo "   Redpanda:     localhost:9092"
	@echo "   Temporal:     localhost:7233"
	@echo "   Temporal UI:  http://localhost:8081"
	@echo "   Cockroach UI: http://localhost:8080"

api: ## Run API server
	cd api && cargo run

worker: ## Run worker
	cd worker && cargo run

dashboard: ## Run dashboard
	cd dashboard && npm run dev

infra-down: ## Stop infrastructure
	docker-compose down

infra-logs: ## Show infrastructure logs
	docker-compose logs -f

clean: ## Clean build artifacts
	cargo clean
	cd dashboard && rm -rf .next node_modules

build: ## Build all Rust binaries
	cargo build --release

test: ## Run tests
	cargo test

create-api-key: ## Create a test API key (requires running infra)
	@docker exec -it hookrelay-cockroachdb-1 cockroach sql --insecure -d hookrelay -e "INSERT INTO customers (email, api_key_hash, api_key_prefix, plan) VALUES ('test@example.com', 'hash', 'hr_live_test', 'free') RETURNING id;"

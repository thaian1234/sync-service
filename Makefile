.PHONY: help setup start stop restart logs clean test debezium health dev-start test-start prod-start

# Environment defaults to dev
ENV ?= dev
COMPOSE_FILES = -f compose.base.yaml -f compose.$(ENV).yaml
ENV_FILE = --env-file .env.$(ENV)

help:
	@echo "╔════════════════════════════════════════════════════════╗"
	@echo "║     Product Sync System - Command Reference           ║"
	@echo "║          Using Kafka KRaft Mode (No Zookeeper)        ║"
	@echo "╚════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🌍 Environment Commands:"
	@echo "  make dev-start   - Start development environment (all services)"
	@echo "  make test-start  - Start test/staging environment"
	@echo "  make prod-start  - Start production environment (Kafka KRaft only)"
	@echo "  make dev-stop    - Stop development environment"
	@echo "  make test-stop   - Stop test/staging environment"
	@echo "  make prod-stop   - Stop production environment"
	@echo ""
	@echo "📦 Setup & Deployment:"
	@echo "  make setup       - Build all Docker images (default: dev)"
	@echo "  make start       - Start services (default: dev, use ENV=prod for others)"
	@echo "  make debezium    - Deploy Debezium CDC connector"
	@echo "  make health      - Check all services health"
	@echo ""
	@echo "🔧 Operations:"
	@echo "  make stop        - Stop all services (default: dev)"
	@echo "  make restart     - Restart all services (default: dev)"
	@echo "  make clean       - Clean up everything (including volumes)"
	@echo ""
	@echo "📊 Monitoring:"
	@echo "  make logs        - View all logs"
	@echo "  make logs-core   - View Core service logs"
	@echo "  make logs-cms    - View CMS service logs"
	@echo "  make logs-kafka  - View Kafka logs"
	@echo "  make status      - Check services status"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test        - Run integration tests"
	@echo "  make test-api    - Run API tests"
	@echo ""
	@echo "🌐 URLs (Development):"
	@echo "  Core:    http://localhost:3000"
	@echo "  CMS:     http://localhost:3002"
	@echo "  Swagger: http://localhost:3002/api-docs"
	@echo "  Kafka UI: http://localhost:8080"
	@echo ""
	@echo "💡 Examples:"
	@echo "  make ENV=dev start    - Start development"
	@echo "  make ENV=prod start   - Start production"
	@echo "  make ENV=test logs    - View test environment logs"

setup:
	@echo "🔧 Building Docker images for $(ENV) environment..."
	docker compose $(ENV_FILE) $(COMPOSE_FILES) build --no-cache
	@echo "✅ Build complete!"

start:
	@echo "🚀 Starting $(ENV) environment services..."
	docker compose $(ENV_FILE) $(COMPOSE_FILES) up -d
	@echo "⏳ Waiting for services to be ready (20s)..."
	@sleep 20
	@make health
	@echo ""
	@echo "✅ All services started!"
	@echo ""
	@echo "📊 Service URLs:"
	@echo "   Core API:      http://localhost:3000"
	@echo "   CMS API:       http://localhost:3002"
	@echo "   Swagger Docs:  http://localhost:3002/api-docs"
	@echo "   Kafka UI:      http://localhost:8080"
	@echo ""
	@echo "⚡ Next steps:"
	@echo "   1. Run: make debezium   (Deploy CDC connector)"

# Environment-specific shortcuts
dev-start:
	@make ENV=dev start

test-start:
	@make ENV=test start

prod-start:
	@make ENV=prod start

dev-stop:
	@make ENV=dev stop

test-stop:
	@make ENV=test stop

prod-stop:
	@make ENV=prod stop

debezium:
	@echo "🔌 Deploying Debezium CDC connector..."
	@bash deploy-debezium.sh
	@echo ""
	@echo "✅ Debezium deployed! CDC is now capturing changes from:"
	@echo "   • products table → products.events topic"
	@echo "   • customers table → customers.events topic"

health:
	@echo "🏥 Checking services health..."
	@echo ""
	@echo "MySQL Core:"
	@docker exec mysql-core mysqladmin ping -h localhost --silent && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"
	@echo ""
	@echo "MySQL CMS:"
	@docker exec mysql-cms mysqladmin ping -h localhost --silent && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"
	@echo ""
	@echo "Kafka:"
	@curl -s http://localhost:9092 > /dev/null 2>&1 && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"
	@echo ""
	@echo "Kafka Connect:"
	@curl -s http://localhost:8083 > /dev/null 2>&1 && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"
	@echo ""
	@echo "Core Service:"
	@curl -s http://localhost:3000/health > /dev/null 2>&1 && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"
	@echo ""
	@echo ""
	@echo "CMS Service:"
	@curl -s http://localhost:3002/health > /dev/null 2>&1 && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"

stop:
	@echo "🛑 Stopping $(ENV) environment services..."
	docker compose $(ENV_FILE) $(COMPOSE_FILES) down
	@echo "✅ All services stopped!"

restart:
	@echo "🔄 Restarting $(ENV) environment services..."
	@make ENV=$(ENV) stop
	@make ENV=$(ENV) start

clean:
	@echo "🧹 Cleaning up $(ENV) environment..."
	@echo "⚠️  This will delete all containers, volumes, and data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose $(ENV_FILE) $(COMPOSE_FILES) down -v --remove-orphans
	docker system prune -f
	@echo "✅ Cleanup complete!"

logs:
	docker compose $(ENV_FILE) $(COMPOSE_FILES) logs -f

logs-core:
	docker compose $(ENV_FILE) $(COMPOSE_FILES) logs -f core-service

logs-cms:
	docker compose $(ENV_FILE) $(COMPOSE_FILES) logs -f cms-service

logs-service:
	docker compose $(ENV_FILE) $(COMPOSE_FILES) logs -f core-service cms-service

logs-kafka:
	docker compose $(ENV_FILE) $(COMPOSE_FILES) logs -f kafka kafka-connect

status:
	@echo "📊 $(ENV) Environment Services Status:"
	@docker compose $(ENV_FILE) $(COMPOSE_FILES) ps


dev:
	@echo "🔧 Starting $(ENV) development mode with hot reload..."
	docker compose $(ENV_FILE) $(COMPOSE_FILES) up

rebuild:
	@echo "🔨 Rebuilding $(ENV) environment services..."
	docker compose $(ENV_FILE) $(COMPOSE_FILES) build
	@make ENV=$(ENV) restart

# Database helpers
db-core:
	@echo "🗄️  Connecting to Core database..."
	docker exec -it mysql-core mysql -u core_user -pcore_password core_db

db-cms:
	@echo "🗄️  Connecting to CMS database..."
	docker exec -it mysql-cms mysql -u cms_user -pcms_password cms_db

# Kafka helpers
kafka-topics:
	@echo "📋 Kafka Topics:"
	@docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

kafka-consumer-groups:
	@echo "👥 Kafka Consumer Groups:"
	@docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list

# Quick start (all in one)
quickstart:
	@make ENV=dev setup
	@make ENV=dev start
	@make debezium
	@echo ""
	@echo "🎉 Quickstart complete!"
	@echo "Development environment is ready to use."

quickstart-test:
	@make ENV=test setup
	@make ENV=test start
	@echo ""
	@echo "🎉 Test environment is ready!"

quickstart-prod:
	@make ENV=prod setup
	@make ENV=prod start
	@echo ""
	@echo "🎉 Production environment is ready!"
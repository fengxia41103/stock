.PHONY: dev test build up down logs backfill rebuild-rankings migrate

# Start all services
up:
	docker compose up -d

# Stop all services
down:
	docker compose down

# Start vite dev server (hot reload at localhost:5173)
dev:
	cd frontend && npx vite --host 0.0.0.0

# Run backend tests
test:
	docker compose exec web pytest -v --tb=short

# Build all containers
build:
	docker compose build

# Run database migrations
migrate:
	docker compose exec web python manage.py migrate

# Backfill denormalized computed fields
backfill:
	docker compose exec web python manage.py backfill_computed_fields

# Rebuild ranking cache
rebuild-rankings:
	docker compose exec web python manage.py rebuild_rankings

# View logs
logs:
	docker compose logs -f --tail 50

# View celery logs
logs-celery:
	docker compose logs -f celery --tail 50

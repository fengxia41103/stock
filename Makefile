.PHONY: dev test build backfill rebuild-rankings lint

# Start all services
dev:
	docker compose up -d

# Run backend tests
test:
	docker compose exec -T web pytest --tb=short -q

# Build frontend
build:
	cd frontend && npx vite build

# Backfill computed fields
backfill:
	docker compose exec -T web python manage.py backfill_computed_fields

# Rebuild ranking cache
rebuild-rankings:
	docker compose exec -T web python manage.py rebuild_rankings

# Fetch FRED macro data
fetch-fred:
	docker compose exec -T web python manage.py shell -c "from stock.tasks import fred_weekly; fred_weekly()"

# Fetch earnings calendar
fetch-earnings:
	docker compose exec -T web python manage.py shell -c "from stock.tasks import earnings_calendar_daily; earnings_calendar_daily()"

# Fetch insider trades for all stocks
fetch-insider:
	docker compose exec -T web python manage.py shell -c "from stock.tasks import insider_daily; insider_daily()"

# Run all data fetches
fetch-all: fetch-fred fetch-earnings fetch-insider

# Lint backend
lint:
	cd backend && ruff check .

# Logs
logs:
	docker compose logs -f web celery

# Shell
shell:
	docker compose exec web python manage.py shell

# Fetch earnings surprise (daily rotation, 12 stocks)
fetch-earnings-surprise:
	docker compose exec -T web python manage.py shell -c "from stock.tasks import earnings_surprise_daily_rotation; earnings_surprise_daily_rotation()"

# Database backup (manual trigger)
backup:
	docker compose exec -T celery python manage.py shell -c "from stock.tasks import db_backup; print(db_backup())"

# Production mode
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Backfill financial statements (income/balance/cashflow) from yfinance
backfill-financials:
	docker compose exec -T web python manage.py backfill_financials

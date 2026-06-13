# Deployment Guide

## Local Development (Docker Compose)

### Prerequisites

- Docker and Docker Compose
- Environment file: symlink `.env` → `dotenv-local`

### Environment Variables (`dotenv-local`)

```
DJANGO_DEBUG=1
MYSQL_DATABASE=stock
DJANGO_DB_USER=fengxia
DJANGO_DB_PWD=<password>
DJANGO_DB_HOST=db
DJANGO_DB_PORT=3306
DJANGO_REDIS_HOST=redis
DEPLOY_TYPE=dev
BUILD_FOR=local
```

### Starting Services

```bash
docker-compose up --build
```

Services and ports:
| Service | Port | URL |
|---------|------|-----|
| Frontend | 8084 | http://localhost:8084 |
| Backend API | 8083 | http://localhost:8083/api/v1/ |
| MySQL | 3306 | Direct access |
| Django Admin | 8083 | http://localhost:8083/admin/ |

### First Run

1. Run migrations: `docker-compose exec web python manage.py migrate`
2. Create superuser: `docker-compose exec web python manage.py createsuperuser`
3. The signal handler auto-provisions sample data on first user creation

## Kubernetes Production

### Container Images

Build and push to Harbor registry:

```bash
# Backend
docker build -t harbor.feng.local:9800/library/backend_stock:v1.1.0.beta ./backend
docker push harbor.feng.local:9800/library/backend_stock:v1.1.0.beta

# Frontend
docker build -t harbor.feng.local:9800/library/frontend_stock:v1.0.0 \
  --build-arg BUILD_FOR=k8s-client-a \
  --build-arg NPM_TOKEN=$NPM_TOKEN \
  ./frontend
docker push harbor.feng.local:9800/library/frontend_stock:v1.0.0
```

### Backend Deployment (`backend/k8s/deploy.yml`)

Resources:
- **Secret**: MySQL credentials, Django secret key
- **ConfigMap**: DB host, Redis host, deploy type
- **Deployment**: 1 replica, `backend_stock` image, port 80
- **Service**: ClusterIP on port 80
- **Ingress**: host `mystock.backend.feng.local`

### Frontend Deployment (`frontend/k8s/deploy.yml`)

Resources:
- **ConfigMap**: nginx.conf with CORS headers and SPA `try_files` routing
- **Deployment**: 3 replicas, `frontend_stock` image, port 80
- **Service**: ClusterIP on port 80
- **Ingress**: host `mystock.feng.local`

### Helm Charts

Available under:
- `backend/k8s/helm-stock-backend-api/` — Backend API server
- `backend/k8s/helm-stock-backend-celery/` — Celery worker
- `frontend/k8s/helm/` — Frontend

### External Dependencies (K8s)

MySQL and Redis are expected to be running on the host network (`192.168.68.106`) rather than in-cluster.

## Docker Build Details

### Backend (`backend/Dockerfile`)

```dockerfile
FROM python:3.8
# Installs: memcached, libmemcached-dev
# Installs: pip requirements
# Runs: collectstatic
# CMD: gunicorn --bind :80 fin.wsgi
```

### Frontend (`frontend/Dockerfile`)

Multi-stage build:
1. **Builder** (node:18.14): Installs deps, handles optional private `@fengxia41103/storybook` package (stubs if no NPM_TOKEN), builds with `env-cmd`
2. **Production** (nginx:latest): Copies build output to nginx

### Nginx Proxy (`backend/nginx.conf`)

- Upstream: `web:80` (Django/Gunicorn)
- CORS: Allows all origins, methods, headers
- WebSocket: Upgrades Connection/Upgrade headers
- Used by `backend-proxy` service in Docker Compose

## CI/CD

### GitHub Actions (`.github/workflows/pretty.yml`)

Runs on every push:
1. Checks out code
2. Runs Prettier on `frontend/src/`
3. Auto-commits formatted code

### Git Hooks (Husky)

- **pre-commit** (root): Runs commitlint
- **commit-msg**: Validates conventional commit format
- **pre-push**: Runs checks
- **pre-commit** (frontend): Runs lint-staged (eslint + prettier)

### Versioning

- `commitlint.config.js`: Enforces `@commitlint/config-conventional`
- `.versionrc.json`: standard-version configuration for CHANGELOG generation
- `package.json` scripts: `release` for version bumping

## Stock Symbol Configuration (`config.yml`)

Watchlist groups used for batch operations:

```yaml
watch:    # ~60 US stocks (AAPL, MSFT, GOOGL, etc.)
research: # 6 stocks under detailed analysis
china:    # 8 Chinese market stocks
japan:    # 2 Japanese market stocks
```

# NPM_TOKEN Setup for @fengxia41103/storybook

The frontend depends on `@fengxia41103/storybook`, a private package
hosted on GitHub Packages. A GitHub Personal Access Token (PAT) with
`read:packages` scope is required to install it.

## Generating the Token

1. Go to https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Select scope: `read:packages`
4. Copy the token

## Local Development

Set `NPM_TOKEN` in your `.env` file (symlinked from `dotenv-local`):

```
NPM_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then `docker-compose up --build` will inject it during the frontend build.

Alternatively, for running outside Docker:

```bash
export NPM_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
cd frontend && npm install
```

The `.npmrc` references `${NPM_TOKEN}` — npm/yarn interpolates it from
the environment automatically.

## Docker Build (standalone)

```bash
docker build \
  --build-arg NPM_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
  -t frontend_stock \
  ./frontend
```

## CI/CD (GitHub Actions)

Add `NPM_TOKEN` as a repository secret, then reference it:

```yaml
- name: Build frontend
  run: docker build --build-arg NPM_TOKEN=${{ secrets.NPM_TOKEN }} -t frontend_stock ./frontend
```

Or for `npm install` directly in CI:

```yaml
- name: Install frontend deps
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
  run: cd frontend && npm install
```

## Kubernetes / Production

Pass the token as a build-time argument only. It is **not** baked into
the final image — the Dockerfile removes `.npmrc` after `npm install`.

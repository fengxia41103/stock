# Session Context — Resume File

## Current State (2026-06-26 14:04 ET)

### Branch
- **Active branch**: `dev`
- **All work merged to dev**
- Local branches: `dev` only (all others pruned)

### Repository Structure
```
/home/fengxia/workspace/me/stock/
├── skills/                    ← Reusable frameworks & methodology
│   ├── skills.md              ← Master index
│   ├── pulak-prasad-investing-from-darwin-en.md
│   ├── benjamin-graham-value-investing.md
│   ├── sec-filing-health-analysis.md
│   ├── stock-deep-dive-framework.md
│   ├── mark-douglas-trading-in-the-zone.md
│   ├── mike-bellafiore-one-good-trade.md
│   ├── andrew-aziz-how-to-day-trade-for-a-living.md
│   ├── 被动基金投资策略.md / 涨停板分类识别与决策方法.md / etc.
│   └── scripts/
│       ├── analyze_sec_health.py    ← SEC XBRL health analysis
│       ├── integrate_sec_health.py  ← Django integration
│       ├── download_sec_filings.py  ← 10-K/10-Q downloader
│       └── download_reports.py      ← China annual reports
├── docs/
│   ├── analysis/              ← Per-stock deep-dive reports
│   │   └── MSFT/
│   │       ├── msft-deep-analysis-2026-06-25.md
│   │       ├── msft-deep-analysis-critical-review.md
│   │       └── msft-market-update-2026-06-26.md
│   ├── upgrade-plan.md        ← App upgrade status (all phases done)
│   ├── session-context.md     ← THIS FILE
│   ├── finviz-dashboard-plan.md
│   ├── dashboard-redesign-geckoboard.md
│   ├── data-sources-plan*.md  ← SEC/FRED/Alpha Vantage plans
│   └── (architecture, api-reference, data-model, etc.)
├── backend/                   ← Django + DRF + Celery
│   └── stock/
│       ├── models/            ← MyStock, InsiderTrade, Macro, Earnings, etc.
│       ├── workers/           ← Yahoo, SEC, FRED, Alpha Vantage, compute_health
│       ├── api/               ← views, serializers, urls
│       ├── tasks.py           ← Celery tasks (no rate limits)
│       └── tests/
├── frontend/                  ← React 18 + MUI 5 + ECharts + Vite
│   └── src/
│       ├── views/dashboard/   ← Geckoboard-style dark dashboard
│       ├── views/stock/       ← Detail views (Price, Health, Earnings, Ownership)
│       ├── views/sector/      ← Portfolio views (macro correlation heatmap)
│       ├── components/        ← PriceChart (ECharts), MacroOverlay, etc.
│       ├── api/               ← hooks.ts (react-query)
│       └── lib/storybook/     ← Shared chart/table components
└── docker-compose.yml
```

### Portfolios (4)
| Portfolio | Stocks | Purpose |
|-----------|--------|---------|
| Consideration | 19 | General watchlist (legacy) |
| Darwin完全过关 | 24 | Darwin Kill List approved stocks |
| Fidelity | 10 | Actual IRA holdings (MSFT, VOO, V, MA, RCL, PDD, SBUX, PLTR, CAT, VSXY) |
| SP500 Top | 10 | S&P 500 quality picks |

### Data Status
- **Stocks**: 47 total
- **Historicals**: 287K+ records, refreshed every 10 min
- **FRED**: 17 series, 2,942 data points (10Y Treasury, CPI, unemployment, etc.)
- **Alpha Vantage**: 2,342 earnings events, 2,286 price impacts computed
- **SEC Insider Trades**: 2,723 trades (P and S only shown)
- **SEC Institutional Holdings**: 12 records
- **News**: 160+ articles (Yahoo Finance per-stock)
- **Rankings**: 5 caches + signal ranks (insider, beat rate, weekly return, drop scale)

### API Endpoints (22)
| Endpoint | Description |
|----------|-------------|
| `/stocks/` | List/CRUD stocks |
| `/stocks/{id}/overview/` | Treemap/screener data (?date= supported) |
| `/stocks/{id}/health/` | SEC XBRL health analysis |
| `/stocks/{id}/dupont/` | DuPont ROE model |
| `/stocks/{id}/nav/` | Net asset value |
| `/stocks/{id}/cross-statements/` | ROCE, ROIC, FCF |
| `/historicals/` | Price data (stock__in filter works) |
| `/insider-trades/` | SEC Form 4 (P/S only) |
| `/holdings/` | 13F institutional |
| `/macro-series/` | FRED series metadata |
| `/macro-data/` | FRED observations |
| `/macro-correlations/` | Stock vs macro Pearson r |
| `/earnings/` | Earnings history |
| `/earnings/upcoming/` | Next 30 days |
| `/signal-ranks/` | Insider/beat rate/momentum/drop |
| `/health/` | DB + Redis connectivity |
| `/sectors/`, `/diaries/`, `/news/`, `/tasks/` | Standard CRUD |
| `/{type}-ranks/` | stock/balance/cash/income/valuation rankings |

### Frontend Pages
| Route | Page |
|-------|------|
| `/dashboard` | Geckoboard-style dark KPI tiles + movers |
| `/map` | Treemap by portfolio, colored by return |
| `/screener` | Sortable/filterable stock table |
| `/charts` | Sparkline grid of all stocks |
| `/macro` | FRED indicators with mini sparklines |
| `/stocks/:id/health` | SEC health assessment (Altman Z, ratios) |
| `/stocks/:id/earnings` | Beat rate, surprise chart |
| `/stocks/:id/insider-trades` | Buy/sell timeline |
| `/stocks/:id/institutional` | 13F holdings pie chart |
| `/stocks/:id/historical/price` | ECharts price + earnings markLines + macro overlay |
| `/sectors/:id/macro-correlation` | Heatmap (under Price & Trends) |
| `/rankings` | Signal ranks first, then ROE/balance/income/cash/valuation |
| `/notes` | Searchable diary with anchor links |

### Environment
```
Python 3.12 + Django 5.2 + DRF
React 18 + Vite + MUI 5 + ECharts
Docker Compose (web, celery, db, redis, frontend)
FRED_API_KEY=set
ALPHA_VANTAGE_API_KEY=set
```

### Auth
```
Token: 72b2fc70c676c67ba611f863c3b1dffcf8cab5ec
User: fengxia
GitHub: fengxia41103
```

### Recent Analysis Work
- MSFT deep analysis report (10 dimensions, STRONG BUY at $353)
- Portfolio cleanup: sold JD, BFAM, CCL, BBWI, GTLB, TGT
- Added V, MA positions in Fidelity IRA
- Darwin framework applied to Nasdaq Top 10
- Created 30+ diary entries for all portfolio stocks

### What's Left (from upgrade-plan.md)
- Backfill remaining 10 stocks' earnings surprise (Alpha Vantage daily limit)
- Mobile responsiveness audit
- Weekly email digest (needs SMTP)
- Prometheus metrics
- MySQL backup to S3

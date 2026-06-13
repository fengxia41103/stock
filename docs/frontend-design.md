# Frontend Design

## Overview

A React 18 single-page application using Material UI 5, built with craco (create-react-app configuration override). The app provides stock analysis views organized around sectors and individual stocks.

## Build Configuration

- **Bundler**: Webpack via craco
- **Aliases**: `@` → src, `@Components` → src/components, `@Views` → src/views, `@Layouts` → src/layouts, `@Utils` → src/utils
- **Environment**: `env-cmd` loads environment-specific files from `frontend/envs/` (local, k8s-client-a)
- **Polyfills**: NodePolyfillPlugin for Node.js APIs in browser
- **ESLint**: Disabled in webpack (separate lint-staged step)

## Routing

React Router v6 with `createBrowserRouter`. Protected routes wrapped in `ProtectedRoute` → `MainLayout`.

```
/login                          → LoginView
/logout                         → LogoutView
/registration                   → RegistrationView

/ (ProtectedRoute → MainLayout)
├── /sectors                    → SectorListView (default redirect)
├── /sectors/:id                → SectorDetailView
│   ├── price                   → SectorPriceView
│   ├── return                  → SectorReturnView
│   ├── roe                     → SectorRoeView
│   ├── ownership               → SectorInstitutionOwnershipView
│   ├── lower-better            → SectorStocksLowerBetterView
│   ├── income                  → SectorIncomeView
│   ├── balance                 → SectorBalancesheetView
│   ├── cash                    → SectorCashFlowView
│   ├── roe-ranking             → SectorRoeRankingView
│   ├── income-ranking          → SectorIncomeRankingView
│   ├── balance-ranking         → SectorBalanceRankingView
│   ├── cash-ranking            → SectorCashRankingView
│   └── valuation-ranking       → SectorValuationRankingView
├── /stocks                     → StockListView
├── /stocks/:id                 → StockDetailView
│   ├── summary                 → StockSummaryView
│   ├── nav                     → NavView
│   ├── balance                 → BalanceView
│   ├── income                  → IncomeView
│   ├── cash                    → CashFlowView
│   ├── dcf                     → DCFView
│   ├── ratios                  → ValuationRatiosView
│   ├── dupont                  → DupontView
│   ├── historical              → StockHistoricalView
│   │   ├── price               → PriceView
│   │   ├── daily-return        → DailyReturnView
│   │   ├── overnight-return    → OvernightReturnView
│   │   ├── 24h-return          → TwentyFourHourReturnView
│   │   ├── lower-better        → LastLowerNextBetterView
│   │   ├── tech-indicator      → TechIndicatorView
│   │   └── ranking             → RankingView
├── /today                      → TodayDashboardView
├── /trending                   → DashboardTrendingView
├── /notes                      → DiaryListView
├── /notes/add                  → AddDiaryView
└── /news                       → NewsListView
```

## Navigation

7 main nav items in sidebar:
1. Today (dashboard)
2. Trending (ranking analysis)
3. Stocks (list view)
4. Sectors (list view, default landing)
5. Rankings (sector-level rankings)
6. Notes (diary)
7. News

## Component Architecture

### Layout (`src/layouts/`)

- **MainLayout** — App shell with sidebar navigation and content area
- **NavBar** — Sidebar navigation component
- **NavBarItem** — Individual nav link
- **TopBar** — Header bar

### Common (`src/components/common/`)

Reusable data-fetching wrappers:
- **Get** — Fetches a REST resource and renders children with data
- **ShowResource** — Displays a fetched resource
- **PollResource** — Polls an endpoint at intervals (used for task status)

### Stock Components (`src/components/stock/`)

19 components for stock analysis:
- **AddNewStockDialog** — Dialog to add stock to a sector
- **DeleteStock** — Stock deletion confirmation
- **UpdateStock** / **UpdateAllStock** — Trigger data refresh
- **ExportStocks** — Export stock data
- **ListStockCard** — Stock card in list view
- **StockSymbol** — Symbol display with link
- **StockLinkToSector** — Shows which sectors contain this stock
- **StockRanking** / **StockRankingRow** — Ranking displays
- **PriceChart** / **StocksPriceChart** — Price line charts (ECharts)
- **PriceTable** — Tabular price data
- **PriceReturnStat** — Return statistics
- **PriceLastLowerNextBetterChart** — Core "human-friendly" indicator chart
- **GainProbabilityChart** — Future gain probability visualization
- **GainPriceRanges** — Price range analysis
- **RecentPriceSparkline** — Inline sparkline chart
- **FinancialCard** — Financial metric display card

### Sector Components (`src/components/sector/`)

13 components for sector-level analysis:
- **ListSectorCard** — Sector card in list
- **AddNewSectorDialog** / **EditSectorDialog** / **DeleteSectorDialog** — CRUD dialogs
- **AddStocksToSectorDialog** — Add stocks to existing sector
- **SectorPriceTrending** — Price comparison across stocks
- **SectorReturnComparisonChart** — Return comparison
- **SectorRoeColumnChart** — ROE comparison bar chart
- **SectorDupontLineChart** / **SectorDupontBreakdownChart** — DuPont analysis
- **SectorOwnershipChart** — Institutional ownership comparison
- **SectorStatementComparisonCharts** — Financial statement comparison
- **SectorStocksRanking** — Ranking within sector

### Diary Components (`src/components/diary/`)

6 components:
- **ListDiary** / **ListDiaryEntry** — Diary list and entries
- **AddDiaryEditor** / **EditDiaryEditor** — Markdown editors
- **DiaryStockTag** — Stock tag with link
- **StockTagPriceLabel** — Price at time of diary entry

### Dashboard Components (`src/components/dashboard/`)

6 components:
- **MoverCard** — Top movers display
- **StockRankingGrid** / **StockRankingGridColumn** — Grid ranking display
- **RankingScores** — Composite ranking scores
- **RankingOccuranceCharts** — Ranking frequency analysis
- **DailyRankingBarRaceChart** — Animated ranking race chart

### Auth Components (`src/components/auth/`)

- **LoginCard** / **LoginButton** — Login form
- **RegistrationCard** — Registration form
- **LogoutIcon** — Logout button

### Other

- **TaskNotificationIcon** / **TaskResult** — Background task status polling
- **AuthenticatedUser** — Current user display
- **ListNewsCard** — News article card

## Technical Indicators (`TechIndicatorView`)

Custom chart implementations using react-stockcharts:
- **MACD** — Moving Average Convergence Divergence
- **Bollinger Bands** — Price volatility bands
- **SAR** — Parabolic Stop and Reverse
- **Elder Ray** — Bull/Bear power
- **Stochastics** — Stochastic oscillator
- **RSI** — Relative Strength Index
- **Heikin-Ashi** — Candlestick chart variant

## State Management

- **GlobalContext** — Provides `api` base URL and `host` URL (from `REACT_APP_HOST_URL`)
- **View-level contexts** — `StockDetailView`, `SectorDetailView`, `DiaryListView` each have local context for sharing data between parent/child views
- **No global state library** — Data is fetched at view level using restful-react

## Authentication (Frontend)

- Login stores API key in localStorage
- `ProtectedRoute` checks for valid key, redirects to `/login` if missing
- API key sent with every request via restful-react configuration

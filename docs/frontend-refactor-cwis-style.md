# Stock App Frontend Refactor Plan — Align with CWIS Architecture

## Problem

The stock app frontend evolved organically over 5 phases of upgrades. It works, but compared to cwis-sfdc-management it feels:
- Over-engineered (custom `@fengxia41103/storybook` lib with private npm registry)
- Inconsistent charting (ECharts + Highcharts + react-stockcharts mixed)
- Layout is too traditional (separate views for everything, deep nesting)
- No shared page shell / consistent page pattern
- Legacy patterns still present (Get/PollResource, context.js, old auth)

## Target Architecture (cwis-sfdc-management pattern)

```
frontend/
├── App.jsx              ← Slim shell: ThemeProvider + Router + Layout
├── app/
│   ├── navigation.jsx   ← Flat array of nav items (label, path, icon)
│   └── routes.jsx       ← All routes lazy-loaded, flat array
├── components/
│   ├── layout/          ← Sidebar, AppBar, PageShell
│   └── shared/          ← Reusable (charts, tables, cards, dialogs)
├── hooks/               ← useStockData, usePolling, useChartTheme
├── pages/               ← One file per page (flat, no nesting)
├── services/
│   └── api.js           ← Single axios instance + token interceptor
├── context/             ← StockContext (selected stock), AuthContext
└── theme/               ← MUI theme (dark mode default)
```

## Key Differences: Current vs Target

| Aspect | Current (Stock App) | Target (CWIS Pattern) |
|--------|--------------------|-----------------------|
| Package registry | Private `@fengxia41103/storybook` (broken token) | No private packages |
| Chart library | ECharts + Highcharts + react-stockcharts | **Highcharts only** |
| API layer | `client.ts` + `hooks.ts` (react-query) | `services/api.js` (axios) + custom hooks |
| Data fetching | react-query (tanstack) | Keep react-query (better than raw axios for caching) |
| Auth | Custom API key in localStorage | Keep as-is (simpler than Keycloak) |
| Layout | `layouts/MainLayout` + `NavBar` + `TopBar` | Single `App.jsx` with inline layout |
| Page structure | `views/{domain}/{ViewName}/index.jsx` | `pages/{PageName}.jsx` (flat) |
| Navigation | Embedded in `routes.jsx` | Separate `app/navigation.jsx` |
| Routes | Monolithic `routes.jsx` (500+ lines) | Separate `app/routes.jsx` (clean array) |
| Storybook lib | `lib/storybook/` (15KB wrapper) | Delete — use MUI directly |
| Theme | Light + dark toggle | **Dark mode default** (like CWIS dark theme) |
| Components | Deep nesting (`components/stock/PriceChart/index.jsx`) | Flatter (`components/PriceChart.jsx`) |

---

## Phase 1: Kill Private Dependencies & Standardize Charts (~4h)

### 1.1 Remove `@fengxia41103/storybook` dependency

This private package is the #1 pain point — npm can't install without a valid GitHub token.

**Action:**
- Grep all imports of `@fengxia41103/storybook`
- Replace with direct MUI components (the storybook lib just wraps MUI anyway)
- Key components to inline: `Page`, `DictTable`, `ListTable`
- Delete from package.json

### 1.2 Remove ECharts, standardize on Highcharts

**Action:**
- Remove `echarts`, `echarts-for-react` from package.json
- Rewrite remaining ECharts usages (PriceView, TechIndicatorView, charts in sector views)
- All charts → Highcharts (already installed)
- Remove react-stockcharts (dead dependency from Phase 1.8 upgrade — already replaced)

### 1.3 Remove dead files

- `src/lib/` directory (entire storybook wrapper library)
- `src/components/storybook/` 
- `src/components/common/Get/` (legacy, replaced by react-query)
- `src/components/common/PollResource/` (legacy polling)
- `src/components/common/ShowResource/` (legacy)
- `src/App.css` (dead CSS)
- `src/logo.svg`, `src/reportWebVitals.js`, `src/setupTests.js`
- `src/index.css`

---

## Phase 2: Flatten Page Structure (~3h)

### 2.1 Move views to flat `pages/` directory

Current: `views/stock/PriceView/index.jsx` (3 levels deep)
Target: `pages/StockPricePage.jsx` (flat)

**Mapping:**
```
views/dashboard/TodayDashboardView/  → pages/DashboardPage.jsx
views/dashboard/ScreenerView/        → pages/ScreenerPage.jsx
views/dashboard/ChartsGridView/      → pages/ChartsGridPage.jsx
views/dashboard/MacroOverviewView/   → pages/MacroPage.jsx
views/dashboard/DashboardTrendingView/ → pages/TrendingPage.jsx
views/stock/PriceView/               → pages/StockPricePage.jsx
views/stock/HealthView/              → pages/StockHealthPage.jsx
views/stock/EarningsView/            → pages/StockEarningsPage.jsx
views/stock/InsiderTradesView/       → pages/StockInsiderPage.jsx
views/stock/DupontView/              → pages/StockDupontPage.jsx
views/stock/DCFView/                 → pages/StockDCFPage.jsx
... (all ~40 view files)
```

### 2.2 Extract navigation to `app/navigation.jsx`

Single flat array like CWIS:
```javascript
export const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { path: "/screener", label: "Screener", icon: <FilterListIcon /> },
  { path: "/charts", label: "Charts", icon: <GridViewIcon /> },
  ...
];
```

### 2.3 Simplify `app/routes.jsx`

```javascript
const routes = [
  { path: "dashboard", element: lazy(() => import("../pages/DashboardPage")) },
  { path: "screener", element: lazy(() => import("../pages/ScreenerPage")) },
  ...
];
```

---

## Phase 3: Slim App Shell (~2h)

### 3.1 Rewrite App.jsx to CWIS pattern

```jsx
// App.jsx — slim shell
function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {routes.map(r => <Route key={r.path} ... />)}
              </Routes>
            </Suspense>
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
```

### 3.2 Create `components/layout/AppLayout.jsx`

Permanent sidebar (240px) + AppBar, matching CWIS Drawer pattern:
- Sidebar with nav items from `app/navigation.jsx`
- AppBar with stock search, dark mode toggle, user
- Responsive: collapses on mobile

### 3.3 Delete old layout files

- `src/layouts/MainLayout/`
- `src/layouts/NavBar/`
- `src/layouts/NavBarItem/`
- `src/layouts/TopBar/`

---

## Phase 4: Dark Theme Default (~1h)

### 4.1 Set dark mode as default

The CWIS app uses a blue/dark theme. Apply similar:
```javascript
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3b82f6" },   // blue
    secondary: { main: "#10b981" }, // green (for gains)
    background: {
      default: "#0f172a",  // slate-900
      paper: "#1e293b",    // slate-800
    },
  },
});
```

### 4.2 Remove dark mode toggle logic

- Delete `useChartTheme` hook (was for ECharts dark/light sync)
- All charts use dark config by default

---

## Phase 5: API Layer Cleanup (~2h)

### 5.1 Replace `client.ts` + `hooks.ts` with `services/api.js`

Match CWIS pattern — single axios instance:
```javascript
// services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
});

api.interceptors.request.use((config) => {
  const key = localStorage.getItem("apiKey");
  if (key) config.headers.Authorization = `ApiKey ${key}`;
  return config;
});

export default api;
```

### 5.2 Keep react-query hooks but simplify

```javascript
// hooks/useStocks.js
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const useStocksOverview = (date) =>
  useQuery(["stocks-overview", date], () =>
    api.get("/stocks/overview/", { params: { date } }).then(r => r.data)
  );
```

### 5.3 Delete old files

- `src/api/client.ts` → replaced by `services/api.js`
- `src/api/hooks.ts` → replaced by `hooks/*.js`
- `src/api/index.ts`
- `src/context.js` (legacy GlobalContext)

---

## Phase 6: Component Consolidation (~3h)

### 6.1 Flatten components

Move from `components/{domain}/{ComponentName}/index.jsx` to:
```
components/
├── layout/
│   ├── AppLayout.jsx
│   └── Sidebar.jsx
├── charts/
│   ├── PriceChart.jsx       (Highcharts line chart)
│   ├── TreemapChart.jsx     (Highcharts treemap)
│   ├── CandlestickChart.jsx (Highcharts candlestick)
│   └── BarChart.jsx         (Highcharts bar)
├── stock/
│   ├── StockCard.jsx
│   ├── StockSearch.jsx
│   └── FinancialTable.jsx
├── diary/
│   ├── DiaryScorecard.jsx
│   ├── DiaryCard.jsx
│   └── DiaryDetail.jsx
└── shared/
    ├── PageShell.jsx        (title + breadcrumb + content area)
    ├── StatCard.jsx         (KPI tile)
    ├── DataTable.jsx        (sortable table)
    └── LoadingState.jsx
```

### 6.2 Create `PageShell` component (like CWIS pages)

Every page wraps in:
```jsx
const PageShell = ({ title, actions, children }) => (
  <Box sx={{ p: 3 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h5" fontWeight={700}>{title}</Typography>
      {actions}
    </Stack>
    {children}
  </Box>
);
```

---

## Phase 7: Build System (~1h)

### 7.1 Verify Vite config is clean

- Remove any craco references (already migrated)
- Remove path aliases that reference deleted dirs (`@Components`, `@Views`)
- Update aliases: `@/pages`, `@/components`, `@/hooks`, `@/services`

### 7.2 Fix npm install (the core blocker)

After removing `@fengxia41103/storybook`:
- `.npmrc` can use public registry only
- `npm install` works without GitHub token
- Docker build works without `NPM_TOKEN`

---

## Summary

| Phase | Effort | Impact |
|-------|--------|--------|
| 1. Kill private deps + standardize charts | 4h | Unblocks npm install, single chart lib |
| 2. Flatten page structure | 3h | Matches CWIS pattern, easier navigation |
| 3. Slim App shell | 2h | Clean entry point, CWIS-style layout |
| 4. Dark theme default | 1h | Consistent dark look |
| 5. API layer cleanup | 2h | Single source of truth for HTTP |
| 6. Component consolidation | 3h | Fewer files, clearer organization |
| 7. Build system | 1h | npm install just works |
| **Total** | **~16h** | |

## Execution Order (minimize breakage)

```
Phase 1.1 → 1.3 → 7.2  (first: make npm install work again)
Phase 4                  (dark theme — visual win, low risk)
Phase 3                  (new App shell)
Phase 2                  (flatten pages — biggest refactor)
Phase 5                  (API layer)
Phase 6                  (components)
Phase 1.2                (ECharts → Highcharts — last, most tedious)
```

## What NOT to Change

- **Backend** — API is fine, no changes needed
- **react-query** — better than raw axios for caching/deduplication (CWIS doesn't have this advantage)
- **React Router v6** — same pattern as CWIS
- **MUI 5** — fine (CWIS uses MUI 9 but the API is ~95% compatible)
- **Data models** — all computed props and endpoints stay the same

---

*Plan created August 1, 2026.*

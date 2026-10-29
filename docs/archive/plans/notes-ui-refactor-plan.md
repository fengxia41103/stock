# Notes UI Refactor Plan

## Problem

The `/notes` page is a flat, unsorted list of 50+ diary entries with full markdown rendered for every note. It's unusable for:
- Finding a specific stock's history
- Tracking prediction accuracy visually
- Filtering by bull/bear, correct/wrong, time period
- Quick scanning without scrolling through walls of text

## Current Architecture

```
DiaryListView
  └─ TextField (search by symbol only)
  └─ ListDiary (fetches all diaries via PollResource)
       └─ ListDiaryEntry × N (EVERY note fully expanded)
            └─ EditDiaryEditor (full MDEditor.Markdown rendered)
            └─ DiaryStockTag (matches stocks in content, shows price cards)
```

**Issues:**
1. `PollResource` — legacy polling pattern, should use react-query
2. All notes rendered simultaneously — no pagination, no virtualization
3. No collapsed/expanded state — every note shows full content
4. Search only supports symbol text match, no structured filters
5. No aggregated prediction statistics visible

---

## Proposed Design: 3-Panel Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 Prediction Scorecard (top banner)                            │
│ Total: 42 | ✅ 37 (88%) | ❌ 5 | Bull: 91% | Bear: 75%        │
├──────────────────────┬──────────────────────────────────────────┤
│ FILTERS + LIST       │  DETAIL PANEL                            │
│ (left, 35% width)   │  (right, 65% width)                      │
│                      │                                          │
│ 🔍 Search...         │  Full markdown render of selected note   │
│ [All][Bull][Bear]    │  + Stock tags with price tracking        │
│ [✅][❌][Pending]    │  + Edit/Delete actions                   │
│ [Stock ▼][Period ▼]  │                                          │
│                      │                                          │
│ Compact card list:   │                                          │
│ ┌────────────────┐   │                                          │
│ │ Jul 20 MSFT ▲  │   │                                          │
│ │ $402 ✅ +6.1%  │   │                                          │
│ ├────────────────┤   │                                          │
│ │ Jul 20 CME ▼   │   │                                          │
│ │ $245 ❌ -3.4%  │   │                                          │
│ ├────────────────┤   │                                          │
│ │ Jun 30 V ▲     │   │                                          │
│ │ $342 ✅ +5.4%  │   │                                          │
│ └────────────────┘   │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Backend — Diary Stats Endpoint

Add `@action(detail=False)` on `DiaryViewSet`:

```python
# GET /api/v1/diaries/stats/
@action(detail=False, methods=["get"])
def stats(self, request):
    diaries = MyDiary.objects.filter(user=request.user)
    total = diaries.count()
    
    # is_correct is a computed property — need to evaluate in Python
    entries = list(diaries.select_related("stock"))
    correct = sum(1 for d in entries if d.is_correct)
    wrong = total - correct
    
    bulls = [d for d in entries if d.judgement == 1]
    bears = [d for d in entries if d.judgement == 2]
    bull_correct = sum(1 for d in bulls if d.is_correct)
    bear_correct = sum(1 for d in bears if d.is_correct)
    
    # Per-stock breakdown
    from collections import defaultdict
    by_stock = defaultdict(lambda: {"total": 0, "correct": 0})
    for d in entries:
        sym = d.stock.symbol if d.stock else "GENERAL"
        by_stock[sym]["total"] += 1
        if d.is_correct:
            by_stock[sym]["correct"] += 1
    
    return Response({
        "total": total,
        "correct": correct,
        "wrong": wrong,
        "accuracy_pct": round(correct / total * 100, 1) if total else 0,
        "bull_total": len(bulls),
        "bull_correct": bull_correct,
        "bull_accuracy_pct": round(bull_correct / len(bulls) * 100, 1) if bulls else 0,
        "bear_total": len(bears),
        "bear_correct": bear_correct,
        "bear_accuracy_pct": round(bear_correct / len(bears) * 100, 1) if bears else 0,
        "by_stock": [
            {"symbol": k, "total": v["total"], "correct": v["correct"],
             "accuracy_pct": round(v["correct"] / v["total"] * 100, 1) if v["total"] else 0}
            for k, v in sorted(by_stock.items(), key=lambda x: x[1]["total"], reverse=True)
        ],
    })
```

Also update the list serializer to include `is_correct` and `stock_symbol`:

```python
class DiaryListSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source="stock.symbol", default=None)
    is_correct = serializers.SerializerMethodField()
    
    def get_is_correct(self, obj):
        return obj.is_correct
    
    class Meta:
        model = MyDiary
        fields = ["id", "created", "last_updated", "judgement", "stock", 
                  "stock_symbol", "is_correct", "price"]
```

**Files:** `backend/stock/api/views.py`, `backend/stock/api/serializers.py`

---

### Step 2: Frontend — API Hook

```typescript
// api/hooks.ts — add:
export const useDiaryStats = () =>
  useQuery(["diary-stats"], () => client.get("/diaries/stats/"));

export const useDiaries = (params?: Record<string, string>) =>
  useQuery(["diaries", params], () => client.get("/diaries/", { params }));
```

**File:** `frontend/src/api/hooks.ts`

---

### Step 3: DiaryScorecard Component (NEW)

Top banner showing aggregated prediction accuracy.

```jsx
// components/diary/DiaryScorecard/index.jsx
const DiaryScorecard = ({ stats }) => (
  <Paper sx={{ p: 2, mb: 2, bgcolor: "#1e293b", borderRadius: 2 }}>
    <Stack direction="row" spacing={4} justifyContent="space-around">
      <StatTile label="Total Predictions" value={stats.total} />
      <StatTile label="Accuracy" value={`${stats.accuracy_pct}%`} 
                color={stats.accuracy_pct > 80 ? "success.main" : "warning.main"} />
      <StatTile label="🐂 Bull" value={`${stats.bull_accuracy_pct}%`} sub={`${stats.bull_correct}/${stats.bull_total}`} />
      <StatTile label="🐻 Bear" value={`${stats.bear_accuracy_pct}%`} sub={`${stats.bear_correct}/${stats.bear_total}`} />
    </Stack>
  </Paper>
);
```

**File:** `frontend/src/components/diary/DiaryScorecard/index.jsx`

---

### Step 4: DiaryFilters Component (NEW)

Filter bar above the compact list.

```jsx
// components/diary/DiaryFilters/index.jsx
const DiaryFilters = ({ filters, setFilters, stocks }) => (
  <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
    <TextField size="small" placeholder="Search content..." 
               value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
    
    <ToggleButtonGroup size="small" exclusive value={filters.judgement}
                       onChange={(_, v) => setFilters({...filters, judgement: v})}>
      <ToggleButton value="all">All</ToggleButton>
      <ToggleButton value="bull"><TrendingUpIcon fontSize="small" /> Bull</ToggleButton>
      <ToggleButton value="bear"><TrendingDownIcon fontSize="small" /> Bear</ToggleButton>
    </ToggleButtonGroup>
    
    <ToggleButtonGroup size="small" exclusive value={filters.correct}
                       onChange={(_, v) => setFilters({...filters, correct: v})}>
      <ToggleButton value="all">All</ToggleButton>
      <ToggleButton value="correct">✅</ToggleButton>
      <ToggleButton value="wrong">❌</ToggleButton>
    </ToggleButtonGroup>
    
    <Select size="small" value={filters.stock} onChange={e => setFilters({...filters, stock: e.target.value})}>
      <MenuItem value="">All Stocks</MenuItem>
      {stocks.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
    </Select>
    
    <Select size="small" value={filters.period} onChange={e => setFilters({...filters, period: e.target.value})}>
      <MenuItem value="all">All Time</MenuItem>
      <MenuItem value="7d">This Week</MenuItem>
      <MenuItem value="30d">Last 30 Days</MenuItem>
      <MenuItem value="90d">Last Quarter</MenuItem>
    </Select>
  </Stack>
);
```

**File:** `frontend/src/components/diary/DiaryFilters/index.jsx`

---

### Step 5: DiaryCardCompact Component (NEW)

Replaces the full-render `ListDiaryEntry` in the left panel.

```jsx
// components/diary/DiaryCardCompact/index.jsx
const DiaryCardCompact = ({ diary, selected, onClick }) => (
  <Card 
    onClick={() => onClick(diary.id)}
    sx={{ 
      cursor: "pointer", mb: 0.5, 
      bgcolor: selected ? "action.selected" : "background.paper",
      "&:hover": { bgcolor: "action.hover" },
      borderLeft: selected ? "3px solid" : "3px solid transparent",
      borderColor: selected ? "primary.main" : "transparent",
    }}
  >
    <Box display="flex" alignItems="center" gap={1} p={1.5}>
      {diary.judgement === 1 
        ? <TrendingUpIcon fontSize="small" color="success" /> 
        : <TrendingDownIcon fontSize="small" color="error" />}
      <Typography variant="subtitle2" fontWeight={600}>
        {diary.stock_symbol || "GENERAL"}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {dayjs(diary.created).format("MMM D")}
      </Typography>
      <Box flexGrow={1} />
      {diary.is_correct !== null && (
        <Chip 
          label={diary.is_correct ? "✅" : "❌"} 
          size="small" 
          variant="outlined"
          color={diary.is_correct ? "success" : "error"}
        />
      )}
    </Box>
  </Card>
);
```

**File:** `frontend/src/components/diary/DiaryCardCompact/index.jsx`

---

### Step 6: DiaryDetail Component (NEW)

Right panel — renders full markdown only for the selected note.

```jsx
// components/diary/DiaryDetail/index.jsx
const DiaryDetail = ({ diaryId }) => {
  const { data: diary, isLoading } = useDiary(diaryId);
  const [inEditing, setInEditing] = useState(false);
  
  if (!diaryId) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <Typography color="text.secondary">Select a note to view</Typography>
    </Box>
  );
  
  if (isLoading) return <ScaleLoader loading />;
  
  return (
    <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Typography variant="h5">{diary.stock_symbol || "General"}</Typography>
        <Chip label={diary.judgement === 1 ? "BULL" : "BEAR"} 
              color={diary.judgement === 1 ? "success" : "error"} size="small" />
        <Typography variant="caption">{dayjs(diary.created).format("MMMM D, YYYY")}</Typography>
        <Box flexGrow={1} />
        <IconButton onClick={() => setInEditing(!inEditing)}><EditIcon /></IconButton>
        <IconButton onClick={handleDelete}><DeleteIcon /></IconButton>
      </Stack>
      
      {/* Content */}
      <EditDiaryEditor diary={diary} inEditing={inEditing} />
      
      {/* Stock Tags */}
      <Box mt={3}>
        <DiaryStockTag diary={diary} />
      </Box>
    </Box>
  );
};
```

**File:** `frontend/src/components/diary/DiaryDetail/index.jsx`

---

### Step 7: Rewrite DiaryListView

The main view orchestrating all the above.

```jsx
// views/diary/DiaryListView/index.jsx
const DiaryListView = () => {
  const { data: stats } = useDiaryStats();
  const { data: stocks } = useStocks();
  const { data: diariesRaw } = useDiaries();
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ 
    search: "", judgement: "all", correct: "all", stock: "", period: "all" 
  });

  const diaries = useMemo(() => {
    let list = diariesRaw || [];
    if (filters.judgement === "bull") list = list.filter(d => d.judgement === 1);
    if (filters.judgement === "bear") list = list.filter(d => d.judgement === 2);
    if (filters.correct === "correct") list = list.filter(d => d.is_correct === true);
    if (filters.correct === "wrong") list = list.filter(d => d.is_correct === false);
    if (filters.stock) list = list.filter(d => d.stock_symbol === filters.stock);
    if (filters.search) list = list.filter(d => 
      d.stock_symbol?.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.period !== "all") {
      const days = { "7d": 7, "30d": 30, "90d": 90 }[filters.period];
      const cutoff = dayjs().subtract(days, "day");
      list = list.filter(d => dayjs(d.created).isAfter(cutoff));
    }
    return list;
  }, [diariesRaw, filters]);

  const stockSymbols = useMemo(() => 
    [...new Set((diariesRaw || []).map(d => d.stock_symbol).filter(Boolean))].sort()
  , [diariesRaw]);

  return (
    <Page title="Notes">
      <Container maxWidth={false}>
        {/* Scorecard */}
        {stats && <DiaryScorecard stats={stats} />}
        
        {/* Two-column layout */}
        <Grid container spacing={2} sx={{ height: "calc(100vh - 240px)" }}>
          {/* Left: filters + compact list */}
          <Grid item xs={12} md={4} sx={{ height: "100%", overflow: "auto" }}>
            <DiaryFilters filters={filters} setFilters={setFilters} stocks={stockSymbols} />
            <Button href="/notes/add" startIcon={<AddIcon />} variant="outlined" size="small" fullWidth sx={{ mb: 1 }}>
              Add Note
            </Button>
            {diaries.map(d => (
              <DiaryCardCompact key={d.id} diary={d} selected={selected === d.id} onClick={setSelected} />
            ))}
            {diaries.length === 0 && (
              <Typography color="text.secondary" align="center" mt={4}>No notes match filters</Typography>
            )}
          </Grid>
          
          {/* Right: detail */}
          <Grid item xs={12} md={8} sx={{ height: "100%", overflow: "auto" }}>
            <Paper sx={{ height: "100%", p: 0 }}>
              <DiaryDetail diaryId={selected} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
};
```

**File:** `frontend/src/views/diary/DiaryListView/index.jsx`

---

### Step 8: Optional — Group by Stock View

Toggle between "chronological" and "grouped by stock" modes:

```
Chronological (default):     Grouped by Stock:
  Jul 20 MSFT ▲               ▶ MSFT (5 notes, 100%)
  Jul 20 CME ▼                ▶ V (3 notes, 100%)
  Jul 20 GOOGL ▲              ▶ CME (3 notes, 33%) ← weak thesis!
  Jun 30 V ▲                  ▶ NFLX (2 notes, 50%)
  ...                         ▶ PLTR (2 notes, 100%)
```

This immediately surfaces which stocks have consistent correct predictions vs which ones we keep getting wrong.

---

## File Summary

| File | Action | Lines |
|------|--------|-------|
| `backend/stock/api/views.py` | Add `stats` action to DiaryViewSet | +30 |
| `backend/stock/api/serializers.py` | Add `stock_symbol`, `is_correct` to list serializer | +10 |
| `frontend/src/api/hooks.ts` | Add `useDiaryStats`, `useDiaries` | +6 |
| `frontend/src/views/diary/DiaryListView/index.jsx` | **Rewrite** | ~80 |
| `frontend/src/components/diary/DiaryScorecard/index.jsx` | **NEW** | ~40 |
| `frontend/src/components/diary/DiaryFilters/index.jsx` | **NEW** | ~50 |
| `frontend/src/components/diary/DiaryCardCompact/index.jsx` | **NEW** | ~35 |
| `frontend/src/components/diary/DiaryDetail/index.jsx` | **NEW** | ~60 |
| `frontend/src/components/diary/ListDiary/index.jsx` | Remove (replaced) | -70 |
| `frontend/src/components/diary/ListDiaryEntry/index.jsx` | Keep (used in detail) or merge into DiaryDetail | refactor |

**Total:** ~310 lines new/rewritten, ~70 lines removed.

---

## Migration Path

1. Create new components alongside existing ones (no breaking changes)
2. Wire up new `DiaryListView` behind a feature flag or just replace
3. Test with 50+ diary entries
4. Remove old `ListDiary` + `PollResource` usage
5. Verify mobile responsiveness (stack panels vertically on xs)

---

## Dependencies

- No new npm packages needed (all MUI components already available)
- `dayjs` already in project (replaced moment.js in Phase 1)
- `@uiw/react-md-editor` already used for rendering
- `react-query` already wired up via `api/hooks.ts`

---

## Priority

**HIGH** — This page is used every analysis session (we just created 8 notes today). The current flat list will become completely unmanageable as we continue tracking predictions weekly.

---

*Plan created July 20, 2026.*

# Backtest Async Execution Plan

## Problem

Backtesting (especially optimization with 30 combinations) is CPU-heavy and blocks the Django request thread for 5-60 seconds. This causes:
- Nginx 504 timeouts on large universes
- Browser hanging with no feedback
- Web server thread exhaustion under concurrent users

## Solution: Celery + Polling

```
Current (synchronous):
  Frontend → POST /backtest/run/ → [waits 30s] → Response

Proposed (async):
  Frontend → POST /backtest/run/ → 202 {task_id: "abc123"}
  Frontend → GET /backtest/status/abc123/ → {state: "RUNNING", progress: 40%}
  Frontend → GET /backtest/status/abc123/ → {state: "RUNNING", progress: 80%}
  Frontend → GET /backtest/status/abc123/ → {state: "SUCCESS", result: {...}}
```

## Architecture

### Backend Changes

#### 1. New Model: BacktestResult

```python
# backend/stock/models/backtest.py
class BacktestResult(models.Model):
    """Stores async backtest results."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    strategy = models.CharField(max_length=64)
    params = models.JSONField(default=dict)
    symbols = models.JSONField(default=list)
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Status
    state = models.CharField(max_length=20, default="PENDING")  # PENDING, RUNNING, SUCCESS, FAILURE
    progress = models.IntegerField(default=0)  # 0-100
    
    # Results (populated on completion)
    result = models.JSONField(null=True)
    error = models.TextField(null=True)
    
    created = models.DateTimeField(auto_now_add=True)
    completed = models.DateTimeField(null=True)
    
    class Meta:
        ordering = ["-created"]
```

#### 2. Celery Tasks

```python
# backend/stock/tasks.py (additions)

@app.task(queue="backtest", bind=True)
def run_backtest_task(self, user_id, strategy_name, symbols, start_date, end_date, initial_cash, strategy_params):
    """Run a single backtest asynchronously."""
    from stock.backtesting.engine import BacktestEngine
    from stock.backtesting.strategies import STRATEGY_REGISTRY
    from stock.models.backtest import BacktestResult
    
    result_obj = BacktestResult.objects.get(id=self.request.id)
    result_obj.state = "RUNNING"
    result_obj.save()
    
    try:
        strategy_class = STRATEGY_REGISTRY[strategy_name]
        strategy = strategy_class(**strategy_params)
        engine = BacktestEngine(strategy, symbols, start_date, end_date, initial_cash)
        result = engine.run()
        
        result_obj.state = "SUCCESS"
        result_obj.result = result
        result_obj.completed = timezone.now()
        result_obj.save()
    except Exception as e:
        result_obj.state = "FAILURE"
        result_obj.error = str(e)
        result_obj.save()


@app.task(queue="backtest", bind=True)
def run_optimize_task(self, user_id, strategy_name, symbols, start_date, end_date, initial_cash):
    """Run parameter optimization asynchronously with progress updates."""
    from stock.backtesting.strategies import STRATEGY_REGISTRY
    from stock.models.backtest import BacktestResult
    from itertools import product
    
    result_obj = BacktestResult.objects.get(id=self.request.id)
    result_obj.state = "RUNNING"
    result_obj.save()
    
    try:
        strategy_class = STRATEGY_REGISTRY[strategy_name]
        schema = strategy_class.params_schema()
        
        # Build grid
        param_ranges = {p["key"]: [int(p["min"] + i * (p["max"]-p["min"])/2) for i in range(3)] for p in schema}
        keys = list(param_ranges.keys())
        all_combos = list(product(*[param_ranges[k] for k in keys]))[:30]
        
        results_list = []
        for i, combo in enumerate(all_combos):
            # Update progress
            result_obj.progress = int((i + 1) / len(all_combos) * 100)
            result_obj.save(update_fields=["progress"])
            
            # Run backtest for this combo
            strategy_params = dict(zip(keys, combo))
            # ... run engine, collect results ...
        
        result_obj.state = "SUCCESS"
        result_obj.result = {"top_10": results_list[:10], ...}
        result_obj.completed = timezone.now()
        result_obj.save()
    except Exception as e:
        result_obj.state = "FAILURE"
        result_obj.error = str(e)
        result_obj.save()
```

#### 3. Updated API

```python
class BacktestViewSet(viewsets.ViewSet):
    
    @action(detail=False, methods=["post"])
    def run(self, request):
        """Submit backtest — returns task_id immediately."""
        # Validate params...
        
        result_obj = BacktestResult.objects.create(
            id=uuid.uuid4(),
            user=request.user,
            strategy=strategy_name,
            symbols=symbols,
            start_date=start_date,
            end_date=end_date,
        )
        
        run_backtest_task.apply_async(
            args=[request.user.id, strategy_name, symbols, ...],
            task_id=str(result_obj.id),
        )
        
        return Response({"task_id": str(result_obj.id)}, status=202)
    
    @action(detail=True, methods=["get"], url_path="status")
    def status(self, request, pk=None):
        """Poll for backtest status + results."""
        result = BacktestResult.objects.filter(id=pk, user=request.user).first()
        if not result:
            return Response({"error": "Not found"}, status=404)
        
        data = {
            "state": result.state,
            "progress": result.progress,
        }
        if result.state == "SUCCESS":
            data["result"] = result.result
        elif result.state == "FAILURE":
            data["error"] = result.error
        
        return Response(data)
    
    @action(detail=False, methods=["get"])
    def history(self, request):
        """List past backtest results."""
        results = BacktestResult.objects.filter(user=request.user)[:20]
        return Response([...])
```

### Frontend Changes

```jsx
// Submit backtest
const runBacktest = async () => {
  setLoading(true);
  const resp = await api.post("/backtest/run/", payload);
  const taskId = resp.data.task_id;
  
  // Start polling
  const interval = setInterval(async () => {
    const status = await api.get(`/backtest/${taskId}/status/`);
    setProgress(status.data.progress);
    
    if (status.data.state === "SUCCESS") {
      clearInterval(interval);
      setResults(status.data.result);
      setLoading(false);
    } else if (status.data.state === "FAILURE") {
      clearInterval(interval);
      setError(status.data.error);
      setLoading(false);
    }
  }, 2000); // Poll every 2 seconds
};
```

### Celery Queue

Add new queue to docker-compose celery command:
```yaml
celery:
  command: celery -A fin.celery worker -Q summary,stock,statement,price,news,backtest -l INFO
```

## Implementation Steps

| Step | Scope | Effort |
|------|-------|--------|
| 1 | `BacktestResult` model + migration | Small |
| 2 | Celery tasks (`run_backtest_task`, `run_optimize_task`) | Medium |
| 3 | Update `BacktestViewSet` (submit + poll endpoints) | Medium |
| 4 | Add `backtest` queue to Celery worker | Small |
| 5 | Frontend: polling logic + progress bar | Medium |
| 6 | Frontend: history list (past backtests) | Small |

**Total: ~200 lines backend + 50 lines frontend changes. 1 session.**

## Bonus: Progress Bar UI

```
┌─────────────────────────────────────────────┐
│ ⏳ Running Optimization...                   │
│ ████████████░░░░░░░░░░ 60% (18/30 combos)  │
│ Current best: +22.4% (RSI 25, target 20%)   │
└─────────────────────────────────────────────┘
```

## Priority

**MEDIUM** — The current sync approach works for small universes (2-5 stocks, 1-3 years). Async is needed when:
- Testing all 49 stocks
- Running optimization on full Darwin universe (24 stocks)
- Multiple users running simultaneous backtests

For now, the workaround is: keep stock universe small in the UI (select a sector with 5-10 stocks).

---

*Plan created July 30, 2026.*

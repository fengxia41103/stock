# Retirement — Target Asset Allocation (whole net worth)

Created: 2026-11-02 | Analysis, not advice. Figures are the user's own plan;
account values from the Nov-02-2026 Fidelity CSV (snapshot — they drift daily).

> In-app representation: a `MySector` named **"retirement"** (id 11) holds the
> 19 trackable target tickers so they show up together in the UI "portfolio"
> (watchlist) view. BUT `MySector` has no weight/dollar field — it only groups
> symbols. The weighted allocation below is the part the model can't store, so
> it lives here. (The 529 fund NHX202764 is not a public ticker / not in
> yahooquery, so it's excluded from the sector but counted in net worth below.)

## Net worth across accounts (~$638,701)

| Account | Value | % of net worth | Nature |
|---|---:|---:|---|
| Rollover IRA (230806312) | ~$551,683 | 86.4% | the rebalance account (tax-free) |
| Tianqi 529 (618600479) | ~$77,091 | 12.1% | education — NH 529 (NHX202764), not retirement |
| Roth IRA (231855464) | ~$9,129 | 1.4% | VOO + cash (tax-free) |
| HSA (218801562) | ~$798 | 0.1% | cash sweep |
| **Total** | **~$638,701** | **100%** | |

Note: the 529 is earmarked for education, not retirement — included for a true
net-worth picture but NOT part of the retirement allocation targets below.

## Rollover IRA — TARGET end-state (post-rebalance, 70/30 core/satellite)

Weights from the governing allocation decision (revised 70/30 split). Dollars =
weight x ~$551,683 (will be re-struck at execution-day values).

| Asset class | Target % | Target $ | Vehicles |
|---|---:|---:|---|
| US Large Cap | 42% | ~$231,707 | VOO + large satellites (MSFT, MA, V, GOOGL, SPGI) |
| Intl Developed | 20% | ~$110,337 | VEA |
| Bonds / Fixed Income | 10% | ~$55,168 | BND |
| US Mid Cap | 8% | ~$44,135 | VO + RCL |
| Emerging Markets | 7% | ~$38,618 | VWO + TSM |
| US Small Cap | 6% | ~$33,101 | VB |
| Real Assets / REIT | 4% | ~$22,067 | VNQ |
| Cash sleeve | 3% | ~$16,550 | FDRXX |
| **Total** | **100%** | **~$551,683** | |

### Satellite sleeve (~30%, <=$30K/name except MSFT Option-B $48K)
KEEP: MSFT ~$48K (Option B), MA ~$24K, V ~$19K, RCL ~$17K, LIN ~$9K, PG ~$9K,
TXN ~$9K, GOOGL ~$8K, PEP ~$7K, TSM ~$3.5K (trimmed), SPGI ~$5K. + LRCX start
~$5.5K.
EXITED (not retained): PDD done, MCD done (both 11-02), PLTR (take profit),
SBUX (loser) — remaining on 11-10.

## Gap: current vs target (what the rebalance closes)
- US large-cap growth OVERWEIGHT (SPYG 38.8% + MSFT 14.3%) -> trim SPYG ~$176K
  (staged 4 wks) + MSFT -> $48K.
- Non-US UNDERWEIGHT (~0 now) -> biggest add: VEA 20% + VWO 7%.
- Bonds UNDERWEIGHT (~0 now) -> BND 10% (de-risking glide path toward 2036).
- Mid/small/REIT thin -> VO / VB / VNQ.

See `rebalance-schedule-2026-11.md` (execution) and
`allocation-decision-2026-10-30.md` (source of truth).

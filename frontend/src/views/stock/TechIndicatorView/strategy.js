// Aligns the chart's combined verdict with the user's strategy + allocation,
// reading the LIVE portfolio (the source of truth) rather than a static plan.
//
// Role is derived from current holdings so it self-maintains after a rebalance:
//   • not held          -> research only (no thesis / not in the book yet)
//   • held, broad ETF   -> core index sleeve: rebalance on schedule, not on TA
//   • held, single name -> satellite (conviction): weakness feeds scale-in,
//                          sized within the per-name cap; show room vs cap
//
// Forward intent like "being exited" is NOT guessed from holdings — once a
// position is sold the symbol simply drops to "not held", which is correct.
//
// Reference data that does NOT drift with the portfolio: the set of broad
// index ETFs (an ETF stays an ETF) and the per-name satellite cap. These are
// policy constants, not position data. Update CAP if the plan's cap changes.

// Per-name satellite cap from the allocation plan (~$30K/name).
const SATELLITE_CAP = 30000;

// Broad index ETFs used as the core sleeve. This is instrument reference data
// (stable), not holdings data — holdings/values come from the API.
const CORE_ETFS = new Set([
  "VOO", "SPYG", "VO", "VB", "VEA", "VWO", "BND", "VNQ", "VTI", "SPY", "QQQ",
  "AGG", "SCHB", "IVV",
]);

// Given live holdings { positions: [...] }, build symbol -> position lookup.
export function indexHoldings(holdings) {
  const map = {};
  const positions = (holdings && holdings.positions) || [];
  for (const p of positions) {
    if (p && p.symbol) map[String(p.symbol).toUpperCase()] = p;
  }
  return map;
}

const fmtUsd = (n) =>
  n == null
    ? ""
    : `$${Math.round(n).toLocaleString("en-US")}`;

// Overlay the plan onto a combined verdict using live holdings.
export function applyStrategy(verdict, symbol, holdings) {
  if (!verdict) return verdict;
  const sym = symbol ? String(symbol).toUpperCase() : null;
  const bySym = indexHoldings(holdings);
  const pos = sym ? bySym[sym] : null;
  const held = pos && (pos.market_value || 0) > 0;

  // Not held -> research only.
  if (!held) {
    return {
      ...verdict,
      planLabel: "Not held",
      planRole: "none",
      advice: `${verdict.advice} (You don't hold ${sym || "this name"} — treat as research only until it earns a thesis and a place in the plan.)`,
    };
  }

  const mv = pos.market_value || 0;
  const isCore = CORE_ETFS.has(sym);

  if (isCore) {
    return {
      ...verdict,
      planLabel: "Core / index",
      planRole: "core",
      advice: `This is a core index holding (${fmtUsd(mv)}) — you rebalance it on your fixed schedule, you don't trade it on technicals. The chart is context only. TA read: ${verdict.advice}`,
    };
  }

  // Satellite (conviction single name): TA feeds the scale-in decision.
  const room = SATELLITE_CAP - mv;
  const capNote =
    room > 1000
      ? `Room to add ~${fmtUsd(room)} within the ${fmtUsd(SATELLITE_CAP)} cap.`
      : room > 0
        ? `Near the ${fmtUsd(SATELLITE_CAP)} cap — little room left.`
        : `At/over the ${fmtUsd(SATELLITE_CAP)} cap — hold, don't add.`;

  let lead;
  if (room <= 0) {
    lead =
      "Satellite name at its cap — hold; the cap controls concentration, so don't add even on weakness.";
  } else if (verdict.tone === "good") {
    lead =
      "Satellite name on weakness — the setup your scale-in rule likes. Confirm valuation (margin of safety) before adding.";
  } else if (verdict.tone === "warn") {
    lead =
      "Satellite name — hold; don't add here. Wait for weakness plus a valuation case.";
  } else {
    lead = "Satellite name — let valuation lead; the chart alone isn't a trigger.";
  }

  return {
    ...verdict,
    planLabel: "Satellite (conviction)",
    planRole: "satellite",
    advice: `${lead} Current: ${fmtUsd(mv)}. ${capNote} TA read: ${verdict.advice}`,
  };
}

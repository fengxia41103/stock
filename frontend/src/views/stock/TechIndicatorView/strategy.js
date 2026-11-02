// Maps a ticker to the user's own strategy + allocation plan so the chart's
// combined verdict can speak in the plan's language, not generic TA.
//
// Source of truth: docs/analysis/allocation-decision-2026-10-30.md
// (incl. the 2026-11-01 70/30 revision) and the Oct-30 bad-day-dip notes.
// This is the user's chosen plan, re-stated for the UI — analysis, not advice.
//
// role:
//   "core"      index ETFs — don't time with TA; rebalance on the schedule.
//   "satellite" conviction single names, each capped ~$30K; add on weakness.
//   "sell"      losers / take-profit — being exited; TA dips are not buys.
//
// note: a short, stock-specific reminder appended to the verdict advice.

const PLAN = {
  // --- Core index sleeve (~70%): do not time these ---
  VOO: { role: "core" },
  SPYG: { role: "core", note: "Being staged down (SPYG→diversified over 4 weeks). Follow the schedule, not the chart." },
  VO: { role: "core" },
  VB: { role: "core" },
  VEA: { role: "core", note: "A buy target in the rebalance (int'l developed, under-weight). Accumulate on the schedule." },
  VWO: { role: "core" },
  BND: { role: "core", note: "Bond sleeve — glide toward 20-25% by 2036. TA doesn't apply." },
  VNQ: { role: "core" },

  // --- Satellite sleeve (~30%, ≤$30K/name): add quality on weakness ---
  MSFT: { role: "satellite", note: "At the $30K cap — hold, don't add even on weakness (cap controls concentration)." },
  MA: { role: "satellite" },
  V: { role: "satellite" },
  RCL: { role: "satellite" },
  LIN: { role: "satellite", note: "Quality non-tech compounder kept for diversification." },
  PG: { role: "satellite", note: "Quality non-tech staple kept for diversification." },
  PEP: { role: "satellite", note: "Quality non-tech staple kept for diversification." },
  SPGI: { role: "satellite", note: "Quality non-tech (financial data) kept for diversification." },
  TXN: { role: "satellite", note: "Thesis confirmed (analog-duopoly moat); entered on the inventory-cycle turn." },
  GOOGL: { role: "satellite", note: "Under-weight + pre-authorized staged add toward 5-6% (Darwin PASS, clean PE ~14). Weakness is a tranche opportunity IF the capex-payback thesis holds." },
  LRCX: { role: "satellite", note: "Small starter with room to add lower until the AI-capex question resolves — weakness improves the entry." },
  TSM: { role: "satellite", note: "Geopolitical-tail rule: keep small, accumulate only on further weakness; being trimmed toward ~$3.5K." },

  // --- Being exited: dips are not buy signals here ---
  PLTR: { role: "sell", note: "Taking profit (unplanned +675% winner, no entry thesis) — exiting, not adding." },
  PDD: { role: "sell", note: "Loser failing the Darwin gate — being sold. A dip is not a buy." },
  SBUX: { role: "sell", note: "Trim/exit candidate — resolve on a calm day, not a panic dip." },
  MCD: { role: "sell", note: "Folding into the index core — not a satellite add." },
};

export function planFor(symbol) {
  if (!symbol) return null;
  return PLAN[String(symbol).toUpperCase()] || null;
}

// Overlay the plan onto a combined verdict: adjust the "what to do" line so it
// reflects this stock's role in the allocation, not just the TA reading.
export function applyStrategy(verdict, symbol) {
  if (!verdict) return verdict;
  const plan = planFor(symbol);
  if (!plan) {
    // Unknown ticker (e.g. a watchlist name not in the plan).
    return {
      ...verdict,
      planLabel: "Not in your plan",
      advice: `${verdict.advice} (This name isn't in your allocation plan — treat as research only until it earns a thesis.)`,
    };
  }

  const roleLabel =
    plan.role === "core"
      ? "Core / index"
      : plan.role === "satellite"
        ? "Satellite (conviction)"
        : "Being exited";

  let lead;
  if (plan.role === "core") {
    lead =
      "This is a core index holding — you rebalance it on a fixed schedule, you don't trade it on technicals. The chart is context only.";
  } else if (plan.role === "sell") {
    lead =
      "This is on your exit list — a technical dip is NOT a buy signal here; it's being sold per the plan.";
  } else {
    // satellite: TA actually feeds the scale-in decision
    lead =
      verdict.tone === "good"
        ? "Satellite name on weakness — the setup your scale-in rule likes. Size within the ~$30K cap and confirm valuation (margin of safety) before adding."
        : verdict.tone === "warn"
          ? "Satellite name — hold; don't add here. Wait for weakness + a valuation case within the ~$30K cap."
          : "Satellite name — let valuation lead; the chart alone isn't a trigger.";
  }

  const advice = plan.note
    ? `${lead} ${plan.note} — TA read: ${verdict.advice}`
    : `${lead} TA read: ${verdict.advice}`;

  return { ...verdict, planLabel: roleLabel, planRole: plan.role, advice };
}

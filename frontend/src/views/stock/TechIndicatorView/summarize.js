// Plain-language reader for the selected indicator over the in-scope bars.
//
// These are lightweight re-computations of common indicators (not meant to
// match klinecharts to the decimal) whose only job is to turn the latest
// reading + recent trend into a clear sentence. This is analysis, not advice.
//
// Each reader returns:
//   { tone: "good" | "warn" | "bad" | "neutral",
//     headline: string,       // short verdict, e.g. "Oversold"
//     points: string[] }      // supporting plain-language bullets
//
// `bars` are the chart's kline rows: { timestamp, open, high, low, close, volume }.

const last = (arr) => arr[arr.length - 1];
const closes = (bars) => bars.map((b) => b.close);
const round = (n, d = 2) =>
  n == null || Number.isNaN(n) ? null : Number(n.toFixed(d));

// --- building blocks -------------------------------------------------------

function sma(values, period) {
  if (values.length < period) return null;
  let sum = 0;
  for (let i = values.length - period; i < values.length; i++) sum += values[i];
  return sum / period;
}

function emaSeries(values, period) {
  if (values.length < period) return [];
  const k = 2 / (period + 1);
  const out = [];
  let prev = sma(values.slice(0, period), period);
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

// Wilder's RSI over the whole series; returns the latest value.
function rsi(values, period = 14) {
  if (values.length <= period) return null;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gain += diff;
    else loss -= diff;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const up = diff > 0 ? diff : 0;
    const down = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + up) / period;
    avgLoss = (avgLoss * (period - 1) + down) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function stdev(values, period) {
  if (values.length < period) return null;
  const slice = values.slice(values.length - period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
  return Math.sqrt(variance);
}

// --- per-indicator readers -------------------------------------------------

function readRsi(bars) {
  const v = rsi(closes(bars));
  if (v == null) return null;
  const r = round(v, 1);
  if (v < 30)
    return {
      tone: "good",
      headline: `Oversold (RSI ${r})`,
      points: [
        "Momentum is washed out — the kind of reading your framework treats as a scale-in zone.",
        "Your own caveat: RSI-oversold is NOT the same as Graham-cheap if the stock fell from a bubble. Check valuation, not just the dip.",
      ],
    };
  if (v > 70)
    return {
      tone: "warn",
      headline: `Overbought (RSI ${r})`,
      points: [
        "Momentum is hot and stretched up — a poor spot to add to a position.",
        "For a long-term holder this is a 'don't chase' signal, not necessarily a sell.",
      ],
    };
  if (v >= 55)
    return {
      tone: "neutral",
      headline: `Firm (RSI ${r})`,
      points: ["Momentum leans positive but not extreme — nothing pressing to act on."],
    };
  if (v <= 40)
    return {
      tone: "warn",
      headline: `Weakening (RSI ${r})`,
      points: [
        "Momentum is slipping toward oversold. Watch — if it keeps falling toward ~30 it enters your scale-in zone.",
      ],
    };
  return {
    tone: "neutral",
    headline: `Neutral (RSI ${r})`,
    points: ["Momentum is balanced — no strong signal either way."],
  };
}

function readBoll(bars) {
  const c = closes(bars);
  const mid = sma(c, 20);
  const sd = stdev(c, 20);
  if (mid == null || sd == null) return null;
  const upper = mid + 2 * sd;
  const lower = mid - 2 * sd;
  const price = last(c);
  const pctB = (price - lower) / (upper - lower); // 0 = lower band, 1 = upper
  if (pctB <= 0.1)
    return {
      tone: "good",
      headline: "Riding the lower band",
      points: [
        "Price is pinned to the bottom of its recent range — stretched low, the setup your strategy likes for scaling into quality.",
        "Confirm it's noise, not a broken thesis, before adding.",
      ],
    };
  if (pctB >= 0.9)
    return {
      tone: "warn",
      headline: "Riding the upper band",
      points: ["Price is stretched to the top of its range — extended, a poor spot to add."],
    };
  return {
    tone: "neutral",
    headline: "Mid-range",
    points: [
      `Price sits around the middle of its Bollinger range (${Math.round(pctB * 100)}% of the band).`,
      "No volatility extreme to act on.",
    ],
  };
}

function readTrend(bars, label) {
  const c = closes(bars);
  const fast = sma(c, 10);
  const slow = sma(c, 30);
  if (fast == null || slow == null)
    return {
      tone: "neutral",
      headline: "Not enough data",
      points: [`Need more bars in view to read the ${label} trend. Widen the date range.`],
    };
  const price = last(c);
  const aboveSlow = price > slow;
  const fastAboveSlow = fast > slow;
  if (fastAboveSlow && aboveSlow)
    return {
      tone: "good",
      headline: "Uptrend intact",
      points: [
        "Short average is above the long average and price is above both — a healthy, trending backdrop for a hold.",
      ],
    };
  if (!fastAboveSlow && !aboveSlow)
    return {
      tone: "bad",
      headline: "Downtrend",
      points: [
        "Short average is below the long average and price is under both — the trend is down. Adding here is catching a falling trend; wait for stabilization or a valuation case.",
      ],
    };
  return {
    tone: "warn",
    headline: "Trend turning / mixed",
    points: [
      "Price and its averages are crossing — the trend is in transition. Watch for a clean break before acting.",
    ],
  };
}

function readBias(bars) {
  const c = closes(bars);
  const mean = sma(c, 20);
  if (mean == null) return null;
  const bias = ((last(c) - mean) / mean) * 100;
  const b = round(bias, 1);
  if (bias <= -8)
    return {
      tone: "good",
      headline: `Far below trend (BIAS ${b}%)`,
      points: [
        "Price is unusually far under its 20-day average — a deep, stretched dip. Pairs with scale-in sizing IF the thesis holds.",
      ],
    };
  if (bias >= 8)
    return {
      tone: "warn",
      headline: `Far above trend (BIAS +${b}%)`,
      points: ["Price is stretched well above its average — extended, not a spot to add."],
    };
  return {
    tone: "neutral",
    headline: `Near trend (BIAS ${b}%)`,
    points: ["Price is close to its average — no stretch to exploit."],
  };
}

function readMacd(bars) {
  const c = closes(bars);
  const e12 = emaSeries(c, 12);
  const e26 = emaSeries(c, 26);
  if (!e12.length || !e26.length) return null;
  const n = c.length;
  const macdLine = [];
  for (let i = 0; i < n; i++) {
    if (e12[i] != null && e26[i] != null) macdLine[i] = e12[i] - e26[i];
  }
  const compact = macdLine.filter((x) => x != null);
  const signal = emaSeries(compact, 9);
  const m = last(compact);
  const s = last(signal);
  if (m == null || s == null) return null;
  const hist = m - s;
  const prevHist =
    compact.length > 1 && signal.length > 1
      ? compact[compact.length - 2] - signal[signal.length - 2]
      : hist;
  if (hist > 0 && hist >= prevHist)
    return {
      tone: "good",
      headline: "Momentum building up",
      points: ["MACD is above its signal and the gap is widening — upward momentum is strengthening."],
    };
  if (hist < 0 && hist <= prevHist)
    return {
      tone: "bad",
      headline: "Momentum rolling over",
      points: [
        "MACD is below its signal and the gap is widening down — an alarming signal that selling pressure is building.",
      ],
    };
  return {
    tone: "warn",
    headline: "Momentum fading",
    points: ["MACD and its signal are converging — the current move is losing steam."],
  };
}

function readVolume(bars) {
  const vols = bars.map((b) => b.volume || 0);
  const avg = sma(vols, Math.min(20, vols.length));
  if (avg == null || avg === 0) return null;
  const latest = last(vols);
  const ratio = latest / avg;
  const up = last(bars).close >= last(bars).open;
  if (ratio >= 1.5)
    return {
      tone: up ? "good" : "bad",
      headline: up ? "Heavy buying volume" : "Heavy selling volume",
      points: [
        `Latest volume is ${round(ratio, 1)}x its recent average — ${
          up
            ? "the up-move has real participation behind it."
            : "the down-move is backed by conviction selling. Take the drop seriously."
        }`,
      ],
    };
  return {
    tone: "neutral",
    headline: "Normal volume",
    points: ["Volume is near its recent average — no unusual participation to flag."],
  };
}

function readObv(bars) {
  let obv = 0;
  const series = [];
  for (let i = 1; i < bars.length; i++) {
    const d = bars[i].close - bars[i - 1].close;
    obv += d > 0 ? bars[i].volume : d < 0 ? -bars[i].volume : 0;
    series.push(obv);
  }
  if (series.length < 10) return null;
  const recent = series.slice(-10);
  const rising = recent[recent.length - 1] > recent[0];
  const priceRising = last(bars).close > bars[bars.length - 10].close;
  if (rising && !priceRising)
    return {
      tone: "good",
      headline: "Quiet accumulation",
      points: [
        "Volume flow (OBV) is rising while price is flat/down — a hint of accumulation under the surface. Constructive for a conviction hold.",
      ],
    };
  if (!rising && priceRising)
    return {
      tone: "warn",
      headline: "Rally not confirmed",
      points: [
        "Price is up but OBV isn't following — the move lacks volume support. Be skeptical of the rally.",
      ],
    };
  return {
    tone: rising ? "good" : "neutral",
    headline: rising ? "Volume flow rising" : "Volume flow flat",
    points: [
      rising
        ? "On-balance volume is trending up, confirming buying interest."
        : "On-balance volume is flat — no strong accumulation or distribution signal.",
    ],
  };
}

// Map registry key -> reader. Keys without a tailored reader fall back to the
// MA/EMA trend read so every selection still gets a sentence.
const READERS = {
  rsi: readRsi,
  bollinger: readBoll,
  bias: readBias,
  macd: readMacd,
  vol: readVolume,
  obv: readObv,
  ma: (b) => readTrend(b, "moving-average"),
  ema: (b) => readTrend(b, "EMA"),
  bbi: (b) => readTrend(b, "BBI"),
  heikin: (b) => readTrend(b, "trend"),
};

// Public: produce a summary for the selected indicator over the in-scope bars.
export function summarizeIndicator(spec, bars) {
  if (!spec || !bars || bars.length < 5) return null;
  const reader = READERS[spec.key] || ((b) => readTrend(b, "price"));
  const result = reader(bars);
  if (!result) return null;
  return {
    ...result,
    scope: `Based on ${bars.length} bars in view.`,
  };
}

// --- combined verdict ------------------------------------------------------
//
// Fuses the four dimensions below into ONE clear top-line call, so a user
// doesn't need to know which chart to read in which context:
//   • Trend   (MA 10 vs 30, price vs averages)  -> direction
//   • Momentum(RSI, MACD histogram)             -> oversold / overbought / rolling
//   • Stretch (Bollinger %B, BIAS)              -> how extended vs its own range
//   • Volume  (latest vs avg, up/down)          -> conviction behind the move
//
// Decision logic mirrors the strategy: DIRECTION first, then STRETCH, then the
// valuation caveat. "Down but oversold" => caution (falling knife), not a buy.

function trendState(bars) {
  const c = closes(bars);
  const fast = sma(c, 10);
  const slow = sma(c, 30);
  if (fast == null || slow == null) return 0;
  const price = last(c);
  if (fast > slow && price > slow) return 1; // up
  if (fast < slow && price < slow) return -1; // down
  return 0; // mixed
}

function momentumState(bars) {
  const v = rsi(closes(bars));
  if (v == null) return { score: 0, rsi: null };
  let score = 0;
  if (v < 30) score = -2; // oversold (selling exhausted)
  else if (v <= 40) score = -1;
  else if (v >= 70) score = 2; // overbought
  else if (v >= 55) score = 1;
  return { score, rsi: round(v, 1) };
}

function stretchState(bars) {
  const c = closes(bars);
  const mid = sma(c, 20);
  const sd = stdev(c, 20);
  if (mid == null || sd == null) return 0;
  const pctB = (last(c) - (mid - 2 * sd)) / (4 * sd); // 0 low band .. 1 high band
  if (pctB <= 0.1) return -1; // stretched low
  if (pctB >= 0.9) return 1; // stretched high
  return 0;
}

function volumeState(bars) {
  const vols = bars.map((b) => b.volume || 0);
  const avg = sma(vols, Math.min(20, vols.length));
  if (!avg) return { heavy: false, up: null };
  const ratio = last(vols) / avg;
  return { heavy: ratio >= 1.5, up: last(bars).close >= last(bars).open };
}

export function combinedVerdict(bars) {
  if (!bars || bars.length < 15) return null;

  const trend = trendState(bars); // -1 / 0 / 1
  const mom = momentumState(bars); // {score, rsi}
  const stretch = stretchState(bars); // -1 / 0 / 1
  const vol = volumeState(bars); // {heavy, up}

  const factors = [];
  factors.push({
    label: "Trend",
    text: trend > 0 ? "Uptrend" : trend < 0 ? "Downtrend" : "Sideways / turning",
    tone: trend > 0 ? "good" : trend < 0 ? "bad" : "warn",
  });
  factors.push({
    label: "Momentum",
    text:
      mom.rsi == null
        ? "n/a"
        : mom.score <= -2
          ? `Oversold (RSI ${mom.rsi})`
          : mom.score >= 2
            ? `Overbought (RSI ${mom.rsi})`
            : `Neutral (RSI ${mom.rsi})`,
    tone: mom.score <= -2 ? "good" : mom.score >= 2 ? "warn" : "neutral",
  });
  factors.push({
    label: "Stretch",
    text:
      stretch < 0
        ? "Stretched low"
        : stretch > 0
          ? "Stretched high"
          : "Mid-range",
    tone: stretch < 0 ? "good" : stretch > 0 ? "warn" : "neutral",
  });
  factors.push({
    label: "Volume",
    text: vol.heavy
      ? vol.up
        ? "Heavy buying"
        : "Heavy selling"
      : "Normal",
    tone: vol.heavy ? (vol.up ? "good" : "bad") : "neutral",
  });

  // --- decide the single headline (direction first) ---
  let tone;
  let headline;
  let advice;

  if (trend > 0) {
    // Uptrend
    if (mom.score >= 2 || stretch > 0) {
      tone = "warn";
      headline = "Uptrend, but extended";
      advice =
        "Healthy trend yet stretched to the upside. Hold; don't chase — a better add comes on a pullback.";
    } else if (mom.score <= -2 || stretch < 0) {
      tone = "good";
      headline = "Uptrend, pulled back";
      advice =
        "The best setup for your style: a quality name in an uptrend that just dipped. Confirm valuation, then this is a candidate to scale in.";
    } else {
      tone = "good";
      headline = "Healthy uptrend";
      advice = "Trend is up and not stretched. Fine to hold; add on dips, not here.";
    }
  } else if (trend < 0) {
    // Downtrend
    if (mom.score <= -2 || stretch < 0) {
      tone = "warn";
      headline = "Falling, but oversold";
      advice =
        "This is the tricky one: price is in a downtrend AND oversold — a possible bounce, but 'oversold can stay oversold.' Do NOT buy on the oversold reading alone. Your rule: RSI-oversold is not Graham-cheap if it fell from a bubble. Do the valuation work first.";
    } else if (vol.heavy && !vol.up) {
      tone = "bad";
      headline = "Falling on heavy volume";
      advice =
        "Downtrend with conviction selling behind it — an alarming combination. Stand aside; let it stabilize before considering anything.";
    } else {
      tone = "bad";
      headline = "Downtrend";
      advice =
        "Direction is down and not yet stretched. Catching this is a falling knife — wait for stabilization or a clear valuation case.";
    }
  } else {
    // Sideways / transitioning
    if (mom.score <= -2 || stretch < 0) {
      tone = "neutral";
      headline = "Basing, leaning oversold";
      advice =
        "No clear trend, but momentum is washed out. Watch for a turn; a confirmed uptrend off this base is a cleaner entry than guessing the bottom.";
    } else if (mom.score >= 2 || stretch > 0) {
      tone = "warn";
      headline = "Rangebound, near the top";
      advice = "Choppy and extended within its range. No edge to act on — wait.";
    } else {
      tone = "neutral";
      headline = "No clear signal";
      advice =
        "Trend and momentum are both neutral. Nothing actionable from the charts right now; let valuation drive the decision.";
    }
  }

  return { tone, headline, advice, factors, scope: `Based on ${bars.length} bars.` };
}

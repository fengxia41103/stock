// Registry of klinecharts built-in technical indicators, categorized and
// annotated for learning. `overlay: true` draws on the price (candle) pane;
// otherwise the indicator gets its own sub-pane below.
//
// `starter: true` marks indicators that fit a long-horizon, quality/value,
// scale-in-on-weakness strategy (buy-and-hold with rebalancing) — as opposed
// to short-term momentum/day-trading tools. These are surfaced first.

export const INDICATORS = [
  // --- Trend / overlays ---
  {
    key: "ma",
    name: "MA",
    label: "Moving Average (MA)",
    overlay: true,
    group: "Trend",
    starter: true,
    desc: "Simple moving averages (5/10/30/60). The big-picture trend: is price above or below its long-term average? Rising long MAs = healthy uptrend. Good context for a buy-and-hold name.",
  },
  {
    key: "ema",
    name: "EMA",
    label: "Exponential MA (EMA)",
    overlay: true,
    group: "Trend",
    starter: true,
    desc: "Like MA but weights recent prices more, so it reacts faster. Use the same way as MA for trend; the gap between a fast and slow EMA hints at momentum shifts.",
  },
  {
    key: "bbi",
    name: "BBI",
    label: "Bull & Bear Index (BBI)",
    overlay: true,
    group: "Trend",
    desc: "The average of several moving averages — one smoothed trend line. Price above BBI = bullish bias, below = bearish.",
  },
  {
    key: "sar",
    name: "SAR",
    label: "Parabolic SAR",
    overlay: true,
    group: "Trend",
    desc: "Dots that trail price and flip sides when the trend reverses — a trailing stop/exit tool. More useful for timing exits than for long-term holds.",
  },
  {
    key: "bollinger",
    name: "BOLL",
    label: "Bollinger Bands (BOLL)",
    overlay: true,
    group: "Volatility",
    starter: true,
    desc: "A moving average with bands at ±2 standard deviations. Price near the lower band = stretched low vs its own recent range — supports scaling in when a quality name is extended, not chasing the upper band.",
  },

  // --- Momentum / oscillators (own pane) ---
  {
    key: "rsi",
    name: "RSI",
    label: "Relative Strength Index (RSI)",
    overlay: false,
    group: "Momentum",
    starter: true,
    desc: "0–100 momentum. Below ~30 = oversold, above ~70 = overbought. Your framework already uses RSI ~30 as a scale-in trigger — but remember: RSI-oversold is not the same as Graham-cheap if the stock fell from a bubble.",
  },
  {
    key: "bias",
    name: "BIAS",
    label: "Bias (BIAS)",
    overlay: false,
    group: "Momentum",
    starter: true,
    desc: "How far (%) price has deviated from its moving average. Large negative bias = unusually far below trend — a clean 'how stretched is this dip?' read that pairs with scale-in sizing.",
  },
  {
    key: "macd",
    name: "MACD",
    label: "MACD",
    overlay: false,
    group: "Momentum",
    desc: "Difference between a fast and slow EMA, plus a signal line and histogram. Crossovers flag momentum turns. Popular with traders; for a long-term holder it is secondary context.",
  },
  {
    key: "kdj",
    name: "KDJ",
    label: "Stochastics (KDJ)",
    overlay: false,
    group: "Momentum",
    desc: "Where the close sits within the recent high-low range (0–100). Like RSI, flags overbought/oversold; the J line exaggerates extremes.",
  },
  {
    key: "wr",
    name: "WR",
    label: "Williams %R",
    overlay: false,
    group: "Momentum",
    desc: "Another overbought/oversold oscillator (inverted scale). Redundant with RSI/KDJ — pick one you like.",
  },
  {
    key: "cci",
    name: "CCI",
    label: "Commodity Channel Index (CCI)",
    overlay: false,
    group: "Momentum",
    desc: "Measures deviation from an average price; ±100 marks unusual moves. Used to spot overextension.",
  },
  {
    key: "roc",
    name: "ROC",
    label: "Rate of Change (ROC)",
    overlay: false,
    group: "Momentum",
    desc: "Percent change over N periods — raw momentum. Zero line crossings mark acceleration/deceleration.",
  },
  {
    key: "mtm",
    name: "MTM",
    label: "Momentum (MTM)",
    overlay: false,
    group: "Momentum",
    desc: "Price now minus price N periods ago. Simple momentum; above/below zero is the read.",
  },
  {
    key: "psy",
    name: "PSY",
    label: "Psychological Line (PSY)",
    overlay: false,
    group: "Momentum",
    desc: "Share of up-days over a window — a crowd-sentiment gauge. High = optimistic (possibly overbought).",
  },
  {
    key: "ao",
    name: "AO",
    label: "Awesome Oscillator (AO)",
    overlay: false,
    group: "Momentum",
    desc: "Difference of two moving averages of the midpoint price. Histogram around zero for momentum.",
  },
  {
    key: "trix",
    name: "TRIX",
    label: "TRIX",
    overlay: false,
    group: "Momentum",
    desc: "Triple-smoothed rate of change — filters out noise to show the underlying momentum trend.",
  },
  {
    key: "bias2",
    name: "BRAR",
    label: "BRAR",
    overlay: false,
    group: "Momentum",
    desc: "Two lines (AR energy, BR willingness) gauging buying vs selling pressure. Niche sentiment tool.",
  },
  {
    key: "dma",
    name: "DMA",
    label: "Difference of MA (DMA)",
    overlay: false,
    group: "Trend",
    desc: "Difference between a short and long moving average, plotted as an oscillator — a trend-strength read.",
  },
  {
    key: "dmi",
    name: "DMI",
    label: "Directional Movement (DMI/ADX)",
    overlay: false,
    group: "Trend",
    desc: "+DI/−DI show direction; ADX shows trend strength (not direction). High ADX = strong trend worth respecting.",
  },

  // --- Volume ---
  {
    key: "vol",
    name: "VOL",
    label: "Volume (VOL)",
    overlay: false,
    group: "Volume",
    starter: true,
    desc: "Trading volume with moving averages. Confirms moves: a drop on heavy volume is more meaningful than one on light volume. A sanity check, not a trigger.",
  },
  {
    key: "obv",
    name: "OBV",
    label: "On-Balance Volume (OBV)",
    overlay: false,
    group: "Volume",
    starter: true,
    desc: "Running total that adds volume on up-days and subtracts on down-days. Rising OBV while price is flat hints at quiet accumulation — useful confirmation for a conviction hold.",
  },
  {
    key: "vr",
    name: "VR",
    label: "Volume Ratio (VR)",
    overlay: false,
    group: "Volume",
    desc: "Ratio of up-volume to down-volume over a window — a volume-based overbought/oversold gauge.",
  },
  {
    key: "pvt",
    name: "PVT",
    label: "Price-Volume Trend (PVT)",
    overlay: false,
    group: "Volume",
    desc: "Like OBV but weights by percent price change — ties volume flow to the size of each move.",
  },
  {
    key: "emv",
    name: "EMV",
    label: "Ease of Movement (EMV)",
    overlay: false,
    group: "Volume",
    desc: "How easily price moves relative to volume. High EMV = price rising on light volume (moves easily).",
  },
  {
    key: "cr",
    name: "CR",
    label: "CR Index",
    overlay: false,
    group: "Momentum",
    desc: "Energy/intermediate-willingness index with multiple moving averages. Niche; measures buying strength.",
  },

  // --- Special candle style (computed, not a klinecharts indicator) ---
  {
    key: "heikin",
    name: "HEIKIN",
    label: "Heikin-Ashi candles",
    overlay: true,
    group: "Candle style",
    special: "heikin",
    desc: "Not an indicator but an alternative candle calculation that smooths noise so trends/reversals read more clearly. A long run of same-color candles = a persistent trend.",
  },
];

export const INDICATOR_MAP = Object.fromEntries(
  INDICATORS.map((i) => [i.key, i]),
);

export const STARTERS = INDICATORS.filter((i) => i.starter);

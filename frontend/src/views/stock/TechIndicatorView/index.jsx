import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dispose, init } from "klinecharts";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StarIcon from "@mui/icons-material/Star";
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import StockHistoricalContext from "@Views/stock/StockHistoricalView/context";
import StockDetailContext from "@Views/stock/StockDetailView/context";

import { INDICATOR_MAP, INDICATORS, STARTERS } from "./indicators";
import { summarizeIndicator, combinedVerdict } from "./summarize";
import { applyStrategy } from "./strategy";

// Legacy route keys from the old nav menu -> registry keys.
const LEGACY_ALIAS = { stochastics: "kdj", elder: "ema", sar: "sar" };

const toKLineData = (rows) =>
  rows
    .map((d) => ({
      timestamp: new Date(d.on).getTime(),
      open: d.open_price,
      high: d.high_price,
      low: d.low_price,
      close: d.close_price,
      volume: d.vol,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

// OHLC -> Heikin-Ashi candles.
const toHeikinAshi = (bars) => {
  const out = [];
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const haClose = (b.open + b.high + b.low + b.close) / 4;
    const haOpen =
      i === 0 ? (b.open + b.close) / 2 : (out[i - 1].open + out[i - 1].close) / 2;
    out.push({
      timestamp: b.timestamp,
      open: haOpen,
      close: haClose,
      high: Math.max(b.high, haOpen, haClose),
      low: Math.min(b.low, haOpen, haClose),
      volume: b.volume,
    });
  }
  return out;
};

// Build the grouped <Select> options: starters first, then by group.
const GROUPS = ["Trend", "Volatility", "Momentum", "Volume", "Candle style"];

const TechIndicatorView = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const data = useContext(StockHistoricalContext);
  const stock = useContext(StockDetailContext);
  const symbol = stock && stock.symbol;
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  // Tone -> emoji + color for the summary card.
  const TONE = {
    good: { emoji: "🟢", color: theme.palette.success.main },
    warn: { emoji: "⚠️", color: theme.palette.warning.main },
    bad: { emoji: "🔴", color: theme.palette.error.main },
    neutral: { emoji: "⚪", color: theme.palette.text.secondary },
  };

  // Resolve the initial indicator key from the route (with legacy aliases).
  const initialKey = useMemo(() => {
    const k = LEGACY_ALIAS[type] || type;
    return INDICATOR_MAP[k] ? k : "rsi";
  }, [type]);

  const [selected, setSelected] = useState(initialKey);
  useEffect(() => setSelected(initialKey), [initialKey]);

  const spec = INDICATOR_MAP[selected] || INDICATOR_MAP.rsi;

  // Plain-language read of the selected indicator over the in-scope bars.
  const summary = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null;
    const bars = toKLineData(data);
    const scoped = spec.special === "heikin" ? toHeikinAshi(bars) : bars;
    return summarizeIndicator(spec, scoped);
  }, [data, spec]);

  // Combined, indicator-independent top-line verdict over the full window,
  // then overlaid with this stock's role in the user's allocation plan.
  const overall = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null;
    const v = combinedVerdict(toKLineData(data));
    return applyStrategy(v, symbol);
  }, [data, symbol]);

  const handleChange = (e) => {
    const key = e.target.value;
    setSelected(key);
    // Keep the URL in sync so links/back work. Absolute path avoids relative
    // resolution stacking onto the current :type segment.
    navigate(`/stocks/${id}/historical/indicator/${key}`, { replace: true });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    if (!Array.isArray(data) || data.length === 0) return undefined;

    const grid = theme.palette.divider;
    const axisText = theme.palette.text.secondary;
    const up = theme.palette.success.main;
    const down = theme.palette.error.main;

    const chart = init(el, {
      styles: {
        grid: {
          horizontal: { color: grid },
          vertical: { color: grid },
        },
        candle: {
          type: "candle_solid",
          bar: { upColor: up, downColor: down, noChangeColor: axisText },
          priceMark: { high: { color: axisText }, low: { color: axisText } },
          tooltip: { text: { color: theme.palette.text.primary } },
        },
        indicator: {
          tooltip: { text: { color: theme.palette.text.primary } },
        },
        xAxis: { axisLine: { color: grid }, tickText: { color: axisText } },
        yAxis: { axisLine: { color: grid }, tickText: { color: axisText } },
        crosshair: {
          horizontal: { text: { backgroundColor: theme.palette.primary.main } },
          vertical: { text: { backgroundColor: theme.palette.primary.main } },
        },
      },
    });
    chartRef.current = chart;

    const bars = toKLineData(data);
    const klineData = spec.special === "heikin" ? toHeikinAshi(bars) : bars;
    chart.applyNewData(klineData);

    const fitToWidth = () => {
      const { width } = chart.getSize("candle_pane", "main") || { width: 0 };
      if (width > 0 && klineData.length > 0) {
        chart.setBarSpace(
          Math.min(30, Math.max(2, (width - 8) / klineData.length)),
        );
      }
    };
    chart.setOffsetRightDistance(0);
    fitToWidth();

    // Always show volume unless the selected indicator IS volume-based in-pane.
    if (spec.name !== "VOL") {
      chart.createIndicator("VOL", false, { id: "pane_vol" });
    }

    // Heikin-Ashi is a candle style, not an indicator; everything else maps to
    // a klinecharts built-in placed on the candle pane (overlay) or its own.
    if (spec.special !== "heikin") {
      if (spec.overlay) {
        chart.createIndicator(spec.name, true, { id: "candle_pane" });
      } else {
        chart.createIndicator(spec.name, false, { id: `pane_${spec.name}` });
      }
    }

    fitToWidth();
    const ro = new ResizeObserver(() => {
      chart.resize();
      fitToWidth();
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      dispose(el);
      chartRef.current = null;
    };
  }, [data, spec, theme]);

  return (
    <Card>
      <CardContent>
        {overall && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 1,
              border: 2,
              borderColor: TONE[overall.tone].color,
              bgcolor: "action.hover",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: 22, lineHeight: 1 }}>
                {TONE[overall.tone].emoji}
              </Typography>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ color: TONE[overall.tone].color }}
              >
                {overall.headline}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                · overall read
              </Typography>
              {overall.planLabel && (
                <Chip
                  size="small"
                  label={overall.planLabel}
                  color={
                    overall.planRole === "satellite"
                      ? "primary"
                      : overall.planRole === "sell"
                        ? "error"
                        : "default"
                  }
                  variant="outlined"
                />
              )}
            </Stack>
            <Typography variant="body2" sx={{ color: "text.primary", mb: 1 }}>
              {overall.advice}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              sx={{ mb: 0.5 }}
            >
              {overall.factors.map((f) => (
                <Chip
                  key={f.label}
                  size="small"
                  variant="outlined"
                  label={`${f.label}: ${f.text}`}
                  sx={{ borderColor: TONE[f.tone].color, color: TONE[f.tone].color }}
                />
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {overall.scope} Combines trend, momentum, stretch and volume. A
              data read of the chart, not financial advice.
            </Typography>
          </Box>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
          sx={{ mb: 1.5 }}
        >
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="indicator-label">Indicator</InputLabel>
            <Select
              labelId="indicator-label"
              label="Indicator"
              value={selected}
              onChange={handleChange}
            >
              <ListSubheader>★ Starters (match your strategy)</ListSubheader>
              {STARTERS.map((i) => (
                <MenuItem key={`s-${i.key}`} value={i.key}>
                  <StarIcon
                    fontSize="inherit"
                    sx={{ mr: 1, color: "warning.main" }}
                  />
                  {i.label}
                </MenuItem>
              ))}
              {GROUPS.flatMap((g) => {
                const items = INDICATORS.filter((i) => i.group === g);
                if (!items.length) return [];
                return [
                  <ListSubheader key={`h-${g}`}>{g}</ListSubheader>,
                  ...items.map((i) => (
                    <MenuItem key={i.key} value={i.key}>
                      {i.label}
                    </MenuItem>
                  )),
                ];
              })}
            </Select>
          </FormControl>

          {spec.starter && (
            <Chip
              icon={<StarIcon />}
              label="Starter for your strategy"
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
        </Stack>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            mb: 1.5,
            p: 1.5,
            borderRadius: 1,
            bgcolor: "action.hover",
          }}
        >
          <InfoOutlinedIcon fontSize="small" sx={{ color: "primary.main", mt: 0.25 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {spec.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {spec.desc}
            </Typography>
          </Box>
        </Box>

        <Box ref={containerRef} sx={{ width: "100%", height: 560 }} />

        {summary && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              border: 1,
              borderColor: TONE[summary.tone].color,
              bgcolor: "action.hover",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: 18, lineHeight: 1 }}>
                {TONE[summary.tone].emoji}
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                sx={{ color: TONE[summary.tone].color }}
              >
                {summary.headline}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                · {spec.label}
              </Typography>
            </Stack>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {summary.points.map((p, idx) => (
                <Typography
                  key={idx}
                  component="li"
                  variant="body2"
                  sx={{ color: "text.primary", mb: 0.25 }}
                >
                  {p}
                </Typography>
              ))}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.75 }}
            >
              {summary.scope} This is a data read of the chart, not financial
              advice.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TechIndicatorView;

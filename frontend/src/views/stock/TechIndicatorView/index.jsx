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

import { INDICATOR_MAP, INDICATORS, STARTERS } from "./indicators";

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
  const { type } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const data = useContext(StockHistoricalContext);
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  // Resolve the initial indicator key from the route (with legacy aliases).
  const initialKey = useMemo(() => {
    const k = LEGACY_ALIAS[type] || type;
    return INDICATOR_MAP[k] ? k : "rsi";
  }, [type]);

  const [selected, setSelected] = useState(initialKey);
  useEffect(() => setSelected(initialKey), [initialKey]);

  const spec = INDICATOR_MAP[selected] || INDICATOR_MAP.rsi;

  const handleChange = (e) => {
    const key = e.target.value;
    setSelected(key);
    // Keep the URL in sync so links/back work.
    navigate(`../indicator/${key}`, { relative: "path", replace: true });
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
      </CardContent>
    </Card>
  );
};

export default TechIndicatorView;

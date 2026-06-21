import React from "react";
import ReactEChartsCore from "echarts-for-react";
import {
  Typography,
  Box,
  Chip,
  Menu,
  MenuItem,
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

const getEChartsTheme = () =>
  localStorage.getItem("themeMode") === "dark" ? "dark" : undefined;

// HighchartGraph using ECharts
export const HighchartGraph = ({
  type,
  categories,
  data,
  title,
  xLabel,
  yLabel,
  legendEnabled,
}) => {
  const isBubble = type === "bubble";

  const mapType = (t) => {
    switch (t) {
      case "column":
        return "bar";
      case "areaspline":
        return "line";
      case "bubble":
        return "scatter";
      default:
        return t || "line";
    }
  };

  const series = (data || []).map((s) => {
    const base = {
      name: s.name,
      type: mapType(type),
      data: isBubble
        ? (s.data || []).map((p) => [p.x, p.y, p.z || 10])
        : s.data,
    };
    if (type === "areaspline") {
      base.smooth = true;
      base.areaStyle = { opacity: 0.3 };
    }
    if (s.lineWidth) base.lineStyle = { width: s.lineWidth };
    if (s.visible === false) base.show = false;
    return base;
  });

  const option = {
    title: title ? { text: title } : undefined,
    tooltip: isBubble ? { trigger: "item" } : { trigger: "axis" },
    legend: legendEnabled ? { data: data?.map((s) => s.name) } : undefined,
    xAxis: isBubble
      ? { type: "value", name: xLabel || "" }
      : { type: "category", data: categories || [], name: xLabel || "" },
    yAxis: { type: "value", name: yLabel || "", scale: true },
    series,
    dataZoom: isBubble ? undefined : [{ type: "inside" }, { type: "slider" }],
  };

  if (isBubble) {
    option.visualMap = {
      show: false,
      dimension: 2,
      inRange: { symbolSize: [10, 60] },
    };
  }

  return (
    <ReactEChartsCore
      theme={getEChartsTheme()}
      option={option}
      style={{ height: "100%", minHeight: 500 }}
    />
  );
};

// MultilineChart
export const MultilineChart = ({
  data,
  category_by,
  label_by,
  data_by,
  normalized,
  ...rest
}) => {
  if (data && category_by && data_by) {
    // data is array of {symbol, data: [{on, close_price, ...}]}
    const categories =
      data.length > 0
        ? [...new Set(data[0].data.map((d) => d[category_by]))]
        : [];
    const series = data.map((group) => {
      let values = group.data.map((d) => d[data_by]);
      if (normalized && values.length > 0 && values[0] !== 0) {
        const base = values[0];
        values = values.map((v) => ((v - base) / Math.abs(base)) * 100);
      }
      return { name: group[label_by] || group.symbol || "", data: values };
    });
    return (
      <HighchartGraph
        type="line"
        categories={categories}
        data={series}
        title=""
        yLabel=""
        legendEnabled
      />
    );
  }
  return <HighchartGraph {...rest} />;
};

// ColoredNumber
export const ColoredNumber = ({ val, unit, roundTo }) => {
  const num = parseFloat(val);
  const color = num >= 0 ? "green" : "red";
  const decimals = roundTo != null ? roundTo : 2;
  const display = isNaN(num) ? "-" : `${num.toFixed(decimals)}${unit || ""}`;
  return <span style={{ color, fontWeight: "bold" }}>{display}</span>;
};

// RankChart using ECharts bar
export const RankChart = ({
  data,
  categories,
  title,
  ranks,
  rank_val_name,
}) => {
  let chartCategories = categories;
  let chartData = data;

  if (ranks && rank_val_name) {
    chartCategories = ranks.map((r) => r.symbol || r.name || "");
    chartData = ranks.map((r) => r[rank_val_name] || 0);
  }

  const option = {
    title: title ? { text: title } : undefined,
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: chartCategories || [] },
    yAxis: { type: "value" },
    series: [{ type: "bar", data: chartData || [] }],
  };
  return (
    <ReactEChartsCore
      theme={getEChartsTheme()}
      option={option}
      style={{ flex: 1, height: "100%", minHeight: 300 }}
    />
  );
};

// ABDonutChart
export const ABDonutChart = ({ data, title, subheader }) => {
  let pieData;
  if (data && data.A && data.B) {
    pieData = [
      { name: data.A.label, value: data.A.val },
      { name: data.B.label, value: data.B.val },
    ];
  } else {
    pieData = data || [];
  }
  const chartTitle = data?.name || title || "";
  const option = {
    title: {
      text: chartTitle,
      subtext: subheader || "",
      left: "center",
      top: 0,
    },
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "60%"],
        data: pieData,
      },
    ],
  };
  return (
    <ReactEChartsCore
      theme={getEChartsTheme()}
      option={option}
      style={{ height: 250 }}
    />
  );
};

// DictCard
export const DictCard = ({ data, interests, title }) => {
  const entries = interests
    ? Object.entries(interests).filter(([k]) => data && data[k] !== undefined)
    : data
    ? Object.entries(data)
    : [];
  return (
    <Box>
      {title && <Typography variant="h6">{title}</Typography>}
      {entries.map(([k, label]) => (
        <Box key={k} display="flex" justifyContent="space-between" py={0.5}>
          <Typography variant="body2">{interests ? label : k}</Typography>
          <Typography variant="body2" fontWeight="bold">
            {data && data[k] != null
              ? typeof data[k] === "number"
                ? data[k].toFixed(4)
                : Array.isArray(data[k])
                ? `[${data[k].length} items]`
                : String(data[k])
              : "-"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// DictTable
export const DictTable = ({ data, title, interests, chart }) => {
  const [showPctChange, setShowPctChange] = React.useState(false);

  // If data is an array of objects with 'on' field (financial statements), render time-series table
  if (Array.isArray(data) && data.length > 0 && data[0].on && interests) {
    const fields = Object.entries(interests); // [[fieldKey, label], ...]

    const formatVal = (val) => {
      if (val == null) return "-";
      if (typeof val !== "number") return String(val);
      return val.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const cellColor = (val) => {
      if (typeof val !== "number") return undefined;
      if (val > 0) return "#4caf50";
      if (val < 0) return "#f44336";
      return undefined;
    };

    // Compute period-over-period % change
    const getPctChange = (key, idx) => {
      if (idx === 0) return null;
      const prev = data[idx - 1][key];
      const curr = data[idx][key];
      if (!prev || typeof prev !== "number" || typeof curr !== "number") return null;
      return ((curr - prev) / Math.abs(prev)) * 100;
    };

    // Mini sparkline SVG for a row
    const Sparkline = ({ values }) => {
      const nums = values.filter((v) => typeof v === "number");
      if (nums.length < 2) return null;
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const range = max - min || 1;
      const w = 60;
      const h = 18;
      const points = nums
        .map((v, i) => `${(i / (nums.length - 1)) * w},${h - ((v - min) / range) * h}`)
        .join(" ");
      return (
        <svg width={w} height={h} style={{ verticalAlign: "middle" }}>
          <polyline points={points} fill="none" stroke="#1976d2" strokeWidth="1.5" />
        </svg>
      );
    };

    return (
      <Box>
        {title && <Typography variant="h6">{title}</Typography>}
        <Box sx={{ mb: 1 }}>
          <Button
            size="small"
            variant={showPctChange ? "contained" : "outlined"}
            onClick={() => setShowPctChange(!showPctChange)}
            sx={{ textTransform: "none", fontSize: "0.75rem" }}
          >
            {showPctChange ? "Show Values" : "Show % Change"}
          </Button>
        </Box>
        <Box sx={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: 4, textAlign: "left" }}>Metric</th>
                <th style={{ padding: 4, textAlign: "center" }}>Trend</th>
                {data.map((d) => (
                  <th key={d.on} style={{ padding: 4, textAlign: "right" }}>
                    {d.on}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map(([key, label]) => (
                <tr key={key}>
                  <td style={{ padding: 4, borderBottom: "1px solid #eee" }}>
                    {label}
                  </td>
                  <td style={{ padding: 4, borderBottom: "1px solid #eee", textAlign: "center" }}>
                    <Sparkline values={data.map((d) => d[key])} />
                  </td>
                  {data.map((d, idx) => {
                    const val = showPctChange ? getPctChange(key, idx) : d[key];
                    const display = showPctChange && val != null ? `${val > 0 ? "+" : ""}${val.toFixed(1)}%` : formatVal(d[key]);
                    return (
                      <td
                        key={d.on}
                        style={{
                          padding: 4,
                          borderBottom: "1px solid #eee",
                          textAlign: "right",
                          color: cellColor(showPctChange ? val : d[key]),
                          fontWeight: typeof d[key] === "number" ? 500 : "normal",
                        }}
                      >
                        {showPctChange && idx === 0 ? "-" : display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        {chart && data.length > 1 && interests && (
          <Box mt={2}>
            <ReactEChartsCore
              theme={getEChartsTheme()}
              option={{
                tooltip: { trigger: "axis" },
                legend: { data: fields.slice(0, 5).map(([, l]) => l) },
                xAxis: { type: "category", data: data.map((d) => d.on) },
                yAxis: { type: "value", scale: true },
                series: fields.slice(0, 5).map(([key, label]) => ({
                  name: label,
                  type: "line",
                  data: data.map((d) => d[key]),
                  showSymbol: false,
                })),
                dataZoom: [{ type: "inside" }],
              }}
              style={{ height: 300 }}
            />
          </Box>
        )}
      </Box>
    );
  }

  // Fallback: simple key-value table
  return (
    <Box>
      {title && <Typography variant="h6">{title}</Typography>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {data &&
            Object.entries(data).map(([k, v]) => (
              <tr key={k}>
                <td style={{ padding: 4, borderBottom: "1px solid #eee" }}>
                  {k}
                </td>
                <td
                  style={{
                    padding: 4,
                    borderBottom: "1px solid #eee",
                    textAlign: "right",
                  }}
                >
                  {v != null
                    ? typeof v === "number"
                      ? v.toFixed(4)
                      : String(v)
                    : "-"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Box>
  );
};

// DropdownMenu
export const DropdownMenu = ({ label, title, children, content }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const displayLabel = label || title || "Menu";
  const displayContent = children || content;
  return (
    <>
      <Button onClick={(e) => setAnchorEl(e.currentTarget)}>
        {displayLabel}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        keepMounted
      >
        {displayContent &&
          React.Children.map(displayContent, (child, i) => (
            <MenuItem key={i} onClick={() => setAnchorEl(null)}>
              {child}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

// HighlightedText
export const HighlightedText = ({ children, color, highlights, text, val }) => {
  const bg =
    typeof highlights === "object"
      ? highlights?.background
      : highlights || color || "#ffeb3b";
  const fg = typeof highlights === "object" ? highlights?.font : undefined;
  const display = text || children;
  return (
    <span
      style={{
        backgroundColor: bg,
        color: fg,
        padding: "2px 6px",
        borderRadius: 4,
      }}
    >
      {display}
      {val != null
        ? ` (${typeof val === "number" ? val.toFixed(2) : val})`
        : ""}
    </span>
  );
};

// Logo
export const Logo = ({ src, alt }) => (
  <img src={src || "/logo192.png"} alt={alt || "logo"} style={{ height: 40 }} />
);

// Page
export const Page = ({ children }) => <Box p={2}>{children}</Box>;

// NotFoundView
export const NotFoundView = () => (
  <Box p={4} textAlign="center">
    <Typography variant="h4">404 - Not Found</Typography>
  </Box>
);

// SimpleSnackbar
export const SimpleSnackbar = ({ msg, open, message, onClose }) => {
  const displayMsg = msg || message || "";
  const isOpen = open !== undefined ? open : !!displayMsg;
  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={3000}
      onClose={onClose}
      message={displayMsg}
    />
  );
};

// MenuBar
export const MenuBar = ({ root, title, items }) => (
  <Box display="inline-flex" alignItems="center" mr={2}>
    <DropdownMenu label={title}>
      {(items || []).map((item) => (
        <a
          key={item.url}
          href={`${root}/${item.url}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {item.text}
        </a>
      ))}
    </DropdownMenu>
  </Box>
);

// TimeSeriesColumnChart
export const TimeSeriesColumnChart = ({ data, name }) => {
  const categories = (data || []).map((d) => d.on || d.date || d.x || "");
  const values = (data || []).map((d) => d.val || d.value || d.y || 0);
  const option = {
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value" },
    series: [{ name: name || "", type: "bar", data: values }],
    dataZoom: [{ type: "inside" }, { type: "slider" }],
  };
  return (
    <ReactEChartsCore
      theme={getEChartsTheme()}
      option={option}
      style={{ height: 300 }}
    />
  );
};

// AsDialog
export const AsDialog = ({ open, title, children, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    {title && <DialogTitle>{title}</DialogTitle>}
    <DialogContent>{children}</DialogContent>
  </Dialog>
);

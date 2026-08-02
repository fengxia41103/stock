/**
 * Shared UI components — replaces @/components/shared
 * These are thin wrappers around MUI components.
 */
import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from "@mui/material";

// --- Page Shell ---
export const Page = ({ title, children }) => (
  <Box p={2}>
    {title && (
      <Typography variant="h5" fontWeight={700} mb={2}>
        {title}
      </Typography>
    )}
    {children}
  </Box>
);

// --- 404 ---
export const NotFoundView = () => (
  <Box p={4} textAlign="center">
    <Typography variant="h4">404 — Not Found</Typography>
  </Box>
);

// --- ColoredNumber ---
export const ColoredNumber = ({ val, unit, roundTo }) => {
  const num = parseFloat(val);
  const color = num >= 0 ? "#10b981" : "#ef4444";
  const decimals = roundTo != null ? roundTo : 2;
  const display = isNaN(num) ? "-" : `${num.toFixed(decimals)}${unit || ""}`;
  return <span style={{ color, fontWeight: "bold" }}>{display}</span>;
};

// --- SimpleSnackbar ---
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

// --- DropdownMenu ---
export const DropdownMenu = ({ label, title, children, content }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const displayLabel = label || title || "Menu";
  const displayContent = children || content;
  return (
    <>
      <Button size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
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

// --- HighlightedText ---
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

// --- Logo ---
export const Logo = ({ src, alt }) => (
  <img src={src || "/logo192.png"} alt={alt || "logo"} style={{ height: 40 }} />
);

// --- DictCard (key-value display) ---
export const DictCard = ({ data, interests, title }) => {
  const entries = interests
    ? Object.entries(interests).filter(([k]) => data && data[k] !== undefined)
    : data
    ? Object.entries(data)
    : [];
  return (
    <Box>
      {title && (
        <Typography variant="h6" mb={1}>
          {title}
        </Typography>
      )}
      {entries.map(([k, label]) => (
        <Box key={k} display="flex" justifyContent="space-between" py={0.5}>
          <Typography variant="body2" color="text.secondary">
            {interests ? label : k}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {data && data[k] != null
              ? typeof data[k] === "number"
                ? data[k].toFixed(4)
                : String(data[k])
              : "-"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// --- HighchartGraph (Highcharts wrapper) ---
export const HighchartGraph = ({
  type,
  categories,
  data,
  title,
  xLabel,
  yLabel,
  legendEnabled,
}) => {
  const mapType = (t) => {
    switch (t) {
      case "column":
        return "column";
      case "areaspline":
        return "areaspline";
      case "bubble":
        return "bubble";
      default:
        return t || "line";
    }
  };

  const options = {
    chart: { type: mapType(type), backgroundColor: "transparent" },
    title: { text: title || null, style: { color: "#e2e8f0" } },
    xAxis: {
      categories: categories || [],
      title: { text: xLabel || "" },
      labels: { style: { color: "#94a3b8" } },
    },
    yAxis: {
      title: { text: yLabel || "" },
      labels: { style: { color: "#94a3b8" } },
    },
    legend: {
      enabled: legendEnabled !== false,
      itemStyle: { color: "#e2e8f0" },
    },
    credits: { enabled: false },
    series: (data || []).map((s) => ({
      name: s.name,
      data: s.data,
      lineWidth: s.lineWidth || 2,
      visible: s.visible !== false,
    })),
    tooltip: { shared: true },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

// --- MultilineChart ---
export const MultilineChart = ({
  data,
  category_by,
  label_by,
  data_by,
  normalized,
  ...rest
}) => {
  if (data && category_by && data_by) {
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
        legendEnabled
      />
    );
  }
  return <HighchartGraph {...rest} />;
};

// --- RankChart (bar chart for rankings) ---
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
  } else if (ranks) {
    chartCategories = ranks.map((r) => r.symbol || r.name || "");
    chartData = ranks.map((r) => r.val || 0);
  }

  const options = {
    chart: { type: "bar", backgroundColor: "transparent", height: 300 },
    title: { text: title || null, style: { color: "#e2e8f0" } },
    xAxis: {
      categories: chartCategories || [],
      labels: { style: { color: "#94a3b8" } },
    },
    yAxis: { title: { text: null }, labels: { style: { color: "#94a3b8" } } },
    legend: { enabled: false },
    credits: { enabled: false },
    series: [{ data: chartData || [], color: "#3b82f6" }],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

// --- ABDonutChart (pie/donut) ---
export const ABDonutChart = ({ data, title, subheader }) => {
  let pieData;
  if (data && data.A && data.B) {
    pieData = [
      { name: data.A.label, y: data.A.val },
      { name: data.B.label, y: data.B.val },
    ];
  } else {
    pieData = (data || []).map((d) => ({
      name: d.name,
      y: d.value || d.val || 0,
    }));
  }

  const options = {
    chart: { type: "pie", backgroundColor: "transparent", height: 250 },
    title: { text: data?.name || title || null, style: { color: "#e2e8f0" } },
    subtitle: { text: subheader || null },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        innerSize: "50%",
        dataLabels: { enabled: true, style: { color: "#e2e8f0" } },
      },
    },
    series: [{ data: pieData }],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

// --- DictTable (financial time-series table with sparklines) ---
export const DictTable = ({ data, title, interests, chart }) => {
  const [showPctChange, setShowPctChange] = React.useState(false);

  if (Array.isArray(data) && data.length > 0 && data[0].on && interests) {
    const fields = Object.entries(interests);

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
      if (val > 0) return "#10b981";
      if (val < 0) return "#ef4444";
      return undefined;
    };

    const getPctChange = (key, idx) => {
      if (idx === 0) return null;
      const prev = data[idx - 1][key];
      const curr = data[idx][key];
      if (!prev || typeof prev !== "number" || typeof curr !== "number")
        return null;
      return ((curr - prev) / Math.abs(prev)) * 100;
    };

    const Sparkline = ({ values }) => {
      const nums = values.filter((v) => typeof v === "number");
      if (nums.length < 2) return null;
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const range = max - min || 1;
      const w = 60,
        h = 18;
      const points = nums
        .map(
          (v, i) =>
            `${(i / (nums.length - 1)) * w},${h - ((v - min) / range) * h}`,
        )
        .join(" ");
      return (
        <svg width={w} height={h} style={{ verticalAlign: "middle" }}>
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />
        </svg>
      );
    };

    const visibleData = data.filter((d) =>
      fields.some(([key]) => d[key] != null && d[key] !== 0),
    );

    return (
      <Box>
        {title && (
          <Typography variant="h6" mb={1}>
            {title}
          </Typography>
        )}
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
                <th style={{ padding: 4, textAlign: "left", color: "#94a3b8" }}>
                  Metric
                </th>
                <th
                  style={{ padding: 4, textAlign: "center", color: "#94a3b8" }}
                >
                  Trend
                </th>
                {visibleData.map((d) => (
                  <th
                    key={d.on}
                    style={{ padding: 4, textAlign: "right", color: "#94a3b8" }}
                  >
                    {d.on}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map(([key, label]) => (
                <tr key={key}>
                  <td
                    style={{
                      padding: 4,
                      borderBottom: "1px solid #334155",
                      color: "#e2e8f0",
                    }}
                  >
                    {label}
                  </td>
                  <td
                    style={{
                      padding: 4,
                      borderBottom: "1px solid #334155",
                      textAlign: "center",
                    }}
                  >
                    <Sparkline values={visibleData.map((d) => d[key])} />
                  </td>
                  {visibleData.map((d, idx) => {
                    const val = showPctChange ? getPctChange(key, idx) : d[key];
                    const display =
                      showPctChange && val != null
                        ? `${val > 0 ? "+" : ""}${val.toFixed(1)}%`
                        : formatVal(d[key]);
                    return (
                      <td
                        key={d.on}
                        style={{
                          padding: 4,
                          borderBottom: "1px solid #334155",
                          textAlign: "right",
                          color: cellColor(showPctChange ? val : d[key]),
                          fontWeight:
                            typeof d[key] === "number" ? 500 : "normal",
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
      </Box>
    );
  }

  // Fallback: simple key-value table
  return (
    <Box>
      {title && (
        <Typography variant="h6" mb={1}>
          {title}
        </Typography>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {data &&
            Object.entries(data).map(([k, v]) => (
              <tr key={k}>
                <td
                  style={{
                    padding: 4,
                    borderBottom: "1px solid #334155",
                    color: "#e2e8f0",
                  }}
                >
                  {k}
                </td>
                <td
                  style={{
                    padding: 4,
                    borderBottom: "1px solid #334155",
                    textAlign: "right",
                    color: "#e2e8f0",
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

// --- TimeSeriesColumnChart ---
export const TimeSeriesColumnChart = ({ data, name }) => {
  const categories = (data || []).map((d) => d.on || d.date || d.x || "");
  const values = (data || []).map((d) => d.val || d.value || d.y || 0);

  const options = {
    chart: { type: "column", backgroundColor: "transparent", height: 300 },
    title: { text: null },
    xAxis: {
      categories,
      labels: { style: { color: "#94a3b8" }, rotation: -45 },
    },
    yAxis: { title: { text: null }, labels: { style: { color: "#94a3b8" } } },
    legend: { enabled: false },
    credits: { enabled: false },
    series: [{ name: name || "", data: values, color: "#3b82f6" }],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

// --- MenuBar ---
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

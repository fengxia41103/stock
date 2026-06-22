import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
} from "@mui/material";
import ScaleLoader from "react-spinners/ScaleLoader";

import { useStocksOverview } from "@/api";
import { Page } from "@fengxia41103/storybook";

const columns = [
  { id: "symbol", label: "Symbol", numeric: false },
  {
    id: "price",
    label: "Price",
    numeric: true,
    fmt: (v) => (v ? `$${v.toFixed(2)}` : "—"),
  },
  {
    id: "daily_return_pct",
    label: "Daily Δ%",
    numeric: true,
    fmt: (v) => (v != null ? `${v > 0 ? "+" : ""}${v.toFixed(2)}%` : "—"),
    color: true,
  },
  {
    id: "pe",
    label: "P/E",
    numeric: true,
    fmt: (v) => (v ? v.toFixed(1) : "—"),
  },
  {
    id: "pb",
    label: "P/B",
    numeric: true,
    fmt: (v) => (v ? v.toFixed(1) : "—"),
  },
  {
    id: "roe",
    label: "ROE%",
    numeric: true,
    fmt: (v) => (v ? v.toFixed(1) : "—"),
  },
  {
    id: "beta",
    label: "Beta",
    numeric: true,
    fmt: (v) => (v ? v.toFixed(2) : "—"),
  },
  {
    id: "last_lower",
    label: "Last Lower",
    numeric: true,
    fmt: (v) => v ?? "—",
  },
  {
    id: "insider_sentiment",
    label: "Insider",
    numeric: true,
    fmt: (v) => (v != null ? (v * 100).toFixed(0) + "%" : "—"),
    color: true,
  },
  { id: "sector", label: "Portfolio", numeric: false },
];

const ScreenerView = () => {
  const { data, isLoading } = useStocksOverview();
  const navigate = useNavigate();
  const [orderBy, setOrderBy] = useState("daily_return_pct");
  const [order, setOrder] = useState("desc");
  const [filter, setFilter] = useState("");

  const sorted = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    let filtered = data;
    if (filter) {
      const f = filter.toUpperCase();
      filtered = data.filter(
        (s) =>
          s.symbol.includes(f) || (s.sector || "").toUpperCase().includes(f),
      );
    }
    return [...filtered].sort((a, b) => {
      const av = a[orderBy] ?? -Infinity;
      const bv = b[orderBy] ?? -Infinity;
      return order === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });
  }, [data, orderBy, order, filter]);

  if (isLoading) return <ScaleLoader loading />;

  const handleSort = (col) => {
    setOrder(orderBy === col && order === "desc" ? "asc" : "desc");
    setOrderBy(col);
  };

  return (
    <Page title="Screener">
      <Container maxWidth={false}>
        <Box mb={2}>
          <TextField
            size="small"
            label="Filter (symbol or portfolio)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </Box>
        <TableContainer
          component={Paper}
          sx={{ maxHeight: "calc(100vh - 200px)" }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.numeric ? "right" : "left"}
                  >
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/stocks/${row.id}/historical/price`)}
                >
                  {columns.map((col) => {
                    const val = row[col.id];
                    const display = col.fmt ? col.fmt(val) : val || "—";
                    const color =
                      col.color && typeof val === "number"
                        ? val > 0
                          ? "#2e7d32"
                          : val < 0
                          ? "#c62828"
                          : undefined
                        : undefined;
                    return (
                      <TableCell
                        key={col.id}
                        align={col.numeric ? "right" : "left"}
                        sx={{ color }}
                      >
                        {col.id === "symbol" ? (
                          <strong>{display}</strong>
                        ) : (
                          display
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Page>
  );
};

export default ScreenerView;

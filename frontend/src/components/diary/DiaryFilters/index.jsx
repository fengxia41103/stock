import React from "react";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

const DiaryFilters = ({ filters, setFilters, stocks }) => {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" mb={2} useFlexGap>
      <TextField
        size="small"
        placeholder="Search symbol..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        sx={{ minWidth: 120 }}
      />

      <ToggleButtonGroup
        size="small"
        exclusive
        value={filters.judgement}
        onChange={(_, v) => v !== null && update("judgement", v)}
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="bull">
          <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> Bull
        </ToggleButton>
        <ToggleButton value="bear">
          <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} /> Bear
        </ToggleButton>
      </ToggleButtonGroup>

      <ToggleButtonGroup
        size="small"
        exclusive
        value={filters.correct}
        onChange={(_, v) => v !== null && update("correct", v)}
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="correct">✅</ToggleButton>
        <ToggleButton value="wrong">❌</ToggleButton>
      </ToggleButtonGroup>

      <Select
        size="small"
        value={filters.stock}
        onChange={(e) => update("stock", e.target.value)}
        displayEmpty
        sx={{ minWidth: 100 }}
      >
        <MenuItem value="">All Stocks</MenuItem>
        {stocks.map((s) => (
          <MenuItem key={s} value={s}>
            {s}
          </MenuItem>
        ))}
      </Select>

      <Select
        size="small"
        value={filters.period}
        onChange={(e) => update("period", e.target.value)}
        sx={{ minWidth: 110 }}
      >
        <MenuItem value="all">All Time</MenuItem>
        <MenuItem value="7d">This Week</MenuItem>
        <MenuItem value="30d">Last 30 Days</MenuItem>
        <MenuItem value="90d">Last Quarter</MenuItem>
      </Select>
    </Stack>
  );
};

export default DiaryFilters;

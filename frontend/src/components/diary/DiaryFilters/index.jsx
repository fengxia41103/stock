import PropTypes from "prop-types";
import React, { useState } from "react";

import ClearIcon from "@mui/icons-material/Clear";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Badge,
  Box,
  Button,
  Collapse,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

const DEFAULTS = {
  search: "",
  type: "all",
  judgement: "all",
  correct: "all",
  stock: "",
  period: "all",
};

// A labeled filter row: caption on top, control fills the width below it.
const Field = ({ label, children }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: "block", mb: 0.25, fontWeight: 600 }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

Field.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const groupSx = {
  width: "100%",
  "& .MuiToggleButton-root": { flex: 1, py: 0.5, textTransform: "none" },
};

const DiaryFilters = ({ filters, setFilters, stocks }) => {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const activeCount = Object.keys(DEFAULTS).filter(
    (k) => filters[k] !== DEFAULTS[k],
  ).length;

  // Count only the "advanced" filters (everything except free-text search),
  // since search has its own always-visible field.
  const advancedCount = Object.keys(DEFAULTS).filter(
    (k) => k !== "search" && filters[k] !== DEFAULTS[k],
  ).length;

  // Collapsed by default to save real estate; auto-open if advanced filters
  // are already active so they aren't hidden/forgotten.
  const [open, setOpen] = useState(advancedCount > 0);

  return (
    <Stack spacing={1} mb={2}>
      {/* Header: search + expand/collapse toggle (always visible) */}
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          size="small"
          fullWidth
          placeholder="Search title or symbol…"
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: filters.search ? (
              <InputAdornment position="end">
                <ClearIcon
                  fontSize="small"
                  sx={{ cursor: "pointer" }}
                  onClick={() => update("search", "")}
                />
              </InputAdornment>
            ) : null,
          }}
        />
        <IconButton
          size="small"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Hide filters" : "Show filters"}
          aria-expanded={open}
          color={advancedCount > 0 ? "primary" : "default"}
        >
          <Badge badgeContent={advancedCount} color="primary">
            <FilterListIcon fontSize="small" />
          </Badge>
          {open ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </IconButton>
      </Stack>

      {/* Collapsible advanced filters */}
      <Collapse in={open} unmountOnExit>
        <Stack spacing={1.25} sx={{ pt: 0.5 }}>
          {/* Type */}
          <Field label="Type">
            <ToggleButtonGroup
              size="small"
              exclusive
              value={filters.type}
              onChange={(_, v) => v !== null && update("type", v)}
              sx={groupSx}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="stock">Stock</ToggleButton>
              <ToggleButton value="general">Strategy</ToggleButton>
            </ToggleButtonGroup>
          </Field>

          {/* View / judgement */}
          <Field label="View">
            <ToggleButtonGroup
              size="small"
              exclusive
              value={filters.judgement}
              onChange={(_, v) => v !== null && update("judgement", v)}
              sx={groupSx}
            >
              <ToggleButton value="all">Any</ToggleButton>
              <ToggleButton value="bull">
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> Bull
              </ToggleButton>
              <ToggleButton value="bear">
                <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} /> Bear
              </ToggleButton>
            </ToggleButtonGroup>
          </Field>

          {/* Outcome / correctness */}
          <Field label="Outcome">
            <ToggleButtonGroup
              size="small"
              exclusive
              value={filters.correct}
              onChange={(_, v) => v !== null && update("correct", v)}
              sx={groupSx}
            >
              <ToggleButton value="all">Any</ToggleButton>
              <ToggleButton value="correct">✅ Right</ToggleButton>
              <ToggleButton value="wrong">❌ Wrong</ToggleButton>
            </ToggleButtonGroup>
          </Field>

          {/* Stock + period: responsive grid — stacked on xs, two cols from sm */}
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Field label="Symbol">
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={filters.stock}
                  onChange={(e) => update("stock", e.target.value)}
                >
                  <MenuItem value="">All symbols</MenuItem>
                  {stocks.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Field>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Field label="Period">
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={filters.period}
                  onChange={(e) => update("period", e.target.value)}
                >
                  <MenuItem value="all">All time</MenuItem>
                  <MenuItem value="7d">This week</MenuItem>
                  <MenuItem value="30d">Last 30 days</MenuItem>
                  <MenuItem value="90d">Last quarter</MenuItem>
                </TextField>
              </Field>
            </Grid>
          </Grid>

          {/* Active filters + reset */}
          {activeCount > 0 && (
            <Button
              size="small"
              variant="text"
              color="inherit"
              startIcon={<ClearIcon fontSize="small" />}
              onClick={() => setFilters(DEFAULTS)}
              sx={{ alignSelf: "flex-start", textTransform: "none" }}
            >
              Clear filters ({activeCount})
            </Button>
          )}
        </Stack>
      </Collapse>
    </Stack>
  );
};

DiaryFilters.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    type: PropTypes.string,
    judgement: PropTypes.string,
    correct: PropTypes.string,
    stock: PropTypes.string,
    period: PropTypes.string,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  stocks: PropTypes.arrayOf(PropTypes.string),
};

DiaryFilters.defaultProps = {
  stocks: [],
};

export default DiaryFilters;

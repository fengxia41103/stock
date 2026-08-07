import React, { useContext, useState } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import { useResource, useCreate, useUpdate } from "@/api";
import StockDetailContext from "@Views/stock/StockDetailView/context";

const EDGE_TYPES = [
  { value: "behavioral", label: "Behavioral / Time-Arbitrage" },
  { value: "analytical", label: "Analytical" },
  { value: "informational", label: "Informational" },
];

const GROWTH_ASSESSMENTS = [
  { value: "too_high", label: "Too High (market too optimistic)" },
  { value: "about_right", label: "About Right" },
  { value: "too_low", label: "Too Low (market too pessimistic)" },
];

const REFLEXIVITY_CHOICES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const CYCLE_PHASES = [
  { value: "", label: "Not Applicable" },
  { value: "peak", label: "🔴 Peak" },
  { value: "falling", label: "🟡 Falling" },
  { value: "trough", label: "🟢 Trough" },
  { value: "rising", label: "🔵 Rising" },
];

const STATUS_CHOICES = [
  { value: "active", label: "Active" },
  { value: "watchlist", label: "Watchlist" },
  { value: "avoid", label: "Avoid" },
];

const emptyThesis = {
  edge_type: "behavioral",
  variant_perception: "",
  driver_1: "",
  driver_2: "",
  driver_3: "",
  implied_growth_rate: null,
  growth_assessment: "about_right",
  rerate_mechanism: "",
  rerate_timeframe: "",
  reflexivity_risk: "low",
  bull_price: null,
  bull_probability: null,
  base_price: null,
  base_probability: null,
  bear_price: null,
  bear_probability: null,
  kill_criterion_1: "",
  kill_criterion_2: "",
  kill_criterion_3: "",
  stop_loss_price: null,
  capital_cycle_phase: "",
  status: "active",
  notes: "",
};

const Section = ({ title, children }) => (
  <Paper sx={{ p: 2.5, mb: 2 }}>
    <Typography variant="h6" gutterBottom color="primary">
      {title}
    </Typography>
    {children}
  </Paper>
);

const ThesisView = () => {
  const stock = useContext(StockDetailContext);
  const { data, isLoading, refetch } = useResource(
    ["thesis", String(stock.id)],
    `/theses/?stock=${stock.id}`,
  );

  const createMutation = useCreate(`/theses/`, ["thesis", String(stock.id)]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyThesis);

  const thesis = data?.results?.[0] || null;

  const updateMutation = useUpdate(thesis ? `/theses/${thesis.id}/` : "", [
    "thesis",
    String(stock.id),
  ]);

  const startEdit = () => {
    setForm(thesis || { ...emptyThesis });
    setEditing(true);
  };

  const handleSave = async () => {
    const payload = { ...form, stock: stock.id };
    // Clean null strings to null
    for (const key of [
      "implied_growth_rate",
      "bull_price",
      "bull_probability",
      "base_price",
      "base_probability",
      "bear_price",
      "bear_probability",
      "stop_loss_price",
    ]) {
      if (payload[key] === "" || payload[key] === undefined)
        payload[key] = null;
      else payload[key] = Number(payload[key]);
    }

    if (thesis) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
    setEditing(false);
    refetch();
  };

  const Field = ({
    label,
    field,
    multiline,
    select,
    options,
    type = "text",
    helperText,
  }) => (
    <TextField
      label={label}
      value={form[field] ?? ""}
      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
      fullWidth
      size="small"
      multiline={multiline}
      minRows={multiline ? 2 : undefined}
      select={select}
      type={type}
      helperText={helperText}
      disabled={!editing}
      sx={{ mb: 1.5 }}
    >
      {options?.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );

  if (isLoading) return <ScaleLoader loading />;

  // Display mode (no thesis yet)
  if (!thesis && !editing) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Investment Thesis — {stock.symbol}
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No thesis documented for this position. You're flying blind on key
          drivers, kill criteria, and re-rating mechanism.
        </Alert>
        <Button variant="contained" onClick={startEdit}>
          Create Thesis
        </Button>
      </Box>
    );
  }

  // If viewing (not editing) existing thesis
  if (thesis && !editing) {
    const fmt = (v) => (v != null ? Number(v).toFixed(2) : "—");
    const pct = (v) => (v != null ? `${Number(v).toFixed(1)}%` : "—");

    return (
      <Box>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h5">
            Investment Thesis — {stock.symbol}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={thesis.status.toUpperCase()}
              color={
                thesis.status === "active"
                  ? "success"
                  : thesis.status === "avoid"
                  ? "error"
                  : "default"
              }
              size="small"
            />
            {thesis.is_stale && (
              <Chip
                label={`STALE (${thesis.days_since_review}d)`}
                color="warning"
                size="small"
              />
            )}
            <Button startIcon={<EditIcon />} onClick={startEdit} size="small">
              Edit
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          {/* Edge & Variant Perception */}
          <Grid item xs={12}>
            <Section title="Step 1: Edge & Variant Perception">
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Edge Type:{" "}
                <strong>
                  {EDGE_TYPES.find((e) => e.value === thesis.edge_type)?.label}
                </strong>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontStyle: "italic",
                  bgcolor: "action.hover",
                  p: 1.5,
                  borderRadius: 1,
                }}
              >
                "{thesis.variant_perception || "Not documented"}"
              </Typography>
            </Section>
          </Grid>

          {/* Key Drivers */}
          <Grid item xs={12} md={6}>
            <Section title="Step 4: Key Drivers">
              <Stack spacing={1}>
                {[thesis.driver_1, thesis.driver_2, thesis.driver_3]
                  .filter(Boolean)
                  .map((d, i) => (
                    <Chip
                      key={i}
                      label={`${i + 1}. ${d}`}
                      variant="outlined"
                      sx={{ justifyContent: "flex-start" }}
                    />
                  ))}
                {!thesis.driver_1 && (
                  <Typography color="text.secondary">
                    No drivers identified
                  </Typography>
                )}
              </Stack>
            </Section>
          </Grid>

          {/* Embedded Expectations */}
          <Grid item xs={12} md={6}>
            <Section title="Step 5: Implied Expectations">
              <Typography variant="h4" color="primary">
                {thesis.implied_growth_rate != null
                  ? `${(thesis.implied_growth_rate * 100).toFixed(1)}%`
                  : "—"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Implied growth rate from current price
              </Typography>
              <Chip
                label={
                  GROWTH_ASSESSMENTS.find(
                    (g) => g.value === thesis.growth_assessment,
                  )?.label
                }
                color={
                  thesis.growth_assessment === "too_low"
                    ? "success"
                    : thesis.growth_assessment === "too_high"
                    ? "error"
                    : "default"
                }
                size="small"
                sx={{ mt: 1 }}
              />
            </Section>
          </Grid>

          {/* Re-Rating Mechanism */}
          <Grid item xs={12}>
            <Section title="Step 14: Re-Rating Mechanism">
              <Typography variant="body1" gutterBottom>
                <strong>WHY:</strong> {thesis.rerate_mechanism || "Not defined"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>WHEN:</strong>{" "}
                {thesis.rerate_timeframe || "Not defined"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reflexivity:{" "}
                {
                  REFLEXIVITY_CHOICES.find(
                    (r) => r.value === thesis.reflexivity_risk,
                  )?.label
                }
              </Typography>
            </Section>
          </Grid>

          {/* Scenarios */}
          <Grid item xs={12} md={6}>
            <Section title="Step 15: Bull / Base / Bear">
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Paper
                    sx={{
                      p: 1.5,
                      textAlign: "center",
                      bgcolor: "success.dark",
                      color: "white",
                    }}
                  >
                    <Typography variant="caption">BULL</Typography>
                    <Typography variant="h6">
                      ${fmt(thesis.bull_price)}
                    </Typography>
                    <Typography variant="caption">
                      {pct(thesis.bull_probability)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper
                    sx={{
                      p: 1.5,
                      textAlign: "center",
                      bgcolor: "grey.700",
                      color: "white",
                    }}
                  >
                    <Typography variant="caption">BASE</Typography>
                    <Typography variant="h6">
                      ${fmt(thesis.base_price)}
                    </Typography>
                    <Typography variant="caption">
                      {pct(thesis.base_probability)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper
                    sx={{
                      p: 1.5,
                      textAlign: "center",
                      bgcolor: "error.dark",
                      color: "white",
                    }}
                  >
                    <Typography variant="caption">BEAR</Typography>
                    <Typography variant="h6">
                      ${fmt(thesis.bear_price)}
                    </Typography>
                    <Typography variant="caption">
                      {pct(thesis.bear_probability)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2">
                Expected Value: <strong>${fmt(thesis.expected_value)}</strong>
                {" | "}Reward/Risk:{" "}
                <strong>{thesis.reward_risk_ratio ?? "—"}</strong>
              </Typography>
            </Section>
          </Grid>

          {/* Kill Criteria */}
          <Grid item xs={12} md={6}>
            <Section title="Step 16: Kill Criteria">
              <Stack spacing={1}>
                {[
                  thesis.kill_criterion_1,
                  thesis.kill_criterion_2,
                  thesis.kill_criterion_3,
                ]
                  .filter(Boolean)
                  .map((k, i) => (
                    <Alert
                      key={i}
                      severity="error"
                      variant="outlined"
                      sx={{ py: 0 }}
                    >
                      {k}
                    </Alert>
                  ))}
                {thesis.stop_loss_price && (
                  <Typography
                    variant="body2"
                    color="error.main"
                    fontWeight="bold"
                  >
                    Hard Stop: ${fmt(thesis.stop_loss_price)}
                  </Typography>
                )}
              </Stack>
            </Section>
          </Grid>

          {/* Capital Cycle + Notes */}
          <Grid item xs={12}>
            <Section title="Context">
              <Stack direction="row" spacing={2} mb={1}>
                <Chip
                  label={`Capital Cycle: ${
                    CYCLE_PHASES.find(
                      (c) => c.value === thesis.capital_cycle_phase,
                    )?.label || "N/A"
                  }`}
                  variant="outlined"
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  alignSelf="center"
                >
                  Last reviewed: {thesis.last_reviewed}
                </Typography>
              </Stack>
              {thesis.notes && (
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "pre-wrap",
                    bgcolor: "action.hover",
                    p: 1.5,
                    borderRadius: 1,
                  }}
                >
                  {thesis.notes}
                </Typography>
              )}
            </Section>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Edit/Create mode
  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5">
          {thesis ? "Edit" : "Create"} Thesis — {stock.symbol}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<SaveIcon />}
            variant="contained"
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Save
          </Button>
          <Button startIcon={<CancelIcon />} onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Section title="Step 1: Edge & Variant Perception">
            <Field
              label="Edge Type"
              field="edge_type"
              select
              options={EDGE_TYPES}
            />
            <Field
              label="Variant Perception"
              field="variant_perception"
              multiline
              helperText="What does the market NOT understand?"
            />
          </Section>
        </Grid>

        <Grid item xs={12}>
          <Section title="Step 4: Key Drivers (2-3 variables the outcome turns on)">
            <Field label="Driver 1 (Primary)" field="driver_1" />
            <Field label="Driver 2 (Secondary)" field="driver_2" />
            <Field label="Driver 3 (Tertiary)" field="driver_3" />
          </Section>
        </Grid>

        <Grid item xs={12} md={6}>
          <Section title="Step 5: Embedded Expectations">
            <Field
              label="Implied Growth Rate (decimal, e.g. 0.13 = 13%)"
              field="implied_growth_rate"
              type="number"
            />
            <Field
              label="Assessment"
              field="growth_assessment"
              select
              options={GROWTH_ASSESSMENTS}
            />
          </Section>
        </Grid>

        <Grid item xs={12} md={6}>
          <Section title="Step 9: Capital Cycle">
            <Field
              label="Industry Capital Cycle Phase"
              field="capital_cycle_phase"
              select
              options={CYCLE_PHASES}
            />
          </Section>
        </Grid>

        <Grid item xs={12}>
          <Section title="Step 14: Re-Rating Mechanism">
            <Field
              label="WHY will the market converge?"
              field="rerate_mechanism"
              multiline
            />
            <Field
              label="WHEN (timeframe)"
              field="rerate_timeframe"
              helperText="e.g., 'Q4 2026 earnings' or '6-12 months'"
            />
            <Field
              label="Reflexivity Risk"
              field="reflexivity_risk"
              select
              options={REFLEXIVITY_CHOICES}
            />
          </Section>
        </Grid>

        <Grid item xs={12}>
          <Section title="Step 15: Bull / Base / Bear Scenarios">
            <Grid container spacing={2}>
              <Grid item xs={6} md={2}>
                <Field label="Bull Price" field="bull_price" type="number" />
              </Grid>
              <Grid item xs={6} md={2}>
                <Field
                  label="Bull Prob (%)"
                  field="bull_probability"
                  type="number"
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <Field label="Base Price" field="base_price" type="number" />
              </Grid>
              <Grid item xs={6} md={2}>
                <Field
                  label="Base Prob (%)"
                  field="base_probability"
                  type="number"
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <Field label="Bear Price" field="bear_price" type="number" />
              </Grid>
              <Grid item xs={6} md={2}>
                <Field
                  label="Bear Prob (%)"
                  field="bear_probability"
                  type="number"
                />
              </Grid>
            </Grid>
          </Section>
        </Grid>

        <Grid item xs={12}>
          <Section title="Step 16: Kill Criteria (pre-committed sell triggers)">
            <Field
              label="Kill Criterion 1"
              field="kill_criterion_1"
              helperText="e.g., 'Sell if Azure <25% for 2 quarters'"
            />
            <Field label="Kill Criterion 2" field="kill_criterion_2" />
            <Field label="Kill Criterion 3" field="kill_criterion_3" />
            <Field
              label="Stop Loss Price"
              field="stop_loss_price"
              type="number"
            />
          </Section>
        </Grid>

        <Grid item xs={12}>
          <Section title="Meta">
            <Field
              label="Status"
              field="status"
              select
              options={STATUS_CHOICES}
            />
            <Field label="Notes" field="notes" multiline />
          </Section>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThesisView;

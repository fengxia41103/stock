import React, { useContext, useState } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { useResource, useCreate, useUpdate } from "@/api";
import StockDetailContext from "@Views/stock/StockDetailView/context";

const CATEGORIES = [
  { value: "regulatory", label: "Regulatory / Legal" },
  { value: "competitive", label: "Competitive" },
  { value: "operational", label: "Operational" },
  { value: "financial", label: "Financial" },
  { value: "macro", label: "Macro / Economic" },
  { value: "technology", label: "Technology / Disruption" },
  { value: "management", label: "Management / Governance" },
];

const SEVERITIES = [
  { value: "low", label: "Low", color: "info" },
  { value: "medium", label: "Medium", color: "warning" },
  { value: "high", label: "High", color: "error" },
  { value: "existential", label: "Existential", color: "error" },
];

const emptyRisk = {
  category: "competitive",
  description: "",
  severity: "medium",
  currently_materializing: false,
  materializing_evidence: "",
  source: "10-K",
};

const RiskFactorsView = () => {
  const stock = useContext(StockDetailContext);
  const { data, isLoading, refetch } = useResource(
    ["risk-factors", String(stock.id)],
    `/risk-factors/?stock=${stock.id}`,
  );
  const createMutation = useCreate(`/risk-factors/`, ["risk-factors", String(stock.id)]);

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyRisk);

  const risks = data?.results || [];
  const materializing = risks.filter((r) => r.currently_materializing);

  const handleSave = async () => {
    await createMutation.mutateAsync({ ...form, stock: stock.id });
    setAdding(false);
    setForm(emptyRisk);
    refetch();
  };

  const toggleMaterializing = async (risk) => {
    // Quick PATCH to toggle materializing status
    const { api } = await import("@/api");
    await api.patch(`/risk-factors/${risk.id}/`, {
      currently_materializing: !risk.currently_materializing,
    });
    refetch();
  };

  if (isLoading) return <ScaleLoader loading />;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">
          Risk Factors — {stock.symbol}
        </Typography>
        {!adding && (
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setAdding(true)}>
            Add Risk Factor
          </Button>
        )}
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Step 2 (lite): Curated risk factors from 10-K reading. Check "materializing" when a risk starts showing real-world evidence — link to kill criteria in thesis.
      </Typography>

      {/* Alert banner if any risks materializing */}
      {materializing.length > 0 && (
        <Alert severity="error" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
          <strong>{materializing.length} risk{materializing.length > 1 ? "s" : ""} currently materializing</strong> — review kill criteria in Thesis card.
          {materializing.map((r) => (
            <Typography key={r.id} variant="body2" sx={{ mt: 0.5 }}>
              • [{r.category}] {r.description.slice(0, 80)}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Add form */}
      {adding && (
        <Paper sx={{ p: 2.5, mb: 3, border: "1px solid", borderColor: "primary.main" }}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Typography variant="h6" color="primary">New Risk Factor</Typography>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<SaveIcon />} variant="contained" size="small" onClick={handleSave} disabled={createMutation.isPending || !form.description}>
                Save
              </Button>
              <Button startIcon={<CancelIcon />} size="small" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                select fullWidth size="small"
              >
                {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Severity"
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                select fullWidth size="small"
              >
                {SEVERITIES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Source"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                fullWidth size="small"
                helperText="10-K, proxy, earnings call, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Risk Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                fullWidth size="small" multiline minRows={2}
                helperText="Specific risk from 10-K (e.g., 'OpenAI may terminate partnership agreement')"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Risk factors list */}
      {risks.length === 0 && !adding && (
        <Alert severity="info">
          No risk factors documented. Read the 10-K Risk Factors section and add the most relevant ones here.
        </Alert>
      )}

      {risks.map((risk) => {
        const sevInfo = SEVERITIES.find((s) => s.value === risk.severity) || {};
        const catInfo = CATEGORIES.find((c) => c.value === risk.category) || {};

        return (
          <Paper
            key={risk.id}
            sx={{
              p: 2,
              mb: 1.5,
              borderLeft: "4px solid",
              borderColor: risk.currently_materializing
                ? "error.main"
                : sevInfo.value === "existential" ? "error.dark"
                : sevInfo.value === "high" ? "warning.main"
                : sevInfo.value === "medium" ? "info.main"
                : "grey.500",
              bgcolor: risk.currently_materializing ? "error.dark" : "background.paper",
              opacity: risk.currently_materializing ? 1 : 0.9,
            }}
          >
            <Stack direction="row" alignItems="flex-start" spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={risk.currently_materializing}
                    onChange={() => toggleMaterializing(risk)}
                    color="error"
                    size="small"
                  />
                }
                label=""
                sx={{ mr: 0, mt: -0.5 }}
              />
              <Box flex={1}>
                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                  <Chip label={catInfo.label || risk.category} size="small" variant="outlined" />
                  <Chip label={sevInfo.label || risk.severity} size="small" color={sevInfo.color || "default"} />
                  <Typography variant="caption" color="text.secondary">
                    Source: {risk.source} | Assessed: {risk.last_assessed}
                  </Typography>
                </Stack>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: risk.currently_materializing ? 700 : 400 }}
                >
                  {risk.description}
                </Typography>
                {risk.currently_materializing && risk.materializing_evidence && (
                  <Typography variant="body2" color="error.light" mt={0.5} sx={{ fontStyle: "italic" }}>
                    Evidence: {risk.materializing_evidence}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
};

export default RiskFactorsView;

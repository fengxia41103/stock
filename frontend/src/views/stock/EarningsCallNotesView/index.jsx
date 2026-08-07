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
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { useResource, useCreate } from "@/api";
import StockDetailContext from "@Views/stock/StockDetailView/context";

const TONE_OPTIONS = [
  { value: "confident", label: "😊 Confident" },
  { value: "cautious", label: "😐 Cautious" },
  { value: "defensive", label: "😰 Defensive" },
  { value: "neutral", label: "😶 Neutral" },
  { value: "evasive", label: "🤐 Evasive" },
];

const GUIDANCE_OPTIONS = [
  { value: "raised", label: "⬆️ Raised" },
  { value: "maintained", label: "➡️ Maintained" },
  { value: "lowered", label: "⬇️ Lowered" },
  { value: "withdrawn", label: "❌ Withdrawn" },
  { value: "none", label: "—  No Guidance" },
];

const TONE_COLORS = {
  confident: "success",
  cautious: "warning",
  defensive: "error",
  neutral: "default",
  evasive: "error",
};

const emptyNote = {
  quarter: "",
  call_date: "",
  replay_url: "",
  management_tone: "neutral",
  key_quote: "",
  guidance_direction: "maintained",
  driver_1_update: "",
  driver_2_update: "",
  driver_3_update: "",
  kill_triggered: false,
  kill_notes: "",
  analyst_pushback: "",
  what_management_avoided: "",
  stock_reaction_pct: "",
  surprise_vs_consensus: "",
};

const EarningsCallNotesView = () => {
  const stock = useContext(StockDetailContext);
  const { data, isLoading, refetch } = useResource(
    ["earnings-notes", String(stock.id)],
    `/earnings-notes/?stock=${stock.id}`,
  );
  const createMutation = useCreate(`/earnings-notes/`, ["earnings-notes", String(stock.id)]);

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyNote);

  const notes = data?.results || [];

  const handleSave = async () => {
    const payload = { ...form, stock: stock.id };
    if (payload.stock_reaction_pct === "") payload.stock_reaction_pct = null;
    else payload.stock_reaction_pct = Number(payload.stock_reaction_pct);
    await createMutation.mutateAsync(payload);
    setCreating(false);
    setForm(emptyNote);
    refetch();
  };

  const Field = ({ label, field, multiline, select, options, type = "text", helperText }) => (
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

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">
          Earnings Call Notes — {stock.symbol}
        </Typography>
        {!creating && (
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setCreating(true)}>
            Add Scorecard
          </Button>
        )}
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Step 6: After each earnings call, fill in a 5-minute scorecard. Track management tone, guidance shifts, and key driver updates.
      </Typography>

      {/* Create form */}
      {creating && (
        <Paper sx={{ p: 2.5, mb: 3, border: "1px solid", borderColor: "primary.main" }}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Typography variant="h6" color="primary">New Earnings Scorecard</Typography>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<SaveIcon />} variant="contained" size="small" onClick={handleSave} disabled={createMutation.isPending}>
                Save
              </Button>
              <Button startIcon={<CancelIcon />} size="small" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Field label="Quarter" field="quarter" helperText="e.g., Q4 2026" />
            </Grid>
            <Grid item xs={6} md={3}>
              <Field label="Call Date" field="call_date" type="date" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field label="Replay URL" field="replay_url" helperText="Link to transcript or replay" />
            </Grid>

            <Grid item xs={6} md={3}>
              <Field label="Management Tone" field="management_tone" select options={TONE_OPTIONS} />
            </Grid>
            <Grid item xs={6} md={3}>
              <Field label="Guidance" field="guidance_direction" select options={GUIDANCE_OPTIONS} />
            </Grid>
            <Grid item xs={6} md={3}>
              <Field label="Stock Reaction %" field="stock_reaction_pct" type="number" />
            </Grid>
            <Grid item xs={6} md={3}>
              <Field label="Surprise vs Consensus" field="surprise_vs_consensus" helperText="e.g., Beat EPS +5%" />
            </Grid>

            <Grid item xs={12}>
              <Field label="Key Quote" field="key_quote" multiline helperText="Most important thing management said" />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary" mb={1}>Thesis Driver Updates</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field label="Driver 1 Update" field="driver_1_update" multiline helperText={notes[0]?.driver_1_label || "Primary driver"} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field label="Driver 2 Update" field="driver_2_update" multiline helperText={notes[0]?.driver_2_label || "Secondary driver"} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field label="Driver 3 Update" field="driver_3_update" multiline helperText={notes[0]?.driver_3_label || "Tertiary driver"} />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary" mb={1}>Analyst Q&A</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Field label="What did analysts push back on?" field="analyst_pushback" multiline />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field label="What did management avoid answering?" field="what_management_avoided" multiline />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="error" mb={1}>Kill Criteria Check</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Field
                label="Kill Triggered?"
                field="kill_triggered"
                select
                options={[{ value: false, label: "No" }, { value: true, label: "⚠️ YES" }]}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Field label="Kill Notes (if triggered)" field="kill_notes" multiline />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Past notes list */}
      {notes.length === 0 && !creating && (
        <Alert severity="info">
          No earnings call notes yet. After listening to an earnings call, click "Add Scorecard" to record your observations.
        </Alert>
      )}

      {notes.map((note) => (
        <Paper key={note.id} sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={1.5}>
            <Typography variant="h6">{note.quarter}</Typography>
            <Chip
              label={TONE_OPTIONS.find((t) => t.value === note.management_tone)?.label || note.management_tone}
              color={TONE_COLORS[note.management_tone] || "default"}
              size="small"
            />
            <Chip
              label={GUIDANCE_OPTIONS.find((g) => g.value === note.guidance_direction)?.label || note.guidance_direction}
              size="small"
              variant="outlined"
            />
            {note.stock_reaction_pct != null && (
              <Chip
                label={`${note.stock_reaction_pct > 0 ? "+" : ""}${note.stock_reaction_pct.toFixed(1)}%`}
                color={note.stock_reaction_pct >= 0 ? "success" : "error"}
                size="small"
              />
            )}
            {note.kill_triggered && (
              <Chip icon={<WarningIcon />} label="KILL TRIGGERED" color="error" size="small" />
            )}
            <Box flexGrow={1} />
            {note.replay_url && (
              <Button size="small" href={note.replay_url} target="_blank" startIcon={<OpenInNewIcon />}>
                Replay
              </Button>
            )}
            <Typography variant="caption" color="text.secondary">
              {note.call_date}
            </Typography>
          </Stack>

          {note.key_quote && (
            <Typography variant="body2" sx={{ fontStyle: "italic", bgcolor: "action.hover", p: 1.5, borderRadius: 1, mb: 1.5 }}>
              "{note.key_quote}"
            </Typography>
          )}

          {note.surprise_vs_consensus && (
            <Typography variant="body2" mb={1}>
              <strong>Surprise:</strong> {note.surprise_vs_consensus}
            </Typography>
          )}

          {/* Driver updates */}
          {(note.driver_1_update || note.driver_2_update || note.driver_3_update) && (
            <Box mb={1.5}>
              <Typography variant="subtitle2" color="primary" gutterBottom>Driver Updates</Typography>
              <Grid container spacing={1}>
                {note.driver_1_update && (
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">{note.driver_1_label || "Driver 1"}</Typography>
                    <Typography variant="body2">{note.driver_1_update}</Typography>
                  </Grid>
                )}
                {note.driver_2_update && (
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">{note.driver_2_label || "Driver 2"}</Typography>
                    <Typography variant="body2">{note.driver_2_update}</Typography>
                  </Grid>
                )}
                {note.driver_3_update && (
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">{note.driver_3_label || "Driver 3"}</Typography>
                    <Typography variant="body2">{note.driver_3_update}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Analyst section */}
          {(note.analyst_pushback || note.what_management_avoided) && (
            <Box mb={1}>
              {note.analyst_pushback && (
                <Typography variant="body2" mb={0.5}>
                  <strong>Analysts pushed back on:</strong> {note.analyst_pushback}
                </Typography>
              )}
              {note.what_management_avoided && (
                <Typography variant="body2">
                  <strong>Management avoided:</strong> {note.what_management_avoided}
                </Typography>
              )}
            </Box>
          )}

          {note.kill_triggered && note.kill_notes && (
            <Alert severity="error" variant="outlined" sx={{ mt: 1 }}>
              {note.kill_notes}
            </Alert>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default EarningsCallNotesView;

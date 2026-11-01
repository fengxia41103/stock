import React, { useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import SaveIcon from "@mui/icons-material/Save";
import TimelineIcon from "@mui/icons-material/Timeline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { api } from "@/api";
import { Page } from "@/components/shared";

const money = (v) =>
  v == null || isNaN(v)
    ? "-"
    : `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

// Profile fields grouped for the form. [key, label, step]
const FORM_GROUPS = [
  {
    title: "Timeline",
    fields: [
      ["current_age", "Current age", 1],
      ["current_year", "Current year", 1],
      ["life_expectancy", "Plan-to age", 1],
    ],
  },
  {
    title: "Income & pension",
    fields: [
      ["salary", "Salary", 1000],
      ["salary_growth", "Salary growth", 0.005],
      ["pension_accrual", "Pension accrual", 0.0001],
      ["pension_vesting_years", "Vesting years", 1],
    ],
  },
  {
    title: "Balances",
    fields: [
      ["ira_balance", "IRA balance", 1000],
      ["roth_balance", "Roth balance", 1000],
      ["nc_401k_balance", "401(k) balance", 1000],
      ["nc_457_balance", "457 balance", 1000],
      ["nc_annual_contribution", "DC contribution/yr", 500],
      ["withdrawal_rate", "Withdrawal rate", 0.005],
    ],
  },
  {
    title: "Returns & taxes",
    fields: [
      ["equity_return", "Equity return", 0.005],
      ["bond_return", "Bond return", 0.005],
      ["nc_blended_return", "DC blended return", 0.005],
      ["ss_cola", "SS COLA", 0.005],
      ["state_tax_rate", "State tax rate", 0.0005],
    ],
  },
];

const SummaryStat = ({ label, value, accent }) => (
  <Paper sx={{ p: 1.5, textAlign: "center", height: "100%" }}>
    <Typography variant="caption" color="text.secondary" textTransform="uppercase">
      {label}
    </Typography>
    <Typography variant="h6" fontWeight={700} color={accent ? "primary" : "text.primary"}>
      {value}
    </Typography>
  </Paper>
);

const RetirementView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [scenarios, setScenarios] = useState([]);
  const [optimal, setOptimal] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [perTicker, setPerTicker] = useState([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  // Load (and auto-create) the profile, then compute initial scenarios.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get("/retirement/profile/");
        if (!active) return;
        setProfile(data);
        await runCompute();
      } catch {
        if (active) setError("Could not load retirement profile.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const setField = (key, raw) =>
    setProfile((p) => ({ ...p, [key]: raw === "" ? "" : Number(raw) }));

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    setMsg("");
    try {
      const { data } = await api.put("/retirement/profile/", profile);
      setProfile(data);
      setMsg("Profile saved.");
      await runCompute();
    } catch {
      setError("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const runCompute = async () => {
    const [{ data: c }, { data: o }] = await Promise.all([
      api.post("/retirement/compute/", { ages: [62, 67, 70] }),
      api.post("/retirement/optimize/", {}),
    ]);
    setScenarios(c.scenarios || []);
    setOptimal(o);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/retirement/upload/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const norm = data.normalized || {};
      // CSV -> brokerage holdings: reprice + allocate.
      if (norm.holdings) {
        const { data: alloc } = await api.post("/retirement/allocation/", {
          holdings: norm.holdings,
        });
        setAllocation(alloc.allocation);
        setPerTicker(alloc.repriced?.per_ticker || []);
        setMsg(
          `Parsed ${norm.holdings.length} holdings · priced ${alloc.repriced?.sources?.live ?? 0} live.`,
        );
      } else {
        setMsg(`Parsed ${data.kind} statement.`);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Upload/parse failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const saveSnapshot = async () => {
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const holdings = perTicker.map((h) => ({
        symbol: h.symbol,
        quantity: h.quantity,
        price: h.live_price ?? h.price,
        value: h.value,
        sleeve: h.sleeve,
        source: h.source,
      }));
      await api.post("/retirement/snapshots/", {
        ages: [62, 67, 70],
        label: new Date().toISOString().slice(0, 10),
        holdings,
      });
      setMsg("Snapshot saved. View it in History.");
    } catch {
      setError("Could not save snapshot.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Page title="Retirement">
        <CircularProgress />
      </Page>
    );
  }

  const base = scenarios.find((s) => s.retire_age === 67) || scenarios[0];

  return (
    <Page title="Retirement Planner">
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          component={RouterLink}
          to="/retirement/history"
          startIcon={<TimelineIcon />}
        >
          History
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          Upload statement
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.pdf,.json"
          hidden
          onChange={handleUpload}
        />
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={saveSnapshot}
          disabled={busy}
        >
          Save snapshot
        </Button>
        {busy && <CircularProgress size={22} sx={{ alignSelf: "center" }} />}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {msg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg("")}>
          {msg}
        </Alert>
      )}

      {/* Headline summary */}
      {base && (
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6} md={3}>
            <SummaryStat
              label="Net / mo (age 67)"
              value={money(base.first_year_net_monthly)}
              accent
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <SummaryStat
              label="Pool at retirement"
              value={money(base.retirement_pool_at_retirement)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <SummaryStat label="Pension / mo" value={money(base.pension_monthly)} />
          </Grid>
          <Grid item xs={6} md={3}>
            <SummaryStat
              label="Optimal age (PV)"
              value={optimal?.best_pv?.retire_age ?? "-"}
              accent
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2}>
        {/* Inputs form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Assumptions
            </Typography>
            {FORM_GROUPS.map((group) => (
              <Box key={group.title} sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {group.title}
                </Typography>
                <Grid container spacing={1} sx={{ mt: 0.25 }}>
                  {group.fields.map(([key, label, step]) => (
                    <Grid item xs={6} key={key}>
                      <TextField
                        label={label}
                        type="number"
                        fullWidth
                        inputProps={{ step }}
                        value={profile?.[key] ?? ""}
                        onChange={(e) => setField(key, e.target.value)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
            <Button
              variant="contained"
              onClick={saveProfile}
              disabled={saving}
              sx={{ mt: 1 }}
            >
              {saving ? "Saving…" : "Save & recompute"}
            </Button>
          </Paper>
        </Grid>

        {/* Scenarios + optimize */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Scenarios
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Retire</TableCell>
                    <TableCell align="right">Svc</TableCell>
                    <TableCell align="right">Pool</TableCell>
                    <TableCell align="right">Pension/mo</TableCell>
                    <TableCell align="right">SS/mo</TableCell>
                    <TableCell align="right">Net/mo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scenarios.map((s) => (
                    <TableRow key={s.retire_age}>
                      <TableCell>
                        {s.retire_age}{" "}
                        {s.pension_unreduced ? (
                          <Chip label="unreduced" size="small" color="success" />
                        ) : (
                          <Chip label="reduced" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="right">{s.years_of_service}</TableCell>
                      <TableCell align="right">
                        {money(s.retirement_pool_at_retirement)}
                      </TableCell>
                      <TableCell align="right">{money(s.pension_monthly)}</TableCell>
                      <TableCell align="right">{money(s.ss_monthly_at_claim)}</TableCell>
                      <TableCell align="right">
                        {money(s.first_year_net_monthly)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {optimal && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Optimal retirement age — present value:{" "}
                <strong>{optimal.best_pv?.retire_age}</strong>, nominal:{" "}
                <strong>{optimal.best_nominal?.retire_age}</strong>.
              </Typography>
            )}
          </Paper>

          {/* Allocation (after an upload) */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Household allocation
            </Typography>
            {!allocation ? (
              <Typography variant="body2" color="text.secondary">
                Upload a positions statement to see live allocation vs target.
              </Typography>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Total {money(allocation.total)}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Sleeve</TableCell>
                        <TableCell align="right">Now</TableCell>
                        <TableCell align="right">Target</TableCell>
                        <TableCell align="right">Drift</TableCell>
                        <TableCell align="right">To target</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allocation.rows.map((r) => (
                        <TableRow key={r.sleeve}>
                          <TableCell>{r.sleeve}</TableCell>
                          <TableCell align="right">{r.now_pct}%</TableCell>
                          <TableCell align="right">{r.target_pct}%</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                r.drift_pct > 0
                                  ? "error.main"
                                  : r.drift_pct < 0
                                    ? "success.main"
                                    : "text.secondary",
                            }}
                          >
                            {r.drift_pct > 0 ? "+" : ""}
                            {r.drift_pct}%
                          </TableCell>
                          <TableCell align="right">
                            {money(r.dollars_to_target)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {perTicker.length > 0 && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      Per-ticker ({perTicker.length}) — priced live where tracked
                    </Typography>
                  </>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Page>
  );
};

export default RetirementView;

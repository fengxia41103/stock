import React, { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import { useRetirementTimeseries } from "@/api";
import { HighchartGraph, Page } from "@/components/shared";
import PageHelp from "@/components/shared/PageHelp";

// Chartable metrics; label + whether it's a dollar or currency/month value.
const METRICS = [
  { key: "net_monthly", label: "Net / mo" },
  { key: "gross_monthly", label: "Gross / mo" },
  { key: "pool", label: "Pool" },
  { key: "ira", label: "IRA" },
  { key: "nc", label: "DC (401k/457)" },
  { key: "pension_monthly", label: "Pension / mo" },
];

const AGES = [62, 67, 70];

const RetirementHistoryView = () => {
  const [age, setAge] = useState(67);
  const [metric, setMetric] = useState("net_monthly");

  const { data, isLoading } = useRetirementTimeseries(age);
  const points = useMemo(() => data?.points || [], [data]);

  const chart = useMemo(() => {
    const categories = points.map(
      (p) => p.label || p.taken_at?.slice(0, 10) || "",
    );
    const series = [
      {
        name: METRICS.find((m) => m.key === metric)?.label || metric,
        data: points.map((p) => p[metric] ?? null),
      },
    ];
    return { categories, series };
  }, [points, metric]);

  return (
    <Page title="Retirement History">
      <PageHelp pageName="RetirementHistory" />
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          component={RouterLink}
          to="/retirement"
          startIcon={<ArrowBackIcon />}
        >
          Planner
        </Button>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
        alignItems={{ sm: "center" }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Retire age
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={age}
            onChange={(_, v) => v != null && setAge(v)}
            sx={{ display: "block" }}
          >
            {AGES.map((a) => (
              <ToggleButton key={a} value={a}>
                {a}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Metric
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={metric}
            onChange={(_, v) => v != null && setMetric(v)}
            sx={{ display: "block", flexWrap: "wrap" }}
          >
            {METRICS.map((m) => (
              <ToggleButton key={m.key} value={m.key}>
                {m.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Stack>

      {isLoading ? (
        <CircularProgress />
      ) : points.length === 0 ? (
        <Typography color="text.secondary">
          No snapshots yet. Save one from the planner to start tracking your
          outlook over time.
        </Typography>
      ) : (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <HighchartGraph
              type="line"
              categories={chart.categories}
              data={chart.series}
              yLabel={METRICS.find((m) => m.key === metric)?.label}
              legendEnabled={false}
            />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Snapshots ({points.length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Taken</TableCell>
                    <TableCell>Label</TableCell>
                    <TableCell align="right">Net/mo</TableCell>
                    <TableCell align="right">Pool</TableCell>
                    <TableCell align="right">Pension/mo</TableCell>
                    <TableCell align="right">Optimal (PV)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {points.map((p) => (
                    <TableRow key={p.snapshot_id}>
                      <TableCell>{p.taken_at?.slice(0, 10)}</TableCell>
                      <TableCell>{p.label || "-"}</TableCell>
                      <TableCell align="right">
                        {p.net_monthly != null
                          ? `$${Number(p.net_monthly).toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell align="right">
                        {p.pool != null
                          ? `$${Number(p.pool).toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell align="right">
                        {p.pension_monthly != null
                          ? `$${Number(p.pension_monthly).toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell align="right">{p.best_pv_age ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Page>
  );
};

export default RetirementHistoryView;

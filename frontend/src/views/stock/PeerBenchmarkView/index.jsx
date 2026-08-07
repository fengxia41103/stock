import React, { useContext, useState } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  MenuItem,
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
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DeleteIcon from "@mui/icons-material/Delete";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

import { api, useResource, useCreate, useDelete } from "@/api";
import StockDetailContext from "@Views/stock/StockDetailView/context";

const RELATIONSHIPS = [
  { value: "competitor", label: "Direct Competitor" },
  { value: "substitute", label: "Substitute" },
  { value: "supplier", label: "Supplier" },
  { value: "customer", label: "Customer" },
  { value: "adjacent", label: "Adjacent Market" },
];

const PeerBenchmarkView = () => {
  const stock = useContext(StockDetailContext);
  const { data, isLoading, refetch } = useResource(
    ["peer-groups", String(stock.id)],
    `/peer-groups/?stock=${stock.id}`,
  );
  const createMutation = useCreate(`/peer-groups/`, [
    "peer-groups",
    String(stock.id),
  ]);

  const [adding, setAdding] = useState(false);
  const [peerSymbol, setPeerSymbol] = useState("");
  const [relationship, setRelationship] = useState("competitor");
  const [notes, setNotes] = useState("");
  const [populating, setPopulating] = useState(false);

  const peers = Array.isArray(data) ? data : [];

  const handlePopulateDefaults = async () => {
    setPopulating(true);
    try {
      await api.post("/peer-groups/populate_defaults/", { stock: stock.id });
      refetch();
    } finally {
      setPopulating(false);
    }
  };

  const handleAddPeer = async () => {
    if (!peerSymbol.trim()) return;
    await createMutation.mutateAsync({
      stock: stock.id,
      peer_symbol: peerSymbol.trim().toUpperCase(),
      relationship,
      notes,
    });
    setPeerSymbol("");
    setNotes("");
    setAdding(false);
    refetch();
  };

  const handleDelete = async (id) => {
    await api.delete(`/peer-groups/${id}/`);
    refetch();
  };

  if (isLoading) return <ScaleLoader loading />;

  // Group peers by relationship
  const grouped = {};
  peers.forEach((p) => {
    if (!grouped[p.relationship]) grouped[p.relationship] = [];
    grouped[p.relationship].push(p);
  });

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5">
          Peer Benchmark — {stock.symbol}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<AutoFixHighIcon />}
            variant="outlined"
            size="small"
            onClick={handlePopulateDefaults}
            disabled={populating}
          >
            {populating ? "Loading..." : "Load Defaults"}
          </Button>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={() => setAdding(true)}
          >
            Add Peer
          </Button>
        </Stack>
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Step 8: Compare against actual competitors — not just portfolio
        siblings. Benchmark organic growth, margins, ROIC, and FCF conversion.
      </Typography>

      {/* Add form */}
      {adding && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            border: "1px solid",
            borderColor: "primary.main",
          }}
        >
          <Typography variant="subtitle2" color="primary" mb={1.5}>
            Add Custom Peer
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label="Peer Symbol"
                value={peerSymbol}
                onChange={(e) => setPeerSymbol(e.target.value)}
                size="small"
                fullWidth
                placeholder="e.g., PYPL"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                select
                size="small"
                fullWidth
              >
                {RELATIONSHIPS.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                size="small"
                fullWidth
                placeholder="Why this is a peer"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddPeer}
                  disabled={!peerSymbol.trim() || createMutation.isPending}
                >
                  Add
                </Button>
                <Button size="small" onClick={() => setAdding(false)}>
                  Cancel
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Peer groups display */}
      {peers.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No peers defined for {stock.symbol}. Click "Load Defaults" to
          populate industry competitors from our pre-defined mappings, or add
          custom peers manually.
        </Alert>
      )}

      {peers.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Peer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Relationship</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>In Portfolio?</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {peers.map((peer) => {
                const relInfo =
                  RELATIONSHIPS.find((r) => r.value === peer.relationship) || {};
                return (
                  <TableRow key={peer.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {peer.peer_symbol}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={relInfo.label || peer.relationship}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {peer.notes || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {/* This could be enhanced to check if peer_symbol exists in our DB */}
                      <Chip
                        label="External"
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(peer.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Comparison guidance */}
      {peers.length > 0 && (
        <Paper sx={{ p: 2, bgcolor: "action.hover" }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <CompareArrowsIcon color="primary" />
            <Typography variant="subtitle2" color="primary">
              Competitive Comparison Framework
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={1}>
            For peers that are tracked in your portfolio, use the Compare view
            for side-by-side charts. For external peers, manually assess:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" fontWeight={700}>
                Organic Growth
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revenue growth ex-acquisitions. Who's growing faster?
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" fontWeight={700}>
                Operating Margins
              </Typography>
              <Typography variant="body2" color="text.secondary">
                On comparable basis (adjust SBC, restructuring). Who's more
                efficient?
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" fontWeight={700}>
                ROIC / Capital Efficiency
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Return on invested capital. Who generates more per dollar
                invested?
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" fontWeight={700}>
                FCF Conversion
              </Typography>
              <Typography variant="body2" color="text.secondary">
                What % of EBITDA converts to free cash flow? Higher = better
                quality.
              </Typography>
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }} variant="outlined">
            <strong>Key question:</strong> Is {stock.symbol} gaining or losing
            share vs. these peers? Is outperformance structural or cyclical?
          </Alert>
        </Paper>
      )}
    </Box>
  );
};

export default PeerBenchmarkView;

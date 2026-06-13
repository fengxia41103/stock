import { filter, map } from "lodash";
import React, { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

import { useCreate, useSectors } from "@/api";

const AddNewSectorDialog = () => {
  const [open, setOpen] = useState(false);
  const [sector, setSector] = useState("");
  const { data } = useSectors();
  const { mutate: create } = useCreate("/sectors/", ["sectors"]);

  const sectors = data?.results || data || [];
  const names = map(sectors, "name");
  const is_error = names.includes(sector);

  const on_create = () => {
    map(sector.split(","), (s) => create({ name: s.trim() }));
    setOpen(false);
  };

  const filtered = map(
    filter(names, (s) => s.includes(sector)),
    (s) => <Chip key={s} color="primary" label={s} />,
  );

  return (
    <>
      <Button color="secondary" onClick={() => setOpen(true)}>
        <AddIcon /> Add New Sector
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Sector</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A sector groups stocks into a category you define.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="sector name"
            fullWidth
            error={is_error}
            helperText={is_error ? "Sector name must be unique." : ""}
          />
          <Box mt={2}>{filtered}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={on_create} disabled={is_error}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddNewSectorDialog;

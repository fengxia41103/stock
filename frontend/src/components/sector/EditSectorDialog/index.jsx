import { filter, map } from "lodash";
import PropTypes from "prop-types";
import React, { useState } from "react";

import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";

import { useUpdate } from "@/api";

const EditSectorDialog = ({ id, name: old_name, existings }) => {
  const [open, setOpen] = useState(false);
  const [new_name, setNewName] = useState(old_name);
  const { mutate: update } = useUpdate(`/sectors/${id}/`, ["sectors", "sector"]);

  const is_error = existings.includes(new_name) && new_name !== old_name;

  const on_update = () => {
    update({ name: new_name }, { onSuccess: () => setOpen(false) });
  };

  const filtered = map(
    filter(existings, (s) => s.includes(new_name)),
    (s) => <Chip key={s} color="primary" label={s} />,
  );

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <EditIcon /> Edit sector name
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Sector</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            value={new_name}
            onChange={(e) => setNewName(e.target.value.trim())}
            placeholder="sector name"
            fullWidth
            error={is_error}
            helperText={is_error ? "Sector name must be unique." : ""}
          />
          <Box mt={2}>{filtered}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={on_update} disabled={is_error}>Update</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

EditSectorDialog.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  existings: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default EditSectorDialog;

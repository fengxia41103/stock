import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { filter, map } from "lodash";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { useMutate } from "restful-react";

import GlobalContext from "src/context";

export default function EditSectorDialog(props) {
  const { host } = useContext(GlobalContext);
  const [open, setOpen] = useState(false);
  const { resource_uri, name: old_name, existings } = props;
  const [new_name, setNewName] = useState(old_name);
  const [is_error, setError] = useState(false);

  const { mutate: update } = useMutate({
    verb: "PATCH",
    path: `${host}${resource_uri}`,
  });

  const reload = () => window.location.reload();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const on_sector_change = (event) => {
    const tmp = event.target.value.trim();
    setNewName(tmp);
    setError(existings.includes(tmp));
  };

  // call API and close this dialog
  const on_update = () =>
    update({ resource_uri, name: new_name })
      .then(setOpen(false))
      .then(reload());

  // filtered existing list
  const filtered_existings = map(
    filter(existings, (s) => s.includes(new_name)),
    (s) => <Chip key={s} color="primary" label={s} />,
  );

  return (
    <>
      <Button color="primary" onClick={handleClickOpen}>
        <EditIcon />
        Edit sector name
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>Edit Sector</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            value={new_name}
            onChange={on_sector_change}
            placeholder="sector name"
            fullWidth
            error={is_error}
            label={is_error ? "Error" : ""}
            helperText={is_error ? "Sector name must be unique." : ""}
          />
          <Box mt={2}>{filtered_existings}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={on_update}
            disabled={is_error}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

EditSectorDialog.propTypes = {
  resource_uri: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  existings: PropTypes.arrayOf(PropTypes.string).isRequired,
};

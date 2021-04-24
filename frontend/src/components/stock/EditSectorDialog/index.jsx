import React, { useState, useContext } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import GlobalContext from "src/context";
import { useMutate } from "restful-react";
import EditIcon from "@material-ui/icons/Edit";
import Fetch from "src/components/Fetch";
import { map } from "lodash";

export default function EditSectorDialog(props) {
  const { host } = useContext(GlobalContext);
  const [open, setOpen] = useState(false);
  const { resource_uri, name: old_name, existings } = props;
  const [new_name, setNewName] = useState(old_name);
  const [is_error, setError] = useState(false);

  const { mutate: update } = useMutate({
    verb: "PATCH",
    path: `${host}${resource_uri}/`,
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const on_sector_change = event => {
    const tmp = event.target.value.trim();
    setNewName(tmp);
    setError(existings.includes(tmp));
  };

  // call API and close this dialog
  const on_update = () =>
    update({ resource_uri, name: new_name }).then(setOpen(false));

  return (
    <Box>
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
          {existings}
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
    </Box>
  );
}

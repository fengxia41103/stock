import React, { useState, useContext } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import GlobalContext from "src/context";
import { useMutate } from "restful-react";
import EditIcon from "@material-ui/icons/Edit";
import PropTypes from "prop-types";
import Chip from "@material-ui/core/Chip";
import { map, filter } from "lodash";

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

  // filtered existing list
  const filtered_existings = map(
    filter(existings, s => s.includes(new_name)),
    s => <Chip key={s} color="primary" label={s} />
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

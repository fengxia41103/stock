import React, { useState, useContext } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import Chip from "@material-ui/core/Chip";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import GlobalContext from "src/context";
import { useMutate } from "restful-react";
import AddIcon from "@material-ui/icons/Add";
import Fetch from "src/components/Fetch";
import { map, filter } from "lodash";

export default function AddNewSectorDialog() {
  const { api } = useContext(GlobalContext);
  const [open, setOpen] = useState(false);
  const [resource] = useState("/sectors");
  const [sector, setSector] = useState("");

  const { mutate: create } = useMutate({
    verb: "POST",
    path: `${api}${resource}/`,
  });

  const reload = () => window.location.reload();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const on_sector_change = event => {
    const tmp = event.target.value.trim();
    setSector(tmp);
  };

  // call API and close this dialog
  const on_create = () =>
    create({ name: sector })
      .then(setOpen(false))
      .then(reload());

  const render_data = data => {
    let sectors = data.objects;
    sectors = map(
      filter(sectors, s => s.name.includes(sector)),
      s => <Chip key={s.id} color="primary" label={s.name} />
    );
    const is_error = sectors.includes(sector);

    return (
      <>
        <Button color="primary" onClick={handleClickOpen}>
          <AddIcon />
          Add New Sector
        </Button>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Add New Sector</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Sector represents a group of stocks. It is not necessarily the
              official designation of the stock in the sense of an industry. It
              can be anything you'd like to in order to manager your portfolio.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              value={sector}
              onChange={on_sector_change}
              placeholder="sector name"
              fullWidth
              error={is_error}
              label={is_error ? "Error" : ""}
              helperText={is_error ? "Sector name must be unique." : ""}
            />

            <Box mt={2}>{sectors}</Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={on_create}
              disabled={is_error}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };
  // render as usual to get data
  return <Fetch {...{ api, resource, render_data }} />;
}

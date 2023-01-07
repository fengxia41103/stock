import { ShowResource } from "@fengxia41103/storybook";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { filter, map } from "lodash";
import React, { useContext, useState } from "react";
import { useMutate } from "restful-react";

import GlobalContext from "src/context";

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
  const handleClickOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  const on_sector_change = (event) => {
    // symbol is always in upper case
    let tmp = event.target.value;
    tmp = map(tmp.split(","), (s) => s.trim());
    setSector(tmp);
  };

  // call API and close this dialog
  const on_create = () => {
    map(sector, (s) => create({ name: s }));
    setOpen(false);
    reload();
  };

  const render_data = (data) => {
    let sectors = data.objects;
    sectors = map(
      filter(sectors, (s) => s.name.includes(sector)),
      (s) => <Chip key={s.id} color="primary" label={s.name} />,
    );
    const is_error = sectors.includes(sector);

    return (
      <>
        <Button color="secondary" onClick={handleClickOpen}>
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
              A sector is a way for you to organize stocks into a category. How
              you organize stocks is up to you. You can choose to group stocks
              by industry, company size, or any other category to help you
              manage your portfolio.
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
  return <ShowResource {...{ resource, on_success: render_data }} />;
}

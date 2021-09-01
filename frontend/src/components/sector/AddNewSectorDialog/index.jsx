import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import Chip from "@material-ui/core/Chip";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import AddIcon from "@material-ui/icons/Add";
import ShowResource from "src/components/common/ShowResource";
import { map, filter, truncate } from "lodash";
import CreateResource from "src/components/common/CreateResource";

export default function AddNewSectorDialog() {
  const [open, setOpen] = useState(false);
  const [resource] = useState("/sectors");
  const [sector, setSector] = useState("");
  const [submit, setSubmit] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // action
  const reload = () => window.location.reload();

  // event handlers
  const on_click_open = () => setOpen(true);
  const on_click_close = () => setOpen(false);
  const on_sector_change = event => {
    // symbol is always in upper case
    let tmp = event.target.value;
    tmp = map(tmp.split(","), s => s.trim());
    setSector(tmp);

    // set success msg
    const sectors = truncate(tmp.join(","), 20);
    setSuccessMsg(`Sectors: ${sectors} have been added to your portfolio.`);
  };
  const on_success = () => {
    setOpen(false);
    reload();
  };

  // call API and close this dialog
  const creates = map(sector, s => (
    <CreateResource
      key={s}
      {...{
        resource,
        data: { name: s },
        on_success,
        successMsg,
      }}
    />
  ));

  const render_data = data => {
    let sectors = data.objects;
    sectors = map(
      filter(sectors, s => s.name.includes(sector)),
      s => <Chip key={s.id} color="primary" label={s.name} />
    );
    const is_error = sectors.includes(sector);

    return (
      <>
        <Button color="secondary" onClick={on_click_open}>
          <AddIcon />
          Add New Sector
        </Button>
        <Dialog
          open={open}
          onClose={on_click_close}
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
            {submit ? creates : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={on_click_close} color="primary">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setSubmit(true)}
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

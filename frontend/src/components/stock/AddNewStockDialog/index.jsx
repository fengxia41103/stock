import React, { useState, useContext } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import GlobalContext from "src/context";
import { map, truncate, remove, clone } from "lodash";
import ShowResource from "src/components/common/ShowResource";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Grid,
  Typography,
} from "@material-ui/core";
import Post from "src/components/common/Post";

export default function AddNewStockDialog() {
  const { api } = useContext(GlobalContext);

  // states
  const [resource] = useState("/stocks");
  const [sectors_resource] = useState("/sectors");
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [submit, setSubmit] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // event handlers
  const on_click_open = () => setOpen(true);
  const on_click_close = () => setOpen(false);
  const on_symbol_change = (event) => {
    // symbol is always in upper case
    let tmp = event.target.value.toUpperCase();
    tmp = map(tmp.replaceAll(",", " ").split(" "), (s) => s.trim());
    setSymbol(tmp);

    // set success msg
    const symbols = truncate(tmp.join(","), 20);
    setSuccessMsg(`Symbols: ${symbols} have been added to your portfolio.`);
  };

  const handle_sector_selection = (event) => {
    if (event.target.checked) {
      // add to selected sector
      let tmp = clone(selectedSectors);
      tmp.push(event.target.value);

      setSelectedSectors(tmp);
    } else {
      // remove from selected sector list
      setSelectedSectors(
        remove(selectedSectors, (x) => x.id === event.target.value)
      );
    }
  };

  // actions
  const on_success = () => setOpen(false);

  // rendering contents
  const creates = map(symbol, (s) => (
    <Post
      key={s}
      {...{
        resource,
        data: { symbol: s, sectors: selectedSectors },
        on_success,
        successMsg,
      }}
    />
  ));

  const render_data = (data) => {
    const sectors = data.objects;
    const selections = map(sectors, (s) => {
      return (
        <Grid item key={s.id} lg={4} sm={6} xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  selectedSectors.length > 0
                    ? selectedSectors.includes(s.id + "")
                    : s.name === "misc"
                }
                onChange={handle_sector_selection}
                name={s.name}
                value={s.id}
              />
            }
            label={s.name}
          />
        </Grid>
      );
    });

    return (
      <Box mt={2}>
        <Typography variant="h3">Link to a Sector</Typography>
        <Box mt={1}>
          <FormControl component="fieldset">
            <FormGroup>
              <Grid container spacing={1}>
                {selections}
              </Grid>
            </FormGroup>
          </FormControl>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Button color="secondary" variant="contained" onClick={on_click_open}>
        Add new stocks
      </Button>
      <Dialog
        open={open}
        onClose={on_click_close}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add New Stock</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add a stock, enter the stock symbol (in uppercase). It might take
            some time for the stock to appear in your list.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            value={symbol}
            onChange={on_symbol_change}
            placeholder="symbol"
            fullWidth
          />
          <ShowResource
            {...{ resource: sectors_resource, on_success: render_data }}
          />

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
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

import React, { useState, useContext } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import GlobalContext from "src/context";
import { useMutate } from "restful-react";
import { map, truncate, remove, clone } from "lodash";
import SimpleSnackbar from "src/components/common/SimpleSnackbar";
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

export default function AddNewStockDialog() {
  const { api } = useContext(GlobalContext);
  const [open, setOpen] = useState(false);
  const [resource] = useState("/stocks");
  const [symbol, setSymbol] = useState([]);
  const [notification, setNotification] = useState("");
  const [sectors_resource] = useState("/sectors");
  const [selectedSectors, setSelectedSectors] = useState([]);

  const { mutate: create } = useMutate({
    verb: "POST",
    path: `${api}${resource}/`,
  });

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  const on_symbol_change = event => {
    // symbol is always in upper case
    let tmp = event.target.value.toUpperCase();
    tmp = map(tmp.replaceAll(",", " ").split(" "), s => s.trim());
    setSymbol(tmp);
  };

  // call API and close this dialog
  const on_create = () => {
    map(symbol, s => create({ symbol: s, sectors: selectedSectors }));
    setOpen(false);

    const msg = truncate(symbol.join(","), 20);
    setNotification(`Symbols: ${msg} have been added to your portfolio.`);
  };

  const handle_sector_selection = event => {
    if (event.target.checked) {
      // add to selected sector
      let tmp = clone(selectedSectors);
      tmp.push(event.target.value);

      setSelectedSectors(tmp);
    } else {
      // remove from selected sector list
      setSelectedSectors(
        remove(selectedSectors, x => x.id === event.target.value)
      );
    }
  };

  const render_data = data => {
    const sectors = data.objects;
    const selections = map(sectors, s => {
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
      <Button color="secondary" variant="contained" onClick={handleClickOpen}>
        Add new stocks
        <SimpleSnackbar msg={notification} />
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={on_create}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

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
import { map, truncate } from "lodash";
import SimpleSnackbar from "src/components/SimpleSnackbar";

export default function AddNewStockDialog() {
  const { api } = useContext(GlobalContext);
  const [open, setOpen] = useState(false);
  const [resource] = useState("/stocks");
  const [symbol, setSymbol] = useState([]);
  const [notification, setNotification] = useState("");

  const { mutate: create } = useMutate({
    verb: "POST",
    path: `${api}${resource}/`,
  });

  const reload = () => window.location.reload();

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  const on_symbol_change = (event) => {
    // symbol is always in upper case
    let tmp = event.target.value.toUpperCase();
    tmp = map(tmp.replaceAll(",", " ").split(" "), (s) => s.trim());
    setSymbol(tmp);
  };

  // call API and close this dialog
  const on_create = () => {
    map(symbol, (s) => create({ symbol: s }));
    setOpen(false);

    const msg = truncate(symbol.join(","), 20);
    setNotification(`Symbols: ${msg} have been added to your portfolio.`);
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
            To add new stock to your list, please enter the stock symbol (always
            shown in upper case) here. Symbol who fails to acquire historical
            data can later be deleted.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            value={symbol}
            onChange={on_symbol_change}
            placeholder="symbol"
            fullWidth
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

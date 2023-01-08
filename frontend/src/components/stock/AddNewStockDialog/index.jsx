import { clone, map, remove, truncate } from "lodash";
import React, { useContext, useState } from "react";
import { useMutate } from "restful-react";

import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";

import {
  AsDialog,
  ShowResource,
  SimpleSnackbar,
} from "@fengxia41103/storybook";

import GlobalContext from "src/context";

export default function AddNewStockDialog() {
  // context
  const { api } = useContext(GlobalContext);

  // states
  const [resource] = useState("/stocks");
  const [symbol, setSymbol] = useState([]);
  const [notification, setNotification] = useState("");
  const [sectors_resource] = useState("/sectors");
  const [selectedSectors, setSelectedSectors] = useState([]);

  // hooks
  const { mutate: create } = useMutate({
    verb: "POST",
    path: `${api}${resource}/`,
  });

  // event handlres
  const on_symbol_change = (event) => {
    // symbol is always in upper case
    let tmp = event.target.value.toUpperCase();
    tmp = map(tmp.replaceAll(",", " ").split(" "), (s) => s.trim());
    setSymbol(tmp);
  };

  // call API and close this dialog
  const on_create = () => {
    const success_msg = truncate(symbol.join(","), 20);
    const promises = map(symbol, (s) =>
      create({ symbol: s, sectors: selectedSectors }),
    );
    Promise.all(promises).then(
      setNotification(
        `Symbols: ${success_msg} have been added to your portfolio.`,
      ),
    );
  };

  const handle_sector_selection = (event) => {
    if (event.target.checked) {
      // add to selected sector
      const tmp = clone(selectedSectors);
      tmp.push(event.target.value);

      setSelectedSectors(tmp);
    } else {
      // remove from selected sector list
      setSelectedSectors(
        remove(selectedSectors, (x) => x.id === event.target.value),
      );
    }
  };

  const render_data = (data) => {
    const sectors = data.objects;
    if (sectors.length === 0) return null;

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

  // dialog stuff
  const dialog_as = (
    <Button color="secondary">
      <AddBusinessIcon />
      Add new stocks
      <SimpleSnackbar msg={notification} />
    </Button>
  );
  const dialog_title = "Add New Stock";
  const dialog_content = (
    <>
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
    </>
  );
  const dialog_when_confirm = (
    <Button variant="contained" color="primary" onClick={on_create}>
      Add
    </Button>
  );

  return (
    <AsDialog
      {...{
        as: dialog_as,
        title: dialog_title,
        content: dialog_content,
        when_confirm: dialog_when_confirm,
      }}
    />
  );
}

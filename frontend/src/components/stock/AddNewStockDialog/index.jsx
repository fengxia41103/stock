import { clone, map, remove, truncate } from "lodash";
import React, { useState } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

import { useCreate, useSectors } from "@/api";
import { SimpleSnackbar } from "@fengxia41103/storybook";

const AddNewStockDialog = () => {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState([]);
  const [notification, setNotification] = useState("");
  const [selectedSectors, setSelectedSectors] = useState([]);

  const { data: sectorData, isLoading } = useSectors();
  const { mutate: create } = useCreate("/stocks/", ["stocks"]);

  const on_symbol_change = (event) => {
    let tmp = event.target.value.toUpperCase();
    tmp = map(tmp.replaceAll(",", " ").split(" "), (s) => s.trim());
    setSymbol(tmp);
  };

  const on_create = () => {
    const promises = map(symbol, (s) =>
      create({ symbol: s, sectors: selectedSectors }),
    );
    Promise.all(promises).then(() => {
      setNotification(`Symbols: ${truncate(symbol.join(","), 20)} added.`);
      setOpen(false);
    });
  };

  const handle_sector_selection = (event) => {
    if (event.target.checked) {
      const tmp = clone(selectedSectors);
      tmp.push(event.target.value);
      setSelectedSectors(tmp);
    } else {
      setSelectedSectors(
        remove(selectedSectors, (x) => x.id === event.target.value),
      );
    }
  };

  const sectors = sectorData?.results || sectorData || [];

  return (
    <>
      <Button color="secondary" onClick={() => setOpen(true)}>
        <AddBusinessIcon /> Add new stocks
      </Button>
      {notification && <SimpleSnackbar msg={notification} />}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Stock</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter stock symbol(s) separated by spaces or commas.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            value={symbol.join(" ")}
            onChange={on_symbol_change}
            placeholder="AAPL MSFT GOOGL"
            fullWidth
          />
          {isLoading ? (
            <ScaleLoader loading />
          ) : sectors.length > 0 ? (
            <Box mt={2}>
              <Typography variant="h6">Link to a Sector</Typography>
              <FormControl component="fieldset">
                <FormGroup>
                  <Grid container spacing={1}>
                    {map(sectors, (s) => (
                      <Grid item key={s.id} lg={4} sm={6} xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedSectors.includes(`${s.id}`)}
                              onChange={handle_sector_selection}
                              name={s.name}
                              value={s.id}
                            />
                          }
                          label={s.name}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </FormControl>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={on_create}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddNewStockDialog;

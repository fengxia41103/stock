import React, { useState, useContext } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import GlobalContext from "src/context";
import { useMutate } from "restful-react";
import AddIcon from "@material-ui/icons/Add";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { map, remove, isEmpty } from "lodash";
import Fetch from "src/components/Fetch";
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Typography,
} from "@material-ui/core";

export default function AddStocksDialog(props) {
  const { host } = useContext(GlobalContext);
  const { api } = useContext(GlobalContext);
  const [resource] = useState("/sectors");
  const { stocks } = props;
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const stock_links = map(stocks, v => {
    return <ListItem key={v.id}>{v.symbol}</ListItem>;
  });

  let sectors = [];
  let selected_sectors = [];

  const handleChange = event => {
    for (let i = 0; i < sectors.length; i++) {
      let s = sectors[i];

      // conditions
      if (s.name === event.target.name) {
        if (event.target.checked) {
          // add to
          selected_sectors.push(s);
        } else {
          // remove
          remove(selected_sectors, k => s.name === k.name);
        }
      }
    }
  };

  const add = () => {
    const stock_resources = map(stocks, s => s.resource_uri);
    const call_api = s => {
      const uri = `${host}${s.resource_uri}`;
      fetch(uri, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stocks: stock_resources }),
      });
    };

    selected_sectors.forEach(s => call_api(s));

    // close the dialog
    handleClose();
  };

  const render_data = data => {
    if (isEmpty(sectors)) {
      sectors = data.objects;
    }

    const selections = map(sectors, s => {
      return (
        <FormControlLabel
          key={s.id}
          control={<Checkbox onChange={handleChange} name={s.name} />}
          label={s.name}
        />
      );
    });

    const form = (
      <FormControl component="fieldset">
        <FormLabel component="legend">Select a sector</FormLabel>
        <FormGroup>{selections}</FormGroup>
      </FormControl>
    );

    return (
      <Box>
        <Button color="primary" onClick={handleClickOpen}>
          <AddIcon />
          Add stocks to sector
        </Button>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle>Add stocks</DialogTitle>
          <DialogContent>
            <Box mt={2}>
              <Typography variant="body2">
                Select a sector to add these stocks to:
              </Typography>
              {selections}
            </Box>

            <Box mt={2}>
              <Typography variant="body2">
                The following stocks will be added to sector:
              </Typography>

              {stock_links}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={() => add()}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  return <Fetch {...{ api, resource, render_data }} />;
}

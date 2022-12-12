import { isEmpty, map, remove } from "lodash";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";

import { Checkbox, FormControlLabel, Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import ListItem from "@material-ui/core/ListItem";
import AddIcon from "@material-ui/icons/Add";

import ShowResource from "src/components/common/ShowResource";
import GlobalContext from "src/context";

export default function AddStocksToSectorDialog(props) {
  const { host, auth } = useContext(GlobalContext);
  const [resource] = useState("/sectors");
  const { stocks } = props;
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const stock_links = map(stocks, (v) => {
    return <ListItem key={v.id}>{v.symbol}</ListItem>;
  });

  let sectors = [];
  const selected_sectors = [];

  const handleChange = (event) => {
    for (let i = 0; i < sectors.length; i++) {
      const s = sectors[i];

      // conditions
      if (s.name === event.target.name) {
        if (event.target.checked) {
          // add to
          selected_sectors.push(s);
        } else {
          // remove
          remove(selected_sectors, (k) => s.name === k.name);
        }
      }
    }
  };

  const add = () => {
    const add_stock_resources = map(stocks, (s) => s.resource_uri);
    const call_api = (s) => {
      // add selected stocks to the list
      const stock_resources = s.stocks.concat(add_stock_resources);

      // call to update backend
      const uri = `${host}${s.resource_uri}`;
      return fetch(uri, {
        method: "patch",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body: JSON.stringify({ stocks: stock_resources }),
      });
    };

    // for each sector, enumerate to update
    const promises = selected_sectors.map((s) => call_api(s));
    Promise.all(promises).then(
      // close the dialog
      handleClose(),
    );
  };

  const render_data = (data) => {
    if (isEmpty(sectors)) {
      sectors = data.objects;
    }

    const selections = map(sectors, (s) => {
      return (
        <Grid key={s.id} item lg={3} md={4} sm={6} xs={6}>
          <FormControlLabel
            control={<Checkbox onChange={handleChange} name={s.name} />}
            label={s.name}
          />
        </Grid>
      );
    });

    return (
      <>
        <Button color="secondary" onClick={handleClickOpen}>
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
              <Grid container spacing={1}>
                {selections}
              </Grid>
            </Box>

            <Box mt={2}>
              <Typography variant="body2">
                The following stocks will be added to sector:
              </Typography>

              {stock_links}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={() => add()}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  return <ShowResource {...{ resource, on_success: render_data }} />;
}

AddStocksToSectorDialog.propTypes = {
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      symbol: PropTypes.string,
    }),
  ).isRequired,
};

import React, { useState, useContext } from "react";
import { map, remove } from "lodash";
import Fetch from "src/components/Fetch";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Typography,
  Tooltip,
  Grid,
  Divider,
} from "@material-ui/core";
import GlobalContext from "src/context";
import { useMutate } from "restful-react";
import SimpleSnackbar from "src/components/SimpleSnackbar";
import PropTypes from "prop-types";
import Popover from "@material-ui/core/Popover";
import UpdateStock from "src/components/stock/UpdateStock";
import DeleteStock from "src/components/stock/DeleteStock";

export default function StockLinkToSector(props) {
  const { api } = useContext(GlobalContext);
  const { symbol, resource_uri } = props;
  const [resource] = useState("/sectors");
  const [notification, setNotification] = useState("");
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const open_sector_list = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const close_sector_list = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const { mutate: update } = useMutate({
    verb: "PATCH",
    path: `${api}${resource}/`,
  });

  const handle_update = (sectors, event) => {
    for (let i = 0; i < sectors.length; i++) {
      let s = sectors[i];

      // make a local copy for manipulation
      let tmp = [...s.stocks];

      let msg = "";

      // conditions
      if (s.name === event.target.name) {
        if (event.target.checked) {
          // add to
          tmp.push(resource_uri);

          msg = `I am now part of sector "${s.name}"`;
        } else {
          // remove
          remove(tmp, (k) => k.includes(resource_uri));
          msg = `I have been removed from sector "${s.name}"`;
        }

        // call backend payload
        const data = { ...s, stocks: tmp };

        // MUST: make a copy and update `sectors` because it will
        // force a re-render of this component, thus will fetch data
        // from backend.
        sectors[i] = { ...data };

        // make the API call
        update({ objects: [data] }).then(setNotification(msg));

        // I'm done here
        break;
      }
    }
  };

  const render_data = (data) => {
    const sectors = data.objects;

    let mapped_sectors = map(sectors, (s) => {
      // add checked bool
      return { ...s, checked: s.stocks.some((i) => i.includes(resource_uri)) };
    });

    const selections = map(mapped_sectors, (s) => {
      return (
        <Grid item key={s.id} lg={2} sm={3} xs={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={s.checked}
                onChange={(e) => handle_update(sectors, e)}
                name={s.name}
              />
            }
            label={s.name}
          />
        </Grid>
      );
    });

    const form = (
      <>
        <Typography variant="h3">Link {symbol} to a Sector</Typography>
        <Divider />
        <Box mt={2}>
          <FormControl component="fieldset">
            <FormGroup>
              <Grid container spacing={1}>
                {selections}
              </Grid>
            </FormGroup>
          </FormControl>
        </Box>
        <SimpleSnackbar msg={notification} />
      </>
    );

    return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={close_sector_list}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box padding={2}>
          {form}

          {!!resource_uri ? (
            <>
              <Divider />
              <Box mt={2}>
                <Grid container spacing={1}>
                  <UpdateStock {...props} />
                  <DeleteStock {...props} />
                </Grid>
              </Box>
            </>
          ) : null}
        </Box>
      </Popover>
    );
  };

  return (
    <Box display="inline">
      <Tooltip
        title="Assign stock to a sector"
        onClick={open_sector_list}
        arrow
      >
        <Typography color="secondary" display="inline">
          &#47;&#47;
        </Typography>
      </Tooltip>
      {open ? (
        <Fetch {...{ api, resource, render_data, silent: true }} />
      ) : null}
    </Box>
  );
}

StockLinkToSector.propTypes = {
  symbol: PropTypes.string.isRequired,
  resource_uri: PropTypes.string,
};

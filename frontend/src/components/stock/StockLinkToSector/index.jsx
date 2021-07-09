import React, { useState, useContext } from "react";
import { map, remove, isEmpty } from "lodash";
import Fetch from "src/components/Fetch";
import {
  Box,
  FormControl,
  FormLabel,
  FormControlLabel,
  FormGroup,
  Checkbox,
} from "@material-ui/core";
import GlobalContext from "src/context";
import DropdownMenu from "src/components/DropdownMenu";
import { useMutate } from "restful-react";
import SimpleSnackbar from "src/components/SimpleSnackbar";
import PropTypes from "prop-types";

export default function StockSector(props) {
  const { api } = useContext(GlobalContext);
  const [resource] = useState("/sectors");
  const [changed, setChanged] = useState("");

  const { stock_resource } = props;

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
          tmp.push(`/api/v1${stock_resource}/`);

          msg = `I am now part of sector "${s.name}"`;
        } else {
          // remove
          remove(tmp, k => k.includes(stock_resource));
          msg = `I have been removed from sector "${s.name}"`;
        }

        // call backend payload
        const data = { ...s, stocks: tmp };

        // MUST: make a copy and update `sectors` because it will
        // force a re-render of this component, thus will fetch data
        // from backend.
        sectors[i] = { ...data };

        // make the API call
        update({ objects: [data] }).then(() => setChanged(msg));

        // I'm done here
        break;
      }
    }
  };

  const render_data = data => {
    const sectors = data.objects;

    let mapped_sectors = map(sectors, s => {
      // add checked bool
      return { ...s, checked: s.stocks.some(i => i.includes(stock_resource)) };
    });

    const selections = map(mapped_sectors, s => {
      return (
        <FormControlLabel
          key={s.id}
          control={
            <Checkbox
              checked={s.checked}
              onChange={e => handle_update(sectors, e)}
              name={s.name}
            />
          }
          label={s.name}
        />
      );
    });

    const form = (
      <Box>
        <SimpleSnackbar msg={changed} />
        <FormControl component="fieldset">
          <FormLabel component="legend">Select a sector</FormLabel>
          <FormGroup>{selections}</FormGroup>
        </FormControl>
      </Box>
    );

    return <DropdownMenu content={form} keep_open />;
  };

  return <Fetch {...{ api, resource, render_data }} />;
}

StockSector.propTypes = {
  stock_resource: PropTypes.string.isRequired,
};

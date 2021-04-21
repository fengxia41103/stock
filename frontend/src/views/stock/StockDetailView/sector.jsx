import React, { useState, useContext } from "react";
import { map, remove } from "lodash";
import Fetch from "src/components/Fetch";
import {
  Box,
  Button,
  Grid,
  Link,
  TextField,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  FormControlLabel,
  FormGroup,
  Checkbox,
  CircularProgress,
} from "@material-ui/core";
import GlobalContext from "src/context";
import UpdateIcon from "@material-ui/icons/Update";
import DropdownMenu from "src/components/DropdownMenu";
import { useMutate } from "restful-react";

export default function StockSector(props) {
  const { api } = useContext(GlobalContext);
  const [resource] = useState("/sectors");
  const { stock } = props;
  const [updated, setUpdated] = useState(false);
  let sectors = [];
  const [tmp, setTmp] = useState();

  const { mutate: update } = useMutate({
    verb: "PATCH",
    path: `${api}${resource}/`,
  });

  const handleChange = event => {
    sectors.some(s => {
      let tmp = [...s.stocks];
      if (s.name === event.target.name) {
        if (event.target.checked) {
          // add to
          tmp.push(`/api/v1${stock}/`);
        } else {
          // remove
          remove(tmp, k => k.includes(stock));
        }

        // call backend
        update({ objects: [{ ...s, stocks: tmp }] }).then(setUpdated(!updated));

        return true;
      }
    });
  };

  const render_data = data => {
    sectors = map(data.objects, s => {
      // add checked bool
      return { ...s, checked: s.stocks.some(i => i.includes(stock)) };
    });

    const selections = map(sectors, s => {
      return (
        <FormControlLabel
          key={s.id}
          control={
            <Checkbox
              checked={s.checked}
              onChange={handleChange}
              name={s.name}
            />
          }
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

    return <DropdownMenu content={form} />;
  };

  return <Fetch {...{ api, resource, render_data }} />;
}

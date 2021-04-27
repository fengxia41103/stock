import React, { useState, useContext } from "react";
import { map, remove, isEmpty } from "lodash";
import Fetch from "src/components/Fetch";
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  FormGroup,
  Checkbox,
} from "@material-ui/core";
import GlobalContext from "src/context";
import DropdownMenu from "src/components/DropdownMenu";
import { useMutate } from "restful-react";

export default function StockSector(props) {
  const { api } = useContext(GlobalContext);
  const [resource] = useState("/sectors");
  const { stock_resource } = props;
  let sectors = [];

  const { mutate: update } = useMutate({
    verb: "PATCH",
    path: `${api}${resource}/`,
  });

  const handleChange = event => {
    for (let i = 0; i < sectors.length; i++) {
      let s = sectors[i];

      // make a local copy for manipulation
      let tmp = [...s.stocks];

      // conditions
      if (s.name === event.target.name) {
        if (event.target.checked) {
          // add to
          tmp.push(`/api/v1${stock_resource}/`);
        } else {
          // remove
          remove(tmp, k => k.includes(stock_resource));
        }

        // call backend
        const data = { ...s, stocks: tmp };

        // MUST: make a copy and update `sectors` because it will
        // force a re-render of this component, thus will fetch data
        // from backend.
        sectors[i] = { ...data };
        update({ objects: [data] });
        break;
      }
    }
  };

  const render_data = data => {
    if (isEmpty(sectors)) {
      sectors = data.objects;
    }

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

    return <DropdownMenu content={form} keep_open/>;
  };

  return <Fetch key={sectors} {...{ api, resource, render_data }} />;
}

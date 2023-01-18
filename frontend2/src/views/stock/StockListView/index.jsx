import { filter, groupBy, map, sortBy } from "lodash";
import React, { useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";

import { DropdownMenu, Page, PollResource } from "@fengxia41103/storybook";

import AddStocksToSectorDialog from "@Components/sector/AddStocksToSectorDialog";
import ExportStocks from "@Components/stock/ExportStocks";
import ListStockCard from "@Components/stock/ListStockCard";
import UpdateAllStock from "@Components/stock/UpdateAllStock";

const StockListView = () => {
  const [resource] = useState("/stocks");
  const [searching, setSearching] = useState("");
  const [group_by, setGroupBy] = useState("last_reporting_date");

  const symbol_filter_change = (event) => {
    const tmp = event.target.value.trim().toUpperCase();
    setSearching(tmp);
  };

  const group_by_change = (event) => {
    setGroupBy(event.target.value);
  };

  const render_data = (data) => {
    const { objects: stocks } = data;

    // filter based on search string
    const filtered = filter(stocks, (x) => x.symbol.includes(searching));

    // when select
    const grouped = groupBy(filtered, (v) => {
      let g = null;

      switch (group_by) {
        case "name":
          g = v.symbol.charAt(0);
          break;

        default:
          g = v.last_reporting_date;
          break;
      }

      return g;
    });

    const sorted_keys = sortBy(Object.keys(grouped));
    const selectors = map(sorted_keys, (index) => {
      const symbols = grouped[index];
      const sorted = sortBy(symbols, (s) => s.symbol);

      const actions = [<AddStocksToSectorDialog stocks={sorted} />];
      return (
        <Grid key={index} item lg={6} md={6} sm={12} xs={12}>
          <ListStockCard {...{ group_by, index, actions }} stocks={sorted} />
        </Grid>
      );
    });

    const menu = (
      <FormControl component="fieldset">
        <FormLabel component="legend">Group By</FormLabel>
        <RadioGroup
          aria-label="Group By"
          name="group_by"
          value={group_by}
          onChange={group_by_change}
          row
        >
          <FormControlLabel value="name" control={<Radio />} label="Alphabet" />
          <FormControlLabel
            value="last_reporting_date"
            control={<Radio />}
            label="Last Income Statement Date"
          />
        </RadioGroup>
      </FormControl>
    );

    return (
      <Page title="Stocks">
        <Container maxWidth={false}>
          <Box mt={1}>
            <Grid container spacing={1} direction="row" alignItems="center">
              <Grid item xs>
                <UpdateAllStock stocks={filtered} />
              </Grid>

              <Grid item xs>
                <ExportStocks {...{ stocks }} />
              </Grid>
              <Grid item xs>
                <DropdownMenu content={menu} />
              </Grid>
            </Grid>
          </Box>

          <Box mt={1}>
            <Card>
              <CardContent>
                <TextField
                  label="Filter by Symbol"
                  value={searching}
                  onChange={symbol_filter_change}
                  fullWidth
                />
              </CardContent>
            </Card>
          </Box>
          <Box mt={3}>
            <Grid container spacing={1}>
              {selectors}
            </Grid>
          </Box>
        </Container>
      </Page>
    );
  };

  return (
    <PollResource {...{ resource, on_success: render_data, interval: 10 }} />
  );
};

export default StockListView;

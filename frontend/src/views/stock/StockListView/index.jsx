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

import { useStocks } from "@/api";
import { DropdownMenu, Page } from "@/components/shared";
import AddStocksToSectorDialog from "@Components/sector/AddStocksToSectorDialog";
import ExportStocks from "@Components/stock/ExportStocks";
import ListStockCard from "@Components/stock/ListStockCard";
import UpdateAllStock from "@Components/stock/UpdateAllStock";
import ScaleLoader from "react-spinners/ScaleLoader";

const StockListView = () => {
  const [searching, setSearching] = useState("");
  const [group_by, setGroupBy] = useState("last_reporting_date");
  const { data, isLoading } = useStocks();

  if (isLoading) return <ScaleLoader loading />;

  const stocks = data?.results || data || [];

  // filter based on search string
  const filtered = filter(stocks, (x) =>
    x.symbol.includes(searching.toUpperCase()),
  );

  // group
  const grouped = groupBy(filtered, (v) => {
    return group_by === "name" ? v.symbol.charAt(0) : v.last_reporting_date;
  });

  const sorted_keys = sortBy(Object.keys(grouped));
  const selectors = map(sorted_keys, (index) => {
    const symbols = grouped[index];
    const sorted = sortBy(symbols, (s) => s.symbol);
    const actions = [<AddStocksToSectorDialog key="add" stocks={sorted} />];
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
        onChange={(e) => setGroupBy(e.target.value)}
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
      <Box mt={1}>
        <Grid container spacing={1} direction="row" alignItems="center">
          <Grid item xs>
            <UpdateAllStock stocks={filtered} />
          </Grid>
          <Grid item xs>
            <ExportStocks stocks={stocks} />
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
              onChange={(e) =>
                setSearching(e.target.value.trim().toUpperCase())
              }
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
    </Page>
  );
};

export default StockListView;

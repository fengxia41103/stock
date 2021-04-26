import React, { useState, useContext } from "react";
import { map, filter, sortBy, groupBy } from "lodash";
import Fetch from "src/components/Fetch";
import {
  Box,
  Button,
  Container,
  Grid,
  Link,
  TextField,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  CircularProgress,
} from "@material-ui/core";
import Page from "src/components/Page";
import ListStockCard from "src/components/stock/ListStockCard";
import GlobalContext from "src/context";
import { Poll } from "restful-react";
import AddNewStockDialog from "src/components/stock/AddNewStockDialog";
import UpdateIcon from "@material-ui/icons/Update";
import DropdownMenu from "src/components/DropdownMenu";

function StockListView(props) {
  const { api } = useContext(GlobalContext);
  const [resource] = useState("/stocks");
  const [searching, setSearching] = useState("");
  const [group_by, setGroupBy] = useState("last_reporting_date");

  const symbol_filter_change = event => {
    const tmp = event.target.value.trim().toUpperCase();
    setSearching(tmp);
  };

  const group_by_change = event => {
    setGroupBy(event.target.value);
  };

  // API will treat `all:True` as a request to update all stocks.
  const update_all = stocks => {
    const call_api = s => {
      const uri = `${api}${resource}/${s.id}/`;
      fetch(uri, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
    };
    stocks.forEach(s => call_api(s));
  };

  const render_data = data => {
    const stocks = data.objects;
    // filter based on search string
    const filtered = filter(stocks, x => x.symbol.includes(searching));

    // when select
    const grouped = groupBy(filtered, v => {
      let g = null;

      switch (group_by) {
        case "name":
          g = v.symbol.charAt(0);
          break;

        case "sector":
          g = v.sectors[0];
          break;

        default:
          g = v.last_reporting_date;
          break;
      }

      return g;
    });

    const sorted_keys = sortBy(Object.keys(grouped));
    const selectors = map(sorted_keys, index => {
      const symbols = grouped[index];
      const sorted = sortBy(symbols, s => s.symbol);
      const links = map(sorted, v => {
        return (
          <Link key={v.id} href={`/app/stocks/${v.id}/`}>
            {v.symbol}
          </Link>
        );
      });

      return (
        <ListStockCard key={index} {...{ group_by, index }} stocks={links} />
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
          <FormControlLabel value="sector" control={<Radio />} label="Sector" />
        </RadioGroup>
      </FormControl>
    );

    return (
      <Page title="Stocks">
        <Container maxWidth={false}>
          <Box mt={1}>
            <Grid
              container
              spacing={1}
              direction="row"
              justify="flex-end"
              alignItems="center"
            >
              <Grid item xs>
                <Button color="primary" onClick={() => update_all(filtered)}>
                  <UpdateIcon />
                  Update All
                </Button>
              </Grid>

              <Grid item xs>
                <AddNewStockDialog />
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
                  fullWidth={true}
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

  return <Fetch {...{ api, resource, render_data }} />;
  return (
    <Poll
      path={api + encodeURI(resource)}
      resolve={data => data && data.objects}
    >
      {(data, { loading }) =>
        loading ? <CircularProgress /> : render_data(data)
      }
    </Poll>
  );
}
export default StockListView;

import React, { useState, useContext } from "react";
import { map, filter, sortBy, groupBy } from "lodash";
import Fetch from "src/components/fetch.jsx";
import {
  Box,
  Container,
  Grid,
  Link,
  TextField,
  Card,
  CardContent,
} from "@material-ui/core";

import Page from "src/components/Page";
import StockListGroupCard from "./card.jsx";
import GlobalContext from "src/context";

function StockListView(props) {
  const { api } = useContext(GlobalContext);

  const [resource] = useState("/stocks");
  const [searching, setSearching] = useState("");

  const handleChange = event => {
    const tmp = event.target.value.trim().toUpperCase();
    setSearching(tmp);
  };

  const render_data = data => {
    const stocks = data.objects;

    // filter based on search string
    const filtered = filter(stocks, x => x.symbol.includes(searching));

    // when select
    const grouped = groupBy(filtered, v => v.last_reporting_date);
    const selectors = map(grouped, (symbols, reporting_date) => {
      const sorted = sortBy(symbols, s => s.symbol);
      const links = map(sorted, v => {
        return (
          <Link key={v.id} href={"/app/stocks/" + v.id}>
            {v.symbol}
          </Link>
        );
      });

      return (
        <StockListGroupCard
          key={reporting_date}
          reporting_date={reporting_date}
          stocks={links}
        />
      );
    });

    return (
      <Page title="Stocks">
        <Container maxWidth={false}>
          <Box mt={3}>
            <Card>
              <CardContent>
                <TextField
                  label="Filter by Symbol"
                  value={searching}
                  onChange={handleChange}
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

  return <Fetch api={api} resource={resource} render_data={render_data} />;
}
export default StockListView;

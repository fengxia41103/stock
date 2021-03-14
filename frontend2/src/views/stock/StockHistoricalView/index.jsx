import React, { useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Link,
  TextField,
  Card,
  CardContent,
  Typography,
} from "@material-ui/core";
import Page from "src/components/Page";
import StockHistoricalContext from "./context.jsx";
import PriceView from "src/views/stock/PriceView";

//import StockHistorical from "./historical.jsx";

function StockHistoricalView() {
  const { id } = useParams();
  const [start, setStart] = useState("2021-02-01");
  const [end, setEnd] = useState(new Date().toLocaleDateString("en-CA"));

  const start_change = event => {
    setStart(event.target.value);
  };
  const end_change = event => {
    setEnd(event.target.value);
  };

  // make up a key to force child re-rendering
  const key = start + end;

  return (
    <Page title="Stock Historicals">
      <Container maxWidth={false}>
        <Box mt={3}>
          <Card>
            <CardContent>
              <Grid container spacing={1}>
                <Grid item xs>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={start}
                    onChange={start_change}
                    fullWidth={true}
                  />
                </Grid>
                <Grid item xs>
                  <TextField
                    label="End Date"
                    type="date"
                    value={end}
                    onChange={end_change}
                    fullWidth={true}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        <StockHistoricalContext.Provider value={{ start, end }}>
          <PriceView />
          <Outlet />
        </StockHistoricalContext.Provider>
      </Container>
    </Page>
  );
}

export default StockHistoricalView;

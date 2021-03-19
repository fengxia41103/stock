import React, { useState, useContext } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Box, Grid, TextField, Card, CardContent } from "@material-ui/core";
import StockHistoricalContext from "./context.jsx";
import GlobalContext from "src/context";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";
import Fetch from "src/components/fetch.jsx";

//import StockHistorical from "./historical.jsx";

function StockHistoricalView() {
  const { id } = useParams();
  const { api } = useContext(GlobalContext);
  const [start, setStart] = useState("2021-02-01");
  const [end, setEnd] = useState(new Date().toLocaleDateString("en-CA"));
  const resource = `/historical/stats?stock=${id}&start=${start}&end=${end}`;

  const start_change = event => {
    setStart(event.target.value);
  };
  const end_change = event => {
    setEnd(event.target.value);
  };

  const render_data = resp => {
    const data = resp.objects[0].stats;

    return (
      <Box>
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

        <StockHistoricalContext.Provider value={data}>
          <Box mt={3}>
            <Outlet />
          </Box>
        </StockHistoricalContext.Provider>
      </Box>
    );
  };
  // MUST: forcing re-fetch if the key is changing!
  const key = start + end;
  return <Fetch {...{ key, api, resource, render_data }} />;
}

export default StockHistoricalView;

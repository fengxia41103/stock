import React, { useState } from "react";
import { Outlet, useParams } from "react-router-dom";

import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

import { ShowResource } from "@fengxia41103/storybook";

import { get_last_month_string, get_today_string } from "src/utils/helper.jsx";

import StockHistoricalContext from "./context.jsx";

function StockHistoricalView() {
  const { id } = useParams();
  const [start, setStart] = useState(get_last_month_string());
  const [end, setEnd] = useState(get_today_string());
  const resource = `/historicals?stock=${id}&on__range=${start},${end}`;

  const start_change = (event) => {
    const new_start = event.target.value;
    setStart(new_start);
  };
  const end_change = (event) => {
    const new_end = event.target.value;
    setEnd(new_end);
  };

  const render_data = (resp) => {
    const data = resp.objects;

    // WARNING: for some reason I don't have its price, thus nothing
    // to be shown here.
    if (data.length === 0) {
      return null;
    }

    return (
      <>
        <Typography variant="h1">{data[0].symbol} Historical</Typography>
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
          <Box mt={1}>
            <Outlet />
          </Box>
        </StockHistoricalContext.Provider>
      </>
    );
  };
  // MUST: forcing re-fetch if the key is changing!
  const key = resource;
  return <ShowResource {...{ key, resource, on_success: render_data }} />;
}

export default StockHistoricalView;

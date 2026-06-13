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

import ShowResource from "@Components/common/ShowResource";

import { get_last_month_string, get_today_string } from "@Utils/helper";

import StockHistoricalContext from "./context";

const StockHistoricalView = () => {
  const { id } = useParams();
  const [start, setStart] = useState(get_last_month_string());
  const [end, setEnd] = useState(get_today_string());
  const resource = `/historicals?stock=${id}&on__range=${start},${end}`;

  const start_change = (event) => {
    setStart(event.target.value);
  };
  const end_change = (event) => {
    setEnd(event.target.value);
  };

  const render_data = (resp) => {
    const data = Array.isArray(resp) ? resp : resp.objects || [];

    if (data.length === 0) {
      return <Typography>No data in this date range.</Typography>;
    }

    return (
      <StockHistoricalContext.Provider value={data}>
        <Box mt={1}>
          <Outlet />
        </Box>
      </StockHistoricalContext.Provider>
    );
  };

  const key = resource;
  return (
    <>
      <Typography variant="h2">Historical Price</Typography>
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
                  fullWidth
                />
              </Grid>
              <Grid item xs>
                <TextField
                  label="End Date"
                  type="date"
                  value={end}
                  onChange={end_change}
                  fullWidth
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
      <ShowResource {...{ key, resource, on_success: render_data }} />
    </>
  );
};

export default StockHistoricalView;

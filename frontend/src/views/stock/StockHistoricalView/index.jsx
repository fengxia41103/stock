import React, { useState, useContext, useRef, useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import {
  Box,
  Grid,
  TextField,
  Card,
  CardContent,
  Typography,
} from "@material-ui/core";

import StockHistoricalContext from "./context.jsx";
import GlobalContext from "src/context";
import Fetch from "src/components/Fetch";
import { get_today_string, get_last_month_string } from "src/utils/helper.jsx";

function StockHistoricalView() {
  const { id } = useParams();
  const { api } = useContext(GlobalContext);
  const [start, setStart] = useState(get_last_month_string());
  const [end, setEnd] = useState(get_today_string);
  const [resource, setResource] = useState(
    `/historicals?stock=${id}&on__range=${start},${end}`
  );

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => (mounted.current = false);
  });

  const start_change = event => {
    const new_start = event.target.value;
    setStart(new_start);

    setResource(`/historicals?stock=${id}&on__range=${new_start},${end}`);
  };
  const end_change = event => {
    const new_end = event.target.value;
    setEnd(new_end);

    setResource(`/historicals?stock=${id}&on__range=${start},${new_end}`);
  };

  const render_data = resp => {
    if (!mounted.current) return null;

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
  return <Fetch {...{ key, api, resource, render_data, mounted }} />;
}

export default StockHistoricalView;

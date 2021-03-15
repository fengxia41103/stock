import React, { useContext, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Link,
  Card,
  CardContent,
  Typography,
} from "@material-ui/core";
import GlobalContext from "src/context";
import StockHistoricalContext from "src/views/stock/StockHistoricalView/context.jsx";
import Fetch from "src/components/fetch.jsx";

function PriceView() {
  const { id } = useParams();
  const { api } = useContext(GlobalContext);
  const { start, end } = useContext(StockHistoricalContext);

  const render_data = resp => {
    const { objects: data } = resp;
    console.log(data[0].stats.olds.length);
    return (
      <Box mt={3}>
        <Typography variant="body2">{start}</Typography>
        &mdash;
        <Typography variant="body2">{end}</Typography>
        <Outlet />
      </Box>
    );
  };

  const resource = `/historical/stats?stock=${id}&start=${start}&end=${end}`;
  // MUST: forcing re-fetch if the key is changing!
  const key = start + end;
  return (
    <Fetch key={key} api={api} resource={resource} render_data={render_data} />
  );
}
export default PriceView;

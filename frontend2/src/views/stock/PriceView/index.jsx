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
  const { start, end, key } = useContext(StockHistoricalContext);
  const [resource, setResource] = useState();
  setResource(`/stocks/${id}?start=${start}&end=${end}`);

  const render_data = stock => {
    const { olds: historicals, stats, indexes } = stock;

    return (
      <Box mt={3}>
        <Typography variant="body2">{start}</Typography>
        &mdash;
        <Typography variant="body2">{end}</Typography>
        <Outlet />
      </Box>
    );
  };

  return <Fetch api={api} resource={resource} render_data={render_data} />;
}
export default PriceView;

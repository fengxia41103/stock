import React, { useState, useContext } from "react";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import Fetch from "src/components/Fetch";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardHeader,
} from "@material-ui/core";
import StocksPriceChart from "src/components/stock/StocksPriceChart";
import { map } from "lodash";

export default function SectorPriceView() {
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_property, s => s.id).join(",");
  const [start] = useState("2021-02-01");
  const [end] = useState(new Date().toLocaleDateString("en-CA"));

  const title = `Normalized price between ${start} and ${end}`;

  return (
    <Box>
      <Typography variant={"h1"}>Price Comparison</Typography>

      <Box mt={3}>
        <Card>
          <CardHeader title={<Typography variant="h3">{title}</Typography>} />

          <CardContent>
            <StocksPriceChart {...{ stocks: stock_ids, start, end }} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

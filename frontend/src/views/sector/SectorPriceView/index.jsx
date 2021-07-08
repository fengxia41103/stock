import React, { useState, useContext } from "react";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardHeader,
} from "@material-ui/core";
import StocksPriceChart from "src/components/stock/StocksPriceChart";
import { map } from "lodash";
import { get_today_string, get_last_month_string } from "src/utils/helper.jsx";

export default function SectorPriceView() {
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_property, s => s.id);
  const [start] = useState(get_last_month_string());
  const [end] = useState(get_today_string());

  const title = `Normalized price between ${start} and ${end}`;

  return (
    <Box>
      <Typography variant={"h1"}>Price Comparison</Typography>

      <Box mt={1}>
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

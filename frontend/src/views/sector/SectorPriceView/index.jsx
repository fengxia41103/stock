import { map } from "lodash";
import React, { useContext, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from "@material-ui/core";

import SectorPriceTrending from "src/components/sector/SectorPriceTrending";
import StocksPriceChart from "src/components/stock/StocksPriceChart";
import { get_last_month_string, get_today_string } from "src/utils/helper.jsx";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";

export default function SectorPriceView() {
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_detail, (s) => s.id);
  const [start] = useState(get_last_month_string());
  const [end] = useState(get_today_string());

  return (
    <>
      <Typography variant={"h1"}>Price Comparison</Typography>

      <Box mt={1}>
        <Card>
          <CardHeader
            title={
              <Typography variant="h3">
                {`Normalized price between ${start} and ${end}`}
              </Typography>
            }
          />

          <CardContent>
            <StocksPriceChart {...{ stocks: stock_ids, start, end }} />
          </CardContent>
        </Card>
      </Box>

      <Box mt={1}>
        <SectorPriceTrending {...{ stocks: stock_ids, start, end }} />
      </Box>
    </>
  );
}

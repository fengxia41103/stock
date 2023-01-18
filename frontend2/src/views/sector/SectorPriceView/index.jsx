import { map } from "lodash";
import React, { useContext, useState } from "react";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";

import SectorPriceTrending from "@Components/sector/SectorPriceTrending";
import StocksPriceChart from "@Components/stock/StocksPriceChart";
import { get_last_month_string, get_today_string } from "@Utils/helper";
import SectorDetailContext from "@Views/sector/SectorDetailView/context";

const SectorPriceView = () => {
  const sector = useContext(SectorDetailContext);
  const { stocks_detail } = sector;

  const stock_ids = map(stocks_detail, (s) => s.id);
  const [start] = useState(get_last_month_string());
  const [end] = useState(get_today_string());

  return (
    <>
      <Typography variant="h1">Price Comparison</Typography>

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
};

export default SectorPriceView;

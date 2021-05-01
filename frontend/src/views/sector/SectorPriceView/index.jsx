import React, { useState, useContext } from "react";
import GlobalContext from "src/context";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import { map, groupBy } from "lodash";
import Fetch from "src/components/Fetch";
import MultilineChart from "src/components/MultilineChart";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardHeader,
} from "@material-ui/core";

export default function SectorPriceView() {
  const { api } = useContext(GlobalContext);
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_property, s => s.id).join(",");
  const [start] = useState("2021-02-01");
  const [end] = useState(new Date().toLocaleDateString("en-CA"));
  const [resource] = useState(
    `/historicals?stock__in=${stock_ids}&on__range=${start},${end}`
  );

  const render_data = resp => {
    const data = resp.objects;
    const group_by_symbol = groupBy(data, d => d.symbol);

    console.log(group_by_symbol);

    const chart_data = map(group_by_symbol, (prices, symbol) => {
      return {
        symbol: symbol,
        data: prices,
      };
    });

    const title = `Normalized price between ${start} and ${end}`;

    return (
      <Box>
        <Typography variant={"h1"}>Price Comparison</Typography>

        <Box mt={3}>
          <Card>
            <CardHeader title={<Typography variant="h3">{title}</Typography>} />

            <CardContent>
              <MultilineChart
                {...{
                  data: chart_data,
                  category_by: "on",
                  label_by: "symbol",
                  data_by: "close_price",
                  normalized: true,
                }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  };

  return <Fetch {...{ api, resource, render_data }} />;
}

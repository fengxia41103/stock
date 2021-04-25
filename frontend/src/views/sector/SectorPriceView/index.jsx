import React, { useState, useContext } from "react";
import GlobalContext from "src/context";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import { map } from "lodash";
import Fetch from "src/components/Fetch";
import MultilineChart from "src/components/MultilineChart";
import {
  Box,
  Grid,
  TextField,
  Card,
  CardContent,
  Typography,
} from "@material-ui/core";

export default function SectorPriceView() {
  const { api } = useContext(GlobalContext);
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_id_symbol, s => s.id).join(",");
  //const [resource] = useState(`/stock-ranks?id__in=${stock_ids}`);
  const [start, setStart] = useState("2021-02-01");
  const [end, setEnd] = useState(new Date().toLocaleDateString("en-CA"));
  const [resource] = useState(
    `/historical/stats?stock__in=${stock_ids}&start=${start}&end=${end}`
  );

  const render_data = data => {
    const stats = data.objects;
    const chart_data = map(stats, s => {
      return {
        symbol: s.stats.symbol,
        data: s.stats.olds,
      };
    });

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
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
        </Grid>

        <Grid item xs={12}></Grid>
      </Grid>
    );
  };

  return <Fetch {...{ api, resource, render_data }} />;
}

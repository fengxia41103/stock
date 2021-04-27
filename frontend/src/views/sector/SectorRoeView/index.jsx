import React, { useContext } from "react";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import { map } from "lodash";

import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
} from "@material-ui/core";
import SectorDupontBreakdownChart from "src/components/sector/SectorDupontBreakdownChart";
import SectorDupontLineChart from "src/components/sector/SectorDupontLineChart";

export default function SectorRoeView() {
  const sector = useContext(SectorDetailContext);

  const interests = [
    {
      attr: "net_profit_margin",
      header: "Net Profit Margin (%)",
    },
    {
      attr: "asset_turnover",
      header: "Asset Turnover Ratio (%)",
    },
    {
      attr: "equity_multiplier",
      header: "Equity Multiplier",
    },
    {
      attr: "assets",
      header: "Assets",
    },
    {
      attr: "equity",
      header: "Equity",
    },
    {
      attr: "revenue",
      header: "Revenue",
    },
  ];

  const charts = map(interests, i => {
    return (
      <Grid item lg={4} xs={12}>
        <Card>
          <CardHeader title={i.header} />
          <CardContent>
            <SectorDupontLineChart property={i.attr} />
          </CardContent>
        </Card>
      </Grid>
    );
  });
  return (
    <Box>
      <Typography variant={"h1"}>ROE Comparison</Typography>
      <Typography variant={"body2"}>{sector.name}</Typography>

      <Box mt={3}>
        <SectorDupontBreakdownChart />
      </Box>

      <Box mt={3}>
        <Grid container spacing={1}>
          {charts}
        </Grid>
      </Box>
    </Box>
  );
}

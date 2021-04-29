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
import SectorRoeColumnChart from "src/components/sector/SectorRoeColumnChart";

export default function SectorRoeView() {
  const sector = useContext(SectorDetailContext);

  const breakdowns = [
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

  const roe_breakdown_charts = map(breakdowns, i => {
    return (
      <Grid item key={i.header} lg={4} xs={12}>
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

      <Box mt={3}>
        <SectorDupontBreakdownChart />
      </Box>
      <Box mt={3}>
        <SectorRoeColumnChart />
      </Box>

      <Box mt={3}>
        <Grid container spacing={1}>
          {roe_breakdown_charts}
        </Grid>
      </Box>
    </Box>
  );
}

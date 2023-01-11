import { map } from "lodash";
import React from "react";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from "@mui/material";

import SectorDupontBreakdownChart from "src/components/sector/SectorDupontBreakdownChart";
import SectorDupontLineChart from "src/components/sector/SectorDupontLineChart";
import SectorRoeColumnChart from "src/components/sector/SectorRoeColumnChart";

const SectorRoeView = () => {
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
    { attr: "debts", header: "Debts" },
    {
      attr: "revenue",
      header: "Revenue",
    },
  ];

  const roe_breakdown_charts = map(breakdowns, (i) => {
    return (
      <Grid item key={i.header} lg={4} sm={6} xs={12}>
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
    <>
      <Typography variant={"h1"}>ROE Comparison</Typography>

      <Box mt={1}>
        <SectorDupontBreakdownChart />
      </Box>
      <Box mt={1}>
        <SectorRoeColumnChart />
      </Box>

      <Box>
        <Grid container spacing={1}>
          {roe_breakdown_charts}
        </Grid>
      </Box>
    </>
  );
};

export default SectorRoeView;

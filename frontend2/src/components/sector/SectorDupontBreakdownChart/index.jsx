import { map } from "lodash";
import React, { useContext } from "react";

import { Card, CardContent, Typography } from "@mui/material";

import { DropdownMenu, HighchartGraph } from "@fengxia41103/storybook";

import SectorDetailContext from "@Views/sector/SectorDetailView/context";

const SectorDupontBreakdownChart = () => {
  const sector = useContext(SectorDetailContext);
  const { stocks_detail } = sector;

  const chart_data = map(stocks_detail, (s) => {
    const data = map(s.dupont_model, (d) => {
      return {
        name: d.on,
        x: d.net_profit_margin,
        y: d.asset_turnover,
        z: d.equity_multiplier,
      };
    });
    return {
      name: s.symbol,
      data,
    };
  });

  const helper = (
    <Typography variant="body2">
      Dupont ROE breakdowns are to demonstrate how a company has performed in
      three categoreis: net profit margin (X-axis), asset turnover rate
      (Y-axis), and debt leverage (size of the bubble).
    </Typography>
  );

  return (
    <Card>
      <CardContent>
        <DropdownMenu title="Learn more" content={helper} />

        <HighchartGraph
          type="bubble"
          categories={[]}
          xLabel="Net Profit Margin (%)"
          yLabel="Asset TurnOver (%)"
          title=""
          legendEnabled
          data={chart_data}
        />
      </CardContent>
    </Card>
  );
};

export default SectorDupontBreakdownChart;

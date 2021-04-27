import React, { useState, useContext } from "react";
import GlobalContext from "src/context";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import { map } from "lodash";
import { randomId } from "src/utils/helper.jsx";
import HighchartGraphBox from "src/components/Highchart";

import { Box, Typography, Card, CardContent } from "@material-ui/core";

export default function SectorRoeView() {
  const sector = useContext(SectorDetailContext);

  const containerId = randomId();
  const chart_data = map(sector.stocks, s => {
    const data = map(s.dupont_model, d => {
      return {
        name: d.on,
        x: d.net_profit_margin,
        y: d.asset_turnover,
        z: d.equity_multiplier,
      };
    });
    return {
      name: s.symbol,
      data: data,
    };
  });

  return (
    <Box>
      <Typography variant={"h1"}>Sector "{sector.name}" ROE</Typography>

      <Box mt={3}>
        <Card>
          <CardContent>
            <HighchartGraphBox
              containerId={containerId}
              type="bubble"
              categories={[]}
              xLabel="Net Profit Margin (%)"
              yLabel="Asset TurnOver Ratio"
              title=""
              legendEnabled={true}
              data={chart_data}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

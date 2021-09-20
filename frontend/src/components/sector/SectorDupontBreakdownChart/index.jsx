import { Typography, Card, CardContent } from "@material-ui/core";
import { map } from "lodash";
import React, { useContext } from "react";

import DropdownMenu from "src/components/common/DropdownMenu";
import HighchartGraphBox from "src/components/common/Highchart";
import { randomId } from "src/utils/helper.jsx";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";

export default function SectorDupontBreakdownChart() {
  const sector = useContext(SectorDetailContext);

  const containerId = randomId();
  const chart_data = map(sector.stocks_detail, (s) => {
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
    <Typography variant={"body2"}>
      Dupont ROE breakdowns are to demonstrate how a company has performed in
      three categoreis: net profit margin (X-axis), asset turnover rate
      (Y-axis), and debt leverage (size of the bubble).
    </Typography>
  );

  return (
    <Card>
      <CardContent>
        <DropdownMenu title="Learn more" content={helper} />

        <HighchartGraphBox
          containerId={containerId}
          type="bubble"
          categories={[]}
          xLabel="Net Profit Margin (%)"
          yLabel="Asset TurnOver (%)"
          title=""
          legendEnabled={true}
          data={chart_data}
        />
      </CardContent>
    </Card>
  );
}

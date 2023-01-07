import { HighchartGraph } from "@fengxia41103/storybook";
import { map, sortBy } from "lodash";
import React, { useContext } from "react";

import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";

export default function SectorRoeColumnChart() {
  const sector = useContext(SectorDetailContext);
  const sorted_stocks = sortBy(sector.stocks_detail, (d) => d.roe);

  const categories = map(sorted_stocks, (d) => d.symbol);
  const chart_data = [
    {
      name: "Reported ROE",
      data: map(sorted_stocks, (d) => d.roe),
    },
    {
      name: "Dupont ROE",
      data: map(sorted_stocks, (d) => d.dupont_roe),
    },
  ];

  return (
    <HighchartGraph
      type="column"
      categories={categories}
      yLabel=""
      title=""
      legendEnabled={true}
      data={chart_data}
    />
  );
}

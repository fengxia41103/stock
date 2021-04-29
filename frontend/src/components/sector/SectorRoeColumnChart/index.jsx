import React, { useContext } from "react";
import { map, sortBy } from "lodash";
import HighchartGraphBox from "src/components/Highchart";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import { randomId } from "src/utils/helper.jsx";

export default function SectorRoeColumnChart() {
  const sector = useContext(SectorDetailContext);
  const sorted_stocks = sortBy(sector.stocks_detail, d => d.roe);

  const containerId = randomId();
  const categories = map(sorted_stocks, d => d.symbol);
  const chart_data = [
    {
      name: "Reported ROE",
      data: map(sorted_stocks, d => d.roe),
    },
    {
      name: "Dupont ROE",
      data: map(sorted_stocks, d => d.dupont_roe),
    },
  ];

  return (
    <HighchartGraphBox
      containerId={containerId}
      type="column"
      categories={categories}
      yLabel=""
      title=""
      legendEnabled={true}
      data={chart_data}
    />
  );
}

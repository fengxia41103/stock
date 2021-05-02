import React, { useState, useContext } from "react";

import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import SectorStatementComparisonCharts from "src/components/sector/SectorStatementComparisonCharts";
import { map } from "lodash";

export default function SectorCashFlowView() {
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_property, s => s.id).join(",");
  const [resource] = useState(`/cashes?stock__in=${stock_ids}`);
  return <SectorStatementComparisonCharts resource={resource} />;
}

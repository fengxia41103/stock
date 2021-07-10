import React, { useState, useContext } from "react";

import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import SectorStatementComparisonCharts from "src/components/sector/SectorStatementComparisonCharts";
import { map } from "lodash";
import { Box, Typography } from "@material-ui/core";

export default function SectorBalancesheetView() {
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_detail, s => s.id).join(",");
  const [resource] = useState(`/balances?stock__in=${stock_ids}`);
  return (
    <Box>
      <Typography variant={"h1"}>BalanceSheet Comparisons</Typography>
      <Box mt={1}>
        <SectorStatementComparisonCharts resource={resource} />
      </Box>
    </Box>
  );
}

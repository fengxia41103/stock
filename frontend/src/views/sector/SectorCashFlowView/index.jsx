import { Box, Typography } from "@material-ui/core";
import { map } from "lodash";
import React, { useState, useContext } from "react";

import SectorStatementComparisonCharts from "src/components/sector/SectorStatementComparisonCharts";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";

export default function SectorCashFlowView() {
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_detail, (s) => s.id).join(",");
  const [resource] = useState(`/cashes?stock__in=${stock_ids}`);
  return (
    <>
      <Typography variant={"h1"}>Cash Flow Statement Comparisons</Typography>
      <Box mt={1}>
        <SectorStatementComparisonCharts resource={resource} />
      </Box>
    </>
  );
}

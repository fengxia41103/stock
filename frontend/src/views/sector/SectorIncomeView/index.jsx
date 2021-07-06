import React, { useState, useContext } from "react";

import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import SectorStatementComparisonCharts from "src/components/sector/SectorStatementComparisonCharts";
import { Box, Typography } from "@material-ui/core";

import { map } from "lodash";

export default function SectorIncomeView() {
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_property, s => s.id).join(",");
  const [resource] = useState(`/incomes?stock__in=${stock_ids}`);
  return (
    <Box>
      <Typography variant={"h1"}>Income Statement Comparisons</Typography>
      <Box mt={1}>
        <SectorStatementComparisonCharts resource={resource} />
      </Box>
    </Box>
  );
}

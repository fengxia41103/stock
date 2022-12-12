import { map } from "lodash";
import React, { useContext, useState } from "react";

import { Box, Typography } from "@material-ui/core";

import SectorStatementComparisonCharts from "src/components/sector/SectorStatementComparisonCharts";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";

export default function SectorIncomeView() {
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_details, (s) => s.id).join(",");
  const [resource] = useState(`/incomes?stock__in=${stock_ids}`);
  return (
    <>
      <Typography variant={"h1"}>Income Statement Comparisons</Typography>
      <Box mt={1}>
        <SectorStatementComparisonCharts resource={resource} />
      </Box>
    </>
  );
}

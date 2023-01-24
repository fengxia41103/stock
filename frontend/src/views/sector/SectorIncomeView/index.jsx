import { map } from "lodash";
import React, { useContext, useState } from "react";

import { Box, Typography } from "@mui/material";

import SectorStatementComparisonCharts from "@Components/sector/SectorStatementComparisonCharts";

import SectorDetailContext from "@Views/sector/SectorDetailView/context";

const SectorIncomeView = () => {
  const sector = useContext(SectorDetailContext);
  const { stocks_detail } = sector;

  const stock_ids = map(stocks_detail, (s) => s.id).join(",");
  const [resource] = useState(`/incomes?stock__in=${stock_ids}`);
  return (
    <>
      <Typography variant="h1">Income Statement Comparisons</Typography>
      <Box mt={1}>
        <SectorStatementComparisonCharts resource={resource} />
      </Box>
    </>
  );
};

export default SectorIncomeView;

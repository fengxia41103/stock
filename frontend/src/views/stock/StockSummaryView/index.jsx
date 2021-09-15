import { Box, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

import DictCard from "src/components/common/DictCard";
import ShowResource from "src/components/common/ShowResource";

function StockSummaryView() {
  const { id } = useParams();
  const [resource] = useState(`/stocks/${id}`);

  const interests = {
    latest_close_price: "Latest Close Price",
    last_reporting_date: "Last Reporting Date",
    profit_margin: "Profit Margin %",
    beta: "BETA",
    top_ten_institution_ownership: "Top 10 Institution Owned %",
    roa: "ROA",
    roe: "ROE",
    dupont_roe: "DuPont ROE",
    roe_dupont_reported_gap: "ROE Gap %",
  };

  const render_data = (data) => {
    return (
      <Box mt={1}>
        <Typography variant="h1">{data.symbol}</Typography>
        <DictCard {...{ data, interests }} />
      </Box>
    );
  };

  return <ShowResource {...{ resource, on_success: render_data }} />;
}

export default StockSummaryView;

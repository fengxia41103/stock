import React, { useContext, useState } from "react";

import SectorStocksRanking from "src/components/sector/SectorStocksRanking";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";

const SectorIncomeRankingView = () => {
  const sector = useContext(SectorDetailContext);
  const [title] = useState("Ranking by Incomes");
  const [resource] = useState("/income-ranks");

  return (
    <SectorStocksRanking
      {...{
        sector,
        title,
        ranking_resource: resource,
      }}
    />
  );
};

export default SectorIncomeRankingView;

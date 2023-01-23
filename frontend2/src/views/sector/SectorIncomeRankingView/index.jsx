import React, { useContext, useState } from "react";

import SectorStocksRanking from "@Components/sector/SectorStocksRanking";

import SectorDetailContext from "@Views/sector/SectorDetailView/context";

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

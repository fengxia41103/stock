import React, { useState, useContext } from "react";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import SectorStocksRanking from "src/components/sector/SectorStocksRanking";

export default function SectorIncomeRankingView() {
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
}

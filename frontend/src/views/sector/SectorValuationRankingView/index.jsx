import React, { useContext, useState } from "react";

import SectorStocksRanking from "@Components/sector/SectorStocksRanking";

import SectorDetailContext from "@Views/sector/SectorDetailView/context";

const SectorValuationRankingView = () => {
  const sector = useContext(SectorDetailContext);
  const [title] = useState("Ranking by Valuation Indicators");
  const [resource] = useState("/valuation-ranks");

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
export default SectorValuationRankingView;

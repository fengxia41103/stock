import React, { useState, useContext } from "react";

import SectorStocksRanking from "src/components/sector/SectorStocksRanking";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";

export default function SectorValuationRankingView() {
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
}

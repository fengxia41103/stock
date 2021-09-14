import React, { useState, useContext } from "react";

import SectorStocksRanking from "src/components/sector/SectorStocksRanking";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";

export default function SectorCashRankingView() {
  const sector = useContext(SectorDetailContext);
  const [title] = useState("Ranking By Cach Flows");
  const [resource] = useState("/cash-ranks");

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

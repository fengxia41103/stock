import React, { useState, useContext } from "react";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import SectorStocksRanking from "src/components/sector/SectorStocksRanking";

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

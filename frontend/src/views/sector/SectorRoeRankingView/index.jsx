import React, { useState, useContext } from "react";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import SectorStocksRanking from "src/components/sector/SectorStocksRanking";

export default function SectorRoeRankingView() {
  const sector = useContext(SectorDetailContext);
  const [title] = useState("Ranking By ROE");
  const [resource] = useState("/stock-ranks");

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

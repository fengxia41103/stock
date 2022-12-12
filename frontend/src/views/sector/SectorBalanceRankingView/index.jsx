import React, { useContext, useState } from "react";

import SectorStocksRanking from "src/components/sector/SectorStocksRanking";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";

export default function SectorBalanceRankingView() {
  const sector = useContext(SectorDetailContext);
  const [title] = useState("Ranking by Balances");
  const [resource] = useState("/balance-ranks");

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

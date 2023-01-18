import React, { useContext, useState } from "react";

import SectorStocksRanking from "@Components/sector/SectorStocksRanking";
import SectorDetailContext from "@Views/sector/SectorDetailView/context";

const SectorBalanceRankingView = () => {
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
};

export default SectorBalanceRankingView;

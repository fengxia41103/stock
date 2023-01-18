import React, { useContext, useState } from "react";

import SectorStocksRanking from "@Components/sector/SectorStocksRanking";
import SectorDetailContext from "@Views/sector/SectorDetailView/context";

const SectorCashRankingView = () => {
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
};

export default SectorCashRankingView;

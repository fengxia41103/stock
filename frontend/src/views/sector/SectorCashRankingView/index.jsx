import React, { useContext, useState } from "react";

import SectorStocksRanking from "src/components/sector/SectorStocksRanking";
import SectorDetailContext from "src/views/sector/SectorDetailView/context";

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

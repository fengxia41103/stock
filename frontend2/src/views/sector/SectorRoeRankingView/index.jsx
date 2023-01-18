import React, { useContext, useState } from "react";

import SectorStocksRanking from "@Components/sector/SectorStocksRanking";
import SectorDetailContext from "@Views/sector/SectorDetailView/context";

const SectorRoeRankingView = () => {
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
};

export default SectorRoeRankingView;

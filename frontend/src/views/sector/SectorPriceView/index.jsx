import React, { useState, useContext } from "react";
import GlobalContext from "src/context";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import { map } from "lodash";
import Fetch from "src/components/Fetch";
import StocksPriceChart from "src/components/stock/StocksPriceChart";

export default function SectorPriceView() {
  const { api } = useContext(GlobalContext);
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_id_symbol, s => s.id).join(",");
  const [resource] = useState(`/stock-ranks?id__in=${stock_ids}`);

  const render_data = data => {
    const ranks = data.objects[0].stats;
    return <StocksPriceChart {...{ ranks }} />;
  };

  return <Fetch {...{ api, resource, render_data }} />;
}

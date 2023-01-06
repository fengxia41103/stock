import { Box, Typography } from "@mui/material";
import { map } from "lodash";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import StockRanking from "src/components/stock/StockRanking";
import { get_highlights } from "src/utils/helper.jsx";

export default function SectorStocksRanking(props) {
  const { sector, title, ranking_resource } = props;
  const [stock_ids, setStockIds] = useState();
  const [highlights, setHighlights] = useState({});

  useEffect(() => {
    const ids = map(sector.stocks_detail, (s) => s.id).join(",");
    setStockIds(ids);

    setHighlights(get_highlights(map(sector.stocks_detail, (s) => s.symbol)));
  }, [sector]);

  return (
    <>
      <Typography variant={"h1"}>{title}</Typography>

      <Box mt={3}>
        <StockRanking
          {...{
            title: "",
            resource: `${ranking_resource}?stats__in=${stock_ids}`,
            highlights,
          }}
        />
      </Box>
    </>
  );
}

SectorStocksRanking.propTypes = {
  sector: PropTypes.shape({
    stocks_detail: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        symbol: PropTypes.string,
      }),
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
  ranking_resource: PropTypes.string.isRequired,
};

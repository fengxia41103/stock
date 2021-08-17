import React, { useState, useEffect } from "react";
import StockRanking from "src/components/stock/StockRanking";
import { get_highlights } from "src/utils/helper.jsx";
import PropTypes from "prop-types";
import { map } from "lodash";
import { Box, Typography } from "@material-ui/core";

export default function SectorStocksRanking(props) {
  const { sector, title, ranking_resource } = props;
  const [stock_ids, setStockIds] = useState();
  const [highlights, setHighlights] = useState({});

  useEffect(() => {
    let ids = map(sector.stocks_detail, s => s.id).join(",");
    setStockIds(ids);

    setHighlights(get_highlights(map(sector.stocks_detail, s => s.symbol)));
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
      })
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
  ranking_resource: PropTypes.string.isRequired,
};

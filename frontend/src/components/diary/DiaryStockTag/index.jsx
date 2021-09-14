import React, { useContext } from "react";

import { Grid, Card, CardHeader, CardContent } from "@material-ui/core";
import { map, filter, sortBy } from "lodash";
import PropTypes from "prop-types";

import StockTagPriceLabel from "src/components/diary/StockTagPriceLabel";
import StockSymbol from "src/components/stock/StockSymbol";
import DiaryListContext from "src/views/diary/DiaryListView/context.jsx";

export default function DiaryStockTag(props) {
  const stocks = useContext(DiaryListContext);
  const { diary } = props;

  let matched_stocks = filter(stocks, (s) => {
    return diary.content.includes(s.symbol);
  });
  matched_stocks = sortBy(matched_stocks, (s) => s.symbol);

  matched_stocks = map(matched_stocks, (s) => {
    return (
      <Grid key={s.id} item lg={3} sm={4} xs={12}>
        <Card>
          <CardHeader title={<StockSymbol {...s} />} />
          <CardContent>
            <StockTagPriceLabel {...{ diary, stock: s }} />
          </CardContent>
        </Card>
      </Grid>
    );
  });

  return (
    <Grid container spacing={1}>
      {matched_stocks}
    </Grid>
  );
}

DiaryStockTag.propTypes = {
  diary: PropTypes.shape({
    resource_uri: PropTypes.string,
    content: PropTypes.string,
    price: PropTypes.number,
    judgement: PropTypes.number,
    is_correct: PropTypes.bool,
  }).isRequired,
};

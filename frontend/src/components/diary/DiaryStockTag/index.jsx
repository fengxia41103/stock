import { filter, map, sortBy } from "lodash";
import PropTypes from "prop-types";
import React, { useContext } from "react";

import { Card, CardContent, CardHeader, Grid } from "@mui/material";

import StockTagPriceLabel from "@Components/diary/StockTagPriceLabel";
import StockSymbol from "@Components/stock/StockSymbol";

import DiaryListContext from "@Views/diary/DiaryListView/context";

const DiaryStockTag = (props) => {
  const stocks = useContext(DiaryListContext);
  const { diary } = props;

  let matched_stocks = filter(stocks, (s) => {
    if (!s.symbol || !diary.content) return false;
    // Word-boundary match so "V" doesn't match inside words and short
    // tickers (MA, ON, ALL) aren't caught as substrings of English text.
    const re = new RegExp(`\\b${s.symbol}\\b`);
    return re.test(diary.content);
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
};

DiaryStockTag.propTypes = {
  diary: PropTypes.shape({
    resource_uri: PropTypes.string,
    content: PropTypes.string,
    price: PropTypes.number,
    judgement: PropTypes.number,
    is_correct: PropTypes.bool,
  }).isRequired,
};

export default DiaryStockTag;

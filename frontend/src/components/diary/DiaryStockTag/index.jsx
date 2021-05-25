import React, { useContext, useState } from "react";
import GlobalContext from "src/context";
import {
  Box,
  makeStyles,
  Grid,
  Link,
  Card,
  CardHeader,
  CardContent,
} from "@material-ui/core";
import PropTypes from "prop-types";
import Fetch from "src/components/Fetch";
import { map, filter, sortBy } from "lodash";
import StockTagPriceLabel from "src/components/diary/StockTagPriceLabel";

export default function DiaryStockTag(props) {
  const { api } = useContext(GlobalContext);
  const [resource] = useState("/stocks");
  const { diary } = props;

  const render_data = data => {
    let stocks = filter(data.objects, s => {
      return diary.content.includes(s.symbol);
    });
    stocks = sortBy(stocks, s => s.symbol);

    stocks = map(stocks, s => {
      return (
        <Grid key={s.id} item lg={3} sm={4} xs={12}>
          <Card>
            <CardHeader
              title={<Link href={`/stocks/${s.id}`}>{s.symbol}</Link>}
            />
            <CardContent>
              <StockTagPriceLabel {...{ diary, stock: s }} />
            </CardContent>
          </Card>
        </Grid>
      );
    });
    return (
      <Box>
        <Grid container spacing={1}>
          {stocks}
        </Grid>
      </Box>
    );
  };
  return <Fetch {...{ api, resource, render_data }} />;
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

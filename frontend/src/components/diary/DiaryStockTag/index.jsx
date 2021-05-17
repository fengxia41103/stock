import React, { useContext, useState } from "react";
import GlobalContext from "src/context";
import {
  Box,
  makeStyles,
  Button,
  Grid,
  Typography,
  Link,
} from "@material-ui/core";
import clsx from "clsx";
import PropTypes from "prop-types";
import Fetch from "src/components/Fetch";
import { map, filter, sortBy } from "lodash";

const useStyles = makeStyles(theme => ({
  diary: {
    color: "#42A5F5",
  },
}));

export default function DiaryStockTag(props) {
  const { api } = useContext(GlobalContext);
  const [resource] = useState("/stocks");
  const classes = useStyles();
  const { diary } = props;

  const render_data = data => {
    let stocks = filter(data.objects, s => {
      return diary.content.includes(s.symbol);
    });
    stocks = sortBy(stocks, s => s.symbol);

    stocks = map(stocks, s => {
      return (
        <Grid key={s.id} item xs={1}>
          <Link href={`/stocks/${s.id}`}>{s.symbol}</Link>
        </Grid>
      );
    });
    return (
      <Box>
        <Grid container spacing={2}>
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

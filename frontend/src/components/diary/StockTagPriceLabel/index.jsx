import React, { useContext, useState } from "react";
import GlobalContext from "src/context";
import { Typography, Grid, Divider } from "@material-ui/core";
import PropTypes from "prop-types";
import Fetch from "src/components/Fetch";
import ColoredNumber from "src/components/ColoredNumber";

export default function StockTagPriceLabel(props) {
  const { diary, stock } = props;
  const { api } = useContext(GlobalContext);
  const [start] = useState(new Date(diary.created).toLocaleDateString("en-CA"));
  const [end] = useState(new Date().toLocaleDateString("en-CA"));
  const [resource] = useState(
    `/historicals?stock=${stock.id}&on__range=${start},${end}`
  );

  const render_data = (data) => {
    const prices = data.objects;
    let price_then = 0,
      price_now = 0;

    if (prices.length > 0) {
      price_then = prices[0].close_price;
    }
    if (prices.length > 1) {
      price_now = prices.pop().close_price;
    }
    const return_in_pcnt =
      price_then > 0 && price_now > 0
        ? ((price_now - price_then) / price_then) * 100
        : 0;

    return (
      <Grid
        container
        spacing={1}
        direction="row"
        justify="space-between"
        alignItems="center"
      >
        <ColoredNumber val={price_then} />
        <Divider orientation="vertical" flexItem />
        <ColoredNumber val={price_now} />
        <Divider orientation="vertical" flexItem />
        <ColoredNumber val={return_in_pcnt} unit="%" />
      </Grid>
    );
  };
  return <Fetch {...{ api, resource, render_data, silent: true }} />;
}

StockTagPriceLabel.propTypes = {
  diary: PropTypes.shape({
    resource_uri: PropTypes.string,
    content: PropTypes.string,
    price: PropTypes.number,
    judgement: PropTypes.number,
    is_correct: PropTypes.bool,
  }).isRequired,
  stock: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
};

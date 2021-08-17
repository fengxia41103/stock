import React, { useState, useContext, useEffect } from "react";
import Fetch from "src/components/common/Fetch";
import GlobalContext from "src/context";
import { map } from "lodash";
import moment from "moment";
import { Sparklines, SparklinesCurve } from "react-sparklines";
import PropTypes from "prop-types";

export default function RecentPriceSparkline(props) {
  const DATE_FORMAT = "YYYY-MM-DD";
  const { api } = useContext(GlobalContext);
  const [resource, setResource] = useState("");
  const [start] = useState(
    moment()
      .add(-10, "d")
      .format(DATE_FORMAT)
  );
  const [end] = useState(moment().format(DATE_FORMAT));
  const { stock } = props;

  useEffect(() => {
    setResource(
      `/historicals?stock=${stock}&on__range=${start},${end}&order_by=on`
    );
  }, [stock, start, end]);

  const render_data = data => {
    let stocks = data.objects;

    const chart_data = map(stocks, s => s.close_price);

    return (
      <Sparklines data={chart_data} height={40}>
        <SparklinesCurve />
      </Sparklines>
    );
  };

  return <Fetch {...{ api, resource, render_data, silent: true }} />;
}

RecentPriceSparkline.propTypes = {
  stock: PropTypes.number.isRequired,
};

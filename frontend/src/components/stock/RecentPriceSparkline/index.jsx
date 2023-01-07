import { ShowResource } from "@fengxia41103/storybook";
import { map } from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Sparklines, SparklinesCurve } from "react-sparklines";

export default function RecentPriceSparkline(props) {
  const DATE_FORMAT = "YYYY-MM-DD";
  const [resource, setResource] = useState("");
  const [start] = useState(moment().add(-10, "d").format(DATE_FORMAT));
  const [end] = useState(moment().format(DATE_FORMAT));
  const { stock } = props;

  useEffect(() => {
    setResource(
      `/historicals?stock=${stock}&on__range=${start},${end}&order_by=on`,
    );
  }, [stock, start, end]);

  const render_data = (data) => {
    const stocks = data.objects;

    const chart_data = map(stocks, (s) => s.close_price);

    return (
      <Sparklines data={chart_data} height={40}>
        <SparklinesCurve />
      </Sparklines>
    );
  };

  return (
    <ShowResource {...{ resource, on_success: render_data, silent: true }} />
  );
}

RecentPriceSparkline.propTypes = {
  stock: PropTypes.number.isRequired,
};

import { map } from "lodash";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Sparklines, SparklinesCurve } from "react-sparklines";

import ShowResource from "@Components/common/ShowResource";

const RecentPriceSparkline = (props) => {
  const DATE_FORMAT = "YYYY-MM-DD";
  const [resource, setResource] = useState("");
  const [start] = useState(dayjs().subtract(10, "day").format(DATE_FORMAT));
  const [end] = useState(dayjs().format(DATE_FORMAT));
  const { stock } = props;

  useEffect(() => {
    setResource(
      `/historicals?stock=${stock}&on__range=${start},${end}&ordering=on`,
    );
  }, [stock, start, end]);

  const render_data = (data) => {
    const stocks = Array.isArray(data)
      ? data
      : data.results || data.objects || [];

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
};

RecentPriceSparkline.propTypes = {
  stock: PropTypes.number.isRequired,
};

export default RecentPriceSparkline;

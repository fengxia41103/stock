import { map } from "lodash";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import ReactEChartsCore from "echarts-for-react";

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

    const option = {
      grid: { top: 0, bottom: 0, left: 0, right: 0 },
      xAxis: { type: "category", show: false },
      yAxis: { type: "value", show: false, min: "dataMin" },
      series: [
        {
          type: "line",
          data: chart_data,
          showSymbol: false,
          lineStyle: { width: 1 },
        },
      ],
    };

    return (
      <ReactEChartsCore
        theme={
          localStorage.getItem("themeMode") === "dark" ? "dark" : undefined
        }
        option={option}
        style={{ height: 40, width: "100%" }}
      />
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

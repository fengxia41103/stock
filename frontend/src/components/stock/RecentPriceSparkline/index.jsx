import dayjs from "dayjs";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

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

    if (stocks.length < 2) return null;

    // Compute daily returns for column coloring
    const returns = stocks.slice(1).map((d, i) => {
      const prev = stocks[i].close_price;
      const curr = d.close_price;
      return prev ? ((curr - prev) / prev) * 100 : 0;
    });

    const options = {
      chart: {
        type: "column",
        backgroundColor: "transparent",
        height: 40,
        margin: [2, 0, 2, 0],
        spacing: [0, 0, 0, 0],
      },
      title: { text: null },
      xAxis: { visible: false },
      yAxis: { visible: false },
      legend: { enabled: false },
      credits: { enabled: false },
      tooltip: { enabled: false },
      plotOptions: {
        column: {
          pointPadding: 0.1,
          groupPadding: 0,
          borderWidth: 0,
          borderRadius: 1,
          colorByPoint: true,
          colors: returns.map((r) => (r >= 0 ? "#10b981" : "#ef4444")),
        },
      },
      series: [{ data: returns }],
    };

    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        containerProps={{ style: { height: "40px", width: "100%" } }}
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

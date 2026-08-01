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

    const chartData = stocks.map((s) => s.close_price);

    const options = {
      chart: { type: "line", backgroundColor: "transparent", height: 40, margin: [0, 0, 0, 0], spacing: [0, 0, 0, 0] },
      title: { text: null },
      xAxis: { visible: false },
      yAxis: { visible: false, min: Math.min(...chartData) * 0.99 },
      legend: { enabled: false },
      credits: { enabled: false },
      tooltip: { enabled: false },
      plotOptions: { line: { marker: { enabled: false }, lineWidth: 1, color: "#3b82f6" } },
      series: [{ data: chartData }],
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

import PropTypes from "prop-types";
import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const PriceChart = ({ data, earnings }) => {
  const options = useMemo(() => {
    const dates = data.map((d) => d.on);
    const closePrices = data.map((d) => d.close_price);
    const openPrices = data.map((d) => d.open_price);
    const highPrices = data.map((d) => d.high_price);
    const lowPrices = data.map((d) => d.low_price);

    // Earnings vertical lines (plotLines on xAxis)
    const plotLines = (earnings || [])
      .filter((e) => dates.includes(e.report_date))
      .map((e) => ({
        value: dates.indexOf(e.report_date),
        color:
          e.surprise_pct > 0
            ? "#2e7d32"
            : e.surprise_pct < 0
            ? "#c62828"
            : "#757575",
        width: 2,
        dashStyle: "Dash",
        label: {
          text:
            e.surprise_pct != null
              ? `${e.surprise_pct > 0 ? "+" : ""}${e.surprise_pct.toFixed(1)}%`
              : "📅",
          style: { color: "#94a3b8", fontSize: "10px", fontWeight: "bold" },
          rotation: 0,
          y: 12,
        },
      }));

    return {
      chart: {
        backgroundColor: "transparent",
        height: 400,
        zooming: { type: "x" },
      },
      title: { text: null },
      xAxis: {
        categories: dates,
        labels: {
          style: { color: "#94a3b8" },
          rotation: -45,
          step: Math.ceil(dates.length / 20),
        },
        plotLines,
      },
      yAxis: {
        title: { text: null },
        labels: {
          style: { color: "#94a3b8" },
          formatter: function () {
            return "$" + this.value;
          },
        },
        gridLineColor: "#334155",
      },
      legend: { itemStyle: { color: "#e2e8f0" } },
      credits: { enabled: false },
      tooltip: {
        shared: true,
        backgroundColor: "#1e293b",
        borderColor: "#475569",
        style: { color: "#f8fafc" },
        valuePrefix: "$",
        valueDecimals: 2,
      },
      plotOptions: {
        line: { marker: { enabled: false } },
      },
      series: [
        { name: "Close", data: closePrices, color: "#3b82f6", lineWidth: 2 },
        { name: "Open", data: openPrices, color: "#f59e0b", lineWidth: 2 },
        {
          name: "High",
          data: highPrices,
          color: "#6b7280",
          lineWidth: 1,
          dashStyle: "Dash",
        },
        {
          name: "Low",
          data: lowPrices,
          color: "#6b7280",
          lineWidth: 1,
          dashStyle: "Dash",
        },
      ],
    };
  }, [data, earnings]);

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

PriceChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      on: PropTypes.string,
      open_price: PropTypes.number,
      close_price: PropTypes.number,
    }),
  ).isRequired,
  earnings: PropTypes.array,
};

export default PriceChart;

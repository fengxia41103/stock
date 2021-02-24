import React, { Component } from "react";
import { randomId } from "../helper.jsx";
import HighchartGraphBox from "../shared/graph-highchart.jsx";
import { map } from "lodash";
import { render } from "react-dom";
import ContainerDimensions from "react-container-dimensions";
import { timeParse } from "d3-time-format";

import CandleStickChartWithSAR from "../shared/CandleStickChartWithSAR.jsx";
import HeikinAshi from "../shared/HeikinAshi.jsx";
import OHLCChartWithElderRayIndicator from "../shared/OHLCChartWithElderRayIndicator.jsx";
import CandleStickChartWithFullStochasticsIndicator from "../shared/CandleStickChartWithFullStochasticsIndicator.jsx";

import CandleStickChartWithMACDIndicator from "../shared/CandleStickChartWithMACDIndicator.jsx";

import CandleStickChartWithRSIIndicator from "../shared/CandleStickChartWithRSIIndicator.jsx";

import CandleStickChartWithBollingerBandOverlay from "../shared/CandleStickChartWithBollingerBandOverlay.jsx";

class StrategyValueChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const containerId = randomId();
    const { data, name } = this.props;
    const categories = map(data, d => d.hist__on);
    const chart_data = [
      {
        name: name,
        data: map(data, d => d.val),
      },
    ];

    return (
      <HighchartGraphBox
        containerId={containerId}
        type="bar"
        categories={categories}
        yLabel=""
        title=""
        legendEnabled={true}
        data={chart_data}
      />
    );
  }
}

class PriceChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const containerId = randomId();
    const { data, period } = this.props;
    const categories = map(data, d => d.on);
    const chart_data = [
      {
        name: "Open Price",
        data: map(data, d => d.open_price),
        lineWidth: 5,
      },
      {
        name: "Close Price",
        data: map(data, d => d.close_price),
        lineWidth: 5,
      },
      {
        name: "High Price",
        data: map(data, d => d.high_price),
        visible: false,
      },
      {
        name: "Low Price",
        data: map(data, d => d.low_price),
        visible: false,
      },
    ];

    return (
      <div>
        {period}
        <HighchartGraphBox
          containerId={containerId}
          type="line"
          categories={categories}
          yLabel=""
          title=""
          legendEnabled={true}
          data={chart_data}
        />
      </div>
    );
  }
}

class RangeChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const containerId = randomId();
    const { data } = this.props;
    const categories = map(data, d => d.on);
    const range_data = map(data, d => [d.on, d.open_price, d.close_price]);

    const chart_data = [
      {
        name: "Price",
        data: range_data,
      },
    ];

    return <StockGraphBox containerId={containerId} title="this" />;
  }
}

class IndicatorChart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { data, period } = this.props;
    const parseDate = timeParse("%Y-%m-%d");

    const chart_data = map(data, d => {
      return {
        date: parseDate(d.on),
        open: d.open_price,
        close: d.close_price,
        high: d.high_price,
        low: d.low_price,
        volume: d.vol,
      };
    });

    return (
      <div>
        Bollinger Band
        {period}
        <ContainerDimensions>
          {({ width, height }) => (
            <CandleStickChartWithBollingerBandOverlay
              data={chart_data}
              width={width}
            />
          )}
        </ContainerDimensions>
        SAR Indicator
        {period}
        <ContainerDimensions>
          {({ width, height }) => (
            <CandleStickChartWithSAR data={chart_data} width={width} />
          )}
        </ContainerDimensions>
        Elder Ray Indicator
        {period}
        <ContainerDimensions>
          {({ width, height }) => (
            <OHLCChartWithElderRayIndicator data={chart_data} width={width} />
          )}
        </ContainerDimensions>
        Full Stochastics Indicator
        {period}
        <ContainerDimensions>
          {({ width, height }) => (
            <CandleStickChartWithFullStochasticsIndicator
              data={chart_data}
              width={width}
            />
          )}
        </ContainerDimensions>
        Heikin-Ashi Indicator
        {period}
        <ContainerDimensions>
          {({ width, height }) => (
            <HeikinAshi data={chart_data} width={width} />
          )}
        </ContainerDimensions>
        MACD Indicator
        {period}
        <ContainerDimensions>
          {({ width, height }) => (
            <CandleStickChartWithMACDIndicator
              data={chart_data}
              width={width}
            />
          )}
        </ContainerDimensions>
        RS Indicator
        {period}
        <ContainerDimensions>
          {({ width, height }) => (
            <CandleStickChartWithRSIIndicator data={chart_data} width={width} />
          )}
        </ContainerDimensions>
      </div>
    );
  }
}

export { StrategyValueChart, PriceChart, RangeChart, IndicatorChart };

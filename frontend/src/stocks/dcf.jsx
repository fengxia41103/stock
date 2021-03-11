import React, { Component } from "react";
import classNames from "classnames";
import { map, last, reverse, filter, isEmpty, isNull, merge } from "lodash";
import { DebounceInput } from "react-debounce-input";
import Financials from "./financials.jsx";

class DCF extends Component {
  constructor(props) {
    super(props);

    // get capital structure from the latest balance sheet
    const { stock } = props;

    this.state = {
      risk_free: 1.242,
      market_premium: 7,
      cost_of_debt: 10,
      growth_rate: 7,
      project_year: 5,
      terminal_growth_rate: 1,
    };

    this.compute_dcf = this.compute_dcf.bind(this);
    this.market_premium_change = this.market_premium_change.bind(this);
    this.cost_of_debt_change = this.cost_of_debt_change.bind(this);
    this.growth_rate_change = this.growth_rate_change.bind(this);
    this.project_year_change = this.project_year_change.bind(this);
    this.terminal_growth_change = this.terminal_growth_change.bind(this);
    this.risk_free_change = this.risk_free_change.bind(this);
  }

  risk_free_change(event) {
    this.setState({
      risk_free: event.target.value,
    });
  }
  market_premium_change(event) {
    this.setState({
      market_premium: event.target.value,
    });
  }
  cost_of_debt_change(event) {
    this.setState({
      cost_of_debt: event.target.value,
    });
  }
  growth_rate_change(event) {
    this.setState({
      growth_rate: event.target.value,
    });
  }
  project_year_change(event) {
    this.setState({
      project_year: event.target.value,
    });
  }
  terminal_growth_change(event) {
    this.setState({
      terminal_growth_rate: event.target.value,
    });
  }

  compute_dcf(stock) {
    const { dcf_model, beta } = stock;
    const {
      risk_free,
      market_premium,
      cost_of_debt,
      growth_rate,
      project_year,
      terminal_growth_rate,
    } = this.state;

    const dcf_values = map(dcf_model, d => {
      const cost_of_equity = risk_free / 100 + (beta * market_premium) / 100;
      const debt_cost = (cost_of_debt / 100) * (1 - d.tax_rate);

      const wacc =
        cost_of_equity * (1 - d.capital_structure / 100) +
        (debt_cost * d.capital_structure) / 100;

      let income = 0;

      // year 0-5, growing at growth rate
      for (let i = 0; i <= Math.floor(project_year / 2); i++) {
        let tmp = d.fcf * Math.pow(1 + growth_rate / 100, i);
        let discounted = tmp / Math.pow(1 + wacc, i);
        income += discounted;
      }

      // year 6-10, growing at 50% of growth rate
      // Note: here we are assuming
      // - market risk premium is not changing
      // - capital structure is not changing
      // - the cost of debt, eg. rating of this company, is not changing
      //
      // Well, these are a lot to assume!
      for (let i = Math.floor(project_year / 2) + 1; i <= project_year; i++) {
        let tmp = d.fcf * Math.pow(1 + growth_rate / 200, i);
        let discounted = tmp / Math.pow(1 + wacc, i);
        income += discounted;
      }

      // terminal value
      // (FCF * (1 + g)) / (d - g)
      let terminal_value = 0;
      if (wacc > terminal_growth_rate / 100) {
        let terminal = terminal_growth_rate / 100;

        terminal_value = (d.fcf * (1 + terminal)) / (wacc - terminal);
      }

      // dcf
      let dcf = 0;
      if (d.share_issued > 0) {
        dcf = (income + terminal_value) / d.share_issued;
      }

      return merge(
        {
          dcf: dcf,
          dcf_to_price_ratio: dcf / d.close_price,
          cost_of_equity: cost_of_equity * 100,
          debt_cost: debt_cost * 100,
          wacc: wacc * 100,
          income: income,
          terminal_value: terminal_value,
        },
        d
      );
    });
    return dcf_values;
  }

  render() {
    const { stock } = this.props;
    // if this is a ETF, skip
    if (isEmpty(stock.balances)) {
      return null;
    }

    const {
      risk_free,
      project_year,
      growth_rate,
      terminal_growth_rate,
      market_premium,
      cost_of_debt,
    } = this.state;
    const dcf_values = this.compute_dcf(stock);

    const reported = {
      dcf_to_price_ratio: "Valuation/Price Ratio",
      dcf: "Discounted Cash Flow Valuation",
      close_price: "Last Close Price",
      cost_of_equity: "Cost of Equity (%)",
      capital_structure: "Total Debts/Total Assets",
      tax_rate: "Tax Rate",
      debt_cost: "Cost of Debt (%)",
      wacc: "WACC (%)",
      income: "Projected FCF",
      terminal_value: "Projected Terminal Value",
    };

    const input_mappings = [
      {
        title: "Risk Free Rate",
        value: risk_free,
        min: 0,
        max: 100,
        on_change: this.risk_free_change,
      },
      {
        title: "Projected Years",
        value: project_year,
        min: 0,
        max: 100,
        on_change: this.project_year_change,
      },
      {
        title: "Growth Rate",
        value: growth_rate,
        min: -1000,
        max: 1000,
        on_change: this.growth_rate_change,
      },
      {
        title: "Terminal Growth Rate",
        value: terminal_growth_rate,
        min: -100,
        max: 10,
        on_change: this.terminal_growth_change,
      },
      {
        title: "Market Premium",
        value: market_premium,
        min: 0,
        max: 100,
        on_change: this.market_premium_change,
      },
      {
        title: "Cost of Debt",
        value: cost_of_debt,
        min: 0,
        max: 1000,
        on_change: this.cost_of_debt_change,
      },
    ];

    const adjustable_inputs = map(input_mappings, i => {
      return (
        <div key={i.title} className="col l3 m6 s12">
          <h4 className="mylabel">{i.title}</h4>
          <DebounceInput
            className="input-field"
            debounceTimeout={1000}
            value={i.value}
            type="number"
            min={i.min}
            max={i.max}
            onChange={i.on_change}
          />
        </div>
      );
    });
    return (
      <div className="row">
        Discounted Cash Flow Model
        <Financials title="" data={dcf_values} reported={reported} />
        <div className="col s12">{adjustable_inputs}</div>
      </div>
    );
  }
}

export default DCF;

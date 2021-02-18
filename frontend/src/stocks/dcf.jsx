import React, { Component } from "react";
import classNames from "classnames";
import { map, last, reverse, filter, isEmpty } from "lodash";

class DCF extends Component {
  constructor(props) {
    super(props);
    this.state = {
      risk_free: 1.242,
      market_premium: 7,
      cost_of_debt: 5,
      growth_rate: 7,
    };

    this.market_premium_change = this.market_premium_change.bind(this);
    this.cost_of_debt_change = this.cost_of_debt_change.bind(this);
    this.growth_rate_change = this.growth_rate_change.bind(this);
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

  render() {
    const { stock } = this.props;
    const { risk_free, market_premium, cost_of_debt, growth_rate } = this.state;

    // if this is a ETF, skip
    if (isEmpty(stock.balances)) {
      return null;
    }

    let capital_structure = map(stock.balances, b => b.capital_structure);
    capital_structure = filter(reverse(capital_structure), x => x > 0);
    if (isEmpty(capital_structure)) {
      capital_structure = 0;
    } else {
      capital_structure = capital_structure[0] / 100;
    }

    const cost_of_equity =
      risk_free / 100 + (stock.beta * market_premium) / 100;
    const debt_cost = (cost_of_debt / 100) * (1 - stock.tax_rate);

    const wacc =
      cost_of_equity * (1 - capital_structure) + debt_cost * capital_structure;

    // latest reporting cash flow can be 0!
    // So we look backwards till we find a positive value. If the company
    // has always been losing money, well, no point to compute DCF either,
    // so just set it to 0. If there is a valid number, use that.
    let cash_flow = map(stock.cashes, c => c.operating_cash_flow);
    cash_flow = filter(reverse(cash_flow), x => x > 0);
    if (isEmpty(cash_flow)) {
      cash_flow = 0;
    } else {
      cash_flow = cash_flow[0];
    }

    let income = 0;

    // year 0-5, growing at growth rate
    for (let i = 0; i <= 5; i++) {
      let tmp = cash_flow * Math.pow(1 + growth_rate / 100, i);
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
    for (let i = 6; i <= 10; i++) {
      let tmp = cash_flow * Math.pow(1 + growth_rate / 200, i);
      let discounted = tmp / Math.pow(1 + wacc, i);
      income += discounted;
    }

    // Note: we are assuming no. of stocks dont' change in 10 years!
    let dcf = income / stock.shares_outstanding;

    return (
      <div className="row jumbotron">
        DCF Valuation
        <br />
        <div className="col l6 m6 s12 card">
          <h4 className="mylabel">My Valuation</h4>
          <div className="quotation">{dcf.toFixed(2)}</div>
        </div>
        <div className="col l6 m6 s12 card">
          <h4 className="mylabel">WACC %</h4>
          <div className="quotation">{(wacc * 100).toFixed(2)}</div>
        </div>
        <div className="col l6 m6 s12 card">
          <h4 className="mylabel">Cost of Equity %</h4>
          <div className="quotation">{(cost_of_equity * 100).toFixed(2)}</div>
        </div>
        <div className="col l6 m6 s12 card">
          <h4 className="mylabel">Debt Weight %</h4>
          <div className="quotation">
            {(capital_structure * 100).toFixed(2)}
          </div>
        </div>
        <div className="col l6 m6 s12 card">
          <h4 className="mylabel">Today's Cash Flow</h4>
          <div className="quotation">{cash_flow.toFixed(2)}</div>
        </div>
        <div className="col l6 m6 s12 card">
          <h4 className="mylabel">10-yr Projected CF</h4>
          <div className="quotation">{income.toFixed(2)}</div>
        </div>
        <div className="col l4 m4 s12">
          <h4 className="mylabel">Growth Rate %</h4>
          <input
            type="number"
            id="growth-rate"
            name="growth-rate"
            value={growth_rate}
            onChange={this.growth_rate_change}
          />
        </div>
        <div className="col l4 m4 s12">
          <h4 className="mylabel">Market Premium %</h4>
          <input
            type="number"
            id="market-premium"
            name="market-premium"
            value={market_premium}
            onChange={this.market_premium_change}
          />
        </div>
        <div className="col l4 m4 s12">
          <h4 className="mylabel">Cost of Debt %</h4>
          <input
            type="number"
            id="cost-of-debt"
            name="cost-of-debt"
            value={cost_of_debt}
            onChange={this.cost_of_debt_change}
          />
        </div>
      </div>
    );
  }
}

export default DCF;

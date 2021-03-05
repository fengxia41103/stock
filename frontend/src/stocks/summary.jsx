import React, { Component } from "react";
import DictCard from "../shared/dict_card.jsx";

class StockSummary extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { stock } = this.props;
    const interests = {
      latest_close_price: "Latest Close Price",
      last_reporting_date: "Last Reporting Date",
      profit_margin: "Profit Margin %",
      beta: "BETA",
      top_ten_institution_ownership: "Top 10 Institution Owned %",
      roa: "ROA",
      roe: "ROE",
      dupont_roe: "DuPont ROE",
      roe_dupont_reported_gap: "ROE Gap %",
    };

    return <DictCard data={stock} interests={interests} />;
  }
}

export default StockSummary;

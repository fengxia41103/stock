import React, { useContext } from "react";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";
import FinancialsView from "src/views/stock/FinancialsView";

function Balance(props) {
  const { balances: data } = useContext(StockDetailContext);

  const reported = {
    cash_and_cash_equivalent_per_share: "Cash & Equivalents Per Share",
    tangible_book_value_per_share: "Tangible Book Value Per Share",
  };
  const ratio = {
    current_ratio: "Current Ratio",
    quick_ratio: "Quick Ratio",
    debt_to_equity_ratio: "Debt/Equity Ratio",
    equity_multiplier: "Equity Multipler",
    working_capital_to_current_liabilities:
      "Working Capital/Current Liabilities",
    price_to_cash_premium: "Price/Cash Premium",
  };

  const pcnt = {
    liability_to_asset: "Total Liabilities/Total Assets",
    current_asset_to_total_asset: "Current Assets/Total Assets",
    retained_earnings_to_equity: "Retained Earnings/Equity",
    inventory_to_current_asset: "Inventory/Current Assets",
    cash_cash_equivalents_and_short_term_investments_to_current_asset:
      "Cash Equivalents/Current Assets",
  };
  const p2p_growth = {
    capital_structure: "Debt % of Asset",
    equity_growth_rate: "Equity",
    debt_growth_rate: "Debt",
    ap_growth_rate: "Account Payable",
    ar_growth_rate: "Account Receivable",
    all_cash_growth_rate: "Cashes",
    working_capital_growth_rate: "Working Capital",
    net_ppe_growth_rate: "Net PP&E",
  };

  return (
    <FinancialsView
      title="Balance Sheet"
      data={data}
      reported={reported}
      ratio={ratio}
      pcnt={pcnt}
      p2p_growth={p2p_growth}
    />
  );
}

export default Balance;

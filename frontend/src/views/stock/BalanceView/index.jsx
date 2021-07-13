import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Typography } from "@material-ui/core";
import GlobalContext from "src/context";
import FinancialCard from "src/components/stock/FinancialCard";
import Fetch from "src/components/Fetch";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";

function BalanceView() {
  const { id } = useParams();
  const { api } = useContext(GlobalContext);
  const stock = useContext(StockDetailContext);
  const [resource] = useState(`/balances?stock=${id}`);

  const reported = {
    share_issued: "Share Issued",
    common_stock: "Common Stock",
    retained_earnings: "Retained Earnings",
    cash_and_cash_equivalent_per_share: "Cash & Equivalents Per Share",
    working_capital: "Working Capital",
    invested_capital: "Invested Capital",
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
    capital_structure: "Capital Structure",
    liability_to_asset: "Total Liabilities/Total Assets",
    current_asset_to_total_asset: "Current Assets/Total Assets",
    retained_earnings_to_equity: "Retained Earnings/Equity",
    inventory_to_current_asset: "Inventory/Current Assets",
    cash_cash_equivalents_and_short_term_investments_to_current_asset:
      "Cash Equivalents/Current Assets",
  };
  const p2p_growth = {
    share_issued_growth_rate: "Shares Issued",
    capital_structure: "Debt % of Asset",
    equity_growth_rate: "Equity",
    debt_growth_rate: "Debt",
    ap_growth_rate: "Account Payable",
    ar_growth_rate: "Account Receivable",
    all_cash_growth_rate: "Cashes",
    working_capital_growth_rate: "Working Capital",
    invested_capital_growth_rate: "Invested Capital",
    net_ppe_growth_rate: "Net PP&E",
  };

  const render_data = resp => {
    const data = resp.objects;

    return (
      <>
        <Typography variant="h1">{stock.symbol} Balance Sheet</Typography>
        <FinancialCard {...{ data, reported, ratio, pcnt, p2p_growth }} />
      </>
    );
  };
  return <Fetch {...{ api, resource, render_data }} />;
}

export default BalanceView;

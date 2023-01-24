import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";

import { Drawer, Typography } from "@mui/material";

import ShowResource from "@Components/common/ShowResource";
import FinancialCard from "@Components/stock/FinancialCard";

import StockDetailContext from "@Views/stock/StockDetailView/context";

const BalanceView = () => {
  const { id } = useParams();
  const stock = useContext(StockDetailContext);
  const { symbol } = stock;

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
    equity_growth_rate: "Equity",
    debt_growth_rate: "Debt",
    ap_growth_rate: "Account Payable",
    ar_growth_rate: "Account Receivable",
    all_cash_growth_rate: "Cashes",
    working_capital_growth_rate: "Working Capital",
    invested_capital_growth_rate: "Invested Capital",
    net_ppe_growth_rate: "Net PP&E",
  };

  const render_data = (resp) => {
    const { objects: data } = resp;

    return (
      <>
        <Typography variant="h2">Balance Sheet</Typography>
        <FinancialCard {...{ data, reported, ratio, pcnt, p2p_growth }} />
      </>
    );
  };

  return <ShowResource {...{ resource, on_success: render_data }} />;
};

export default BalanceView;

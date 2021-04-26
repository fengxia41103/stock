import React, { useState, useContext } from "react";
import FinancialCard from "src/components/stock/FinancialCard";
import { map, merge } from "lodash";

import {
  Box,
  Grid,
  TextField,
  Card,
  CardContent,
  Typography,
} from "@material-ui/core";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";

function DCFView() {
  const stock = useContext(StockDetailContext);

  const [risk_free, setRiskFree] = useState(1.242);
  const [market_premium, setMarketPremium] = useState(7);
  const [cost_of_debt, setCostOfDebt] = useState(10);
  const [growth_rate, setGrowthRate] = useState(7);
  const [project_year, setProjectYear] = useState(5);
  const [terminal_growth_rate, setTerminalGrowthRate] = useState(1);

  const risk_free_change = event => {
    setRiskFree(event.target.value);
  };
  const market_premium_change = event => {
    setMarketPremium(event.target.value);
  };
  const cost_of_debt_change = event => {
    setCostOfDebt(event.target.value);
  };
  const growth_rate_change = event => {
    setGrowthRate(event.target.value);
  };
  const project_year_change = event => {
    setProjectYear(event.target.value);
  };
  const terminal_growth_change = event => {
    setTerminalGrowthRate(event.target.value);
  };

  const compute_dcf = stock => {
    const { dcf_model, beta } = stock;

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
  };

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
      on_change: risk_free_change,
    },
    {
      title: "Projected Years",
      value: project_year,
      min: 0,
      max: 100,
      on_change: project_year_change,
    },
    {
      title: "Growth Rate",
      value: growth_rate,
      min: -1000,
      max: 1000,
      on_change: growth_rate_change,
    },
    {
      title: "Terminal Growth Rate",
      value: terminal_growth_rate,
      min: -100,
      max: 10,
      on_change: terminal_growth_change,
    },
    {
      title: "Market Premium",
      value: market_premium,
      min: 0,
      max: 100,
      on_change: market_premium_change,
    },
    {
      title: "Cost of Debt",
      value: cost_of_debt,
      min: 0,
      max: 1000,
      on_change: cost_of_debt_change,
    },
  ];

  const adjustable_inputs = map(input_mappings, i => {
    return (
      <Grid item key={i.title} lg={2} sm={6} xs={12}>
        <TextField
          label={i.title}
          fullWidth={true}
          value={i.value}
          type="number"
          min={i.min}
          max={i.max}
          onChange={i.on_change}
        />
      </Grid>
    );
  });

  const dcf_values = compute_dcf(stock);
  return (
    <Box>
      <Typography variant="h1">{stock.symbol} DCF Model</Typography>

      <FinancialCard data={dcf_values} reported={reported} normalized={false} />
      <Box mt={3}>
        <Card>
          <CardContent>
            <Grid container spacing={1}>
              {adjustable_inputs}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default DCFView;

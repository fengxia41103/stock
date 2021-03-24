import React, { useState, useContext } from "react";
import { Outlet, useParams } from "react-router-dom";
import GlobalContext from "src/context";
import { Container, Box, Grid } from "@material-ui/core";
import Page from "src/components/Page";
import MenuBar from "src/components/menu.jsx";
import Fetch from "src/components/fetch.jsx";
import StockDetailContext from "./context.jsx";

const price_menus = [
  {
    url: "historical/price",
    text: "Daily Prices",
  },
  {
    url: "historical/return/daily",
    text: "Daily Returns (%)",
  },
  {
    url: "historical/return/overnight",
    text: "Overnight Returns (%)",
  },
];

const indicator_menus = [
  {
    url: "historical/indicator/bollinger",
    text: "Bollinger Band",
  },
  {
    url: "historical/indicator/elder",
    text: "Elder Ray",
  },
  {
    url: "historical/indicator/sar",
    text: "SAR",
  },
  {
    url: "historical/indicator/stochastics",
    text: "Full Stochastics Oscillator",
  },
  {
    url: "historical/indicator/heikin",
    text: "Heikin-Ashi",
  },
  {
    url: "historical/indicator/macd",
    text: "MACD",
  },
  {
    url: "historical/indicator/rsi",
    text: "Relative Strength",
  },
];

const financial_statement_menus = [
  {
    url: "balance",
    text: "Balance Sheet",
  },
  {
    url: "income",
    text: "Income Statement",
  },
  {
    url: "cash",
    text: "Cash Flow Statement",
  },
];

const valuation_menus = [
  {
    url: "dupont",
    text: "Dupont ROE",
  },
  {
    url: "dcf",
    text: "Discounted Cash Flow",
  },
  {
    url: "ratios",
    text: "Valuation Ratios",
  },
  {
    url: "nav",
    text: "Net Asset Value",
  },
];

function StockDetailView() {
  const { id } = useParams();
  const { api } = useContext(GlobalContext);
  const [resource] = useState(`/stocks/${id}`);

  const render_data = stock => {
    return (
      <Page>
        <Container maxWidth={false}>
          <Box display="flex" mb={3} borderBottom={1}>
            <Grid container spacing={1} justify="flex-end">
              <MenuBar
                title="Financial Statements"
                items={financial_statement_menus}
              />
              <MenuBar title="Valuation Models" items={valuation_menus} />
              <MenuBar title="Price & Trends" items={price_menus} />
              <MenuBar title="Tech Indicators" items={indicator_menus} />
            </Grid>
          </Box>

          <StockDetailContext.Provider value={stock}>
            <Box mt={3}>
              <Outlet />
            </Box>
          </StockDetailContext.Provider>
        </Container>
      </Page>
    );
  };
  return <Fetch api={api} resource={resource} render_data={render_data} />;
}

export default StockDetailView;

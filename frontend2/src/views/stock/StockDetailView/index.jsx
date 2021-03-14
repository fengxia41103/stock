import React from "react";
import { Outlet, useParams } from "react-router-dom";
import { Container, Box, Grid } from "@material-ui/core";
import Page from "src/components/Page";
import MenuBar from "./menu.jsx";

const trend_menus = [
  {
    url: "historical",
    text: "Daily Prices",
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
    url: "ratios",
    text: "Valuation Ratios",
  },
  {
    url: "nav",
    text: "Net Asset Value",
  },
  {
    url: "dcf",
    text: "Discounted Cash Flow",
  },
];

function StockDetailView(props) {
  return (
    <Page>
      <Container maxWidth={false}>
        <Box display="flex" mb={3} borderBottom={1}>
          <Grid container spacing={1} justify="flex-end">
            <MenuBar title="Price & Trends" items={trend_menus} />
            <MenuBar
              title="Financial Statements"
              items={financial_statement_menus}
            />
            <MenuBar title="Valuation Models" items={valuation_menus} />
          </Grid>
        </Box>
        <Outlet />
      </Container>
    </Page>
  );
}

export default StockDetailView;

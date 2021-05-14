import React, { useState, useContext, useEffect, useRef } from "react";
import { Outlet, useParams } from "react-router-dom";
import GlobalContext from "src/context";
import { Container, Box, Grid, Button } from "@material-ui/core";
import Page from "src/components/Page";
import MenuBar from "src/components/MenuBar";
import Fetch from "src/components/Fetch";
import StockDetailContext from "./context.jsx";
import { useMutate } from "restful-react";
import StockSector from "./sector.jsx";
import ListDiary from "src/components/diary/ListDiary";

const price_menus = [
  {
    url: "historical/price",
    text: "Daily Prices",
  },
  {
    url: "historical/return/24hr",
    text: "24-hour Returns (%)",
  },
  {
    url: "historical/return/daily",
    text: "Daytime Returns (%)",
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

  const { mutate: del } = useMutate({
    verb: "DELETE",
    path: `${api}${resource}`,
  });
  const { mutate: update } = useMutate({
    verb: "PATCH",
    path: `${api}${resource}/`,
  });

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => (mounted.current = false);
  });

  const render_data = stock => {
    return (
      <Page>
        <Container maxWidth={false}>
          <Box display="flex" borderBottom={1}>
            <Grid container spacing={1} justify="flex-end" alignItems="center">
              <MenuBar
                root={resource}
                title="Price & Trends"
                items={price_menus}
              />
              <MenuBar
                root={resource}
                title="Financial Statements"
                items={financial_statement_menus}
              />
              <MenuBar
                root={resource}
                title="Valuation Models"
                items={valuation_menus}
              />
              <MenuBar
                root={resource}
                title="Tech Indicators"
                items={indicator_menus}
              />

              <Grid item xs>
                <Button color="primary" onClick={() => update({})}>
                  Update
                </Button>
              </Grid>
              <Grid item xs>
                <Button
                  color="secondary"
                  onClick={() => del().then((mounted.current = false))}
                >
                  Delete
                </Button>
              </Grid>
              <StockSector stock_resource={resource} />
            </Grid>
          </Box>

          <StockDetailContext.Provider value={stock}>
            <Box mt={3}>
              <Outlet />
            </Box>
            <Box mt={1}>
              <ListDiary />
            </Box>
          </StockDetailContext.Provider>
        </Container>
      </Page>
    );
  };

  // MUST; if umounted, do nothing and let router handles the
  // rest. Omitting this line will cause error because user still has
  // access to navigation menu.

  if (!mounted.current) {
    return null;
  }

  // render as usual to get data
  return <Fetch {...{ api, resource, render_data, mounted }} />;
}

export default StockDetailView;

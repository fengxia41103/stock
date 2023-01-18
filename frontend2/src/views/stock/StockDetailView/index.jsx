import React, { useEffect, useRef, useState } from "react";
import { Outlet, useParams } from "react-router-dom";

import EventNoteIcon from "@mui/icons-material/EventNote";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
} from "@mui/material";

import {
  AsDialog,
  DropdownMenu,
  MenuBar,
  Page,
  ShowResource,
} from "@fengxia41103/storybook";

import AddDiaryEditor from "@Components/diary/AddDiaryEditor";
import ListDiary from "@Components/diary/ListDiary";
import DeleteStock from "@Components/stock/DeleteStock";
import StockLinkToSector from "@Components/stock/StockLinkToSector";
import UpdateStock from "@Components/stock/UpdateStock";

import StockDetailContext from "./context";

const price_menus = [
  {
    url: "historical/price",
    text: "Daily Prices",
  },
  {
    url: "historical/last/lower",
    text: "Last Lower & Next Better",
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

const StockDetailView = () => {
  // URL params
  const { id } = useParams();

  // states
  const [resource] = useState(`/stocks/${id}`);

  // hooks
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      return null;
    };
  });

  // renders

  const render_data = (stock) => {
    const has_statements = !!stock.last_reporting_date;

    const actions = (
      <List>
        <ListItem>
          <StockLinkToSector {...stock} />
        </ListItem>
        <Divider />
        <ListItem>
          <UpdateStock {...stock} />
        </ListItem>
        <ListItem>
          <DeleteStock {...stock} />
        </ListItem>
        <ListItem>
          <AsDialog
            as={
              <Button color="secondary">
                <EventNoteIcon />
                Add a New Note
              </Button>
            }
            title="Add a New Note"
            content={<AddDiaryEditor stock={stock.id} />}
          />
        </ListItem>
      </List>
    );

    return (
      <Page title={stock.symbol}>
        <Container maxWidth={false}>
          <Box display="flex" borderBottom={1}>
            <Grid container spacing={1} alignItems="center">
              <MenuBar
                root={resource}
                title="Price & Trends"
                items={price_menus}
              />
              {has_statements ? (
                <MenuBar
                  root={resource}
                  title="Financial Statements"
                  items={financial_statement_menus}
                />
              ) : null}
              {has_statements ? (
                <MenuBar
                  root={resource}
                  title="Valuation Models"
                  items={valuation_menus}
                />
              ) : null}
              <MenuBar
                root={resource}
                title="Tech Indicators"
                items={indicator_menus}
              />
              <DropdownMenu content={actions} />
            </Grid>
          </Box>

          <StockDetailContext.Provider value={stock}>
            <Box mt={1}>
              <Outlet />
            </Box>
            <Box mt={1}>
              <ListDiary stock={stock} />
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
  return <ShowResource {...{ resource, on_success: render_data }} />;
};

export default StockDetailView;

import React from "react";
import { Outlet, useParams } from "react-router-dom";
import ScaleLoader from "react-spinners/ScaleLoader";

import EventNoteIcon from "@mui/icons-material/EventNote";
import {
  Box,
  Button,
  Container,
  Divider,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";

import { useStock } from "@/api";
import {
  AsDialog,
  DropdownMenu,
  MenuBar,
  NotFoundView,
  Page,
} from "@fengxia41103/storybook";
import AddDiaryEditor from "@Components/diary/AddDiaryEditor";
import DeleteStock from "@Components/stock/DeleteStock";
import StockLinkToSector from "@Components/stock/StockLinkToSector";
import UpdateStock from "@Components/stock/UpdateStock";

import StockDetailContext from "./context";

const price_menus = [
  { url: "historical/price", text: "Daily Prices" },
  { url: "historical/last/lower", text: "Last Lower & Next Better" },
  { url: "historical/return/24hr", text: "24-hour Returns (%)" },
  { url: "historical/return/daily", text: "Daytime Returns (%)" },
  { url: "historical/return/overnight", text: "Overnight Returns (%)" },
];

const indicator_menus = [
  { url: "historical/indicator/bollinger", text: "Bollinger Band" },
  { url: "historical/indicator/elder", text: "Elder Ray" },
  { url: "historical/indicator/sar", text: "SAR" },
  {
    url: "historical/indicator/stochastics",
    text: "Full Stochastics Oscillator",
  },
  { url: "historical/indicator/heikin", text: "Heikin-Ashi" },
  { url: "historical/indicator/macd", text: "MACD" },
  { url: "historical/indicator/rsi", text: "Relative Strength" },
];

const financial_statement_menus = [
  { url: "balance", text: "Balance Sheet" },
  { url: "income", text: "Income Statement" },
  { url: "cash", text: "Cash Flow Statement" },
];

const valuation_menus = [
  { url: "dupont", text: "Dupont ROE" },
  { url: "dcf", text: "Discounted Cash Flow" },
  { url: "ratios", text: "Valuation Ratios" },
  { url: "nav", text: "Net Asset Value" },
];

const StockDetailView = () => {
  const { id } = useParams();
  const { data: stock, isLoading, error } = useStock(id);

  if (isLoading) return <ScaleLoader loading />;
  if (error || !stock) return <NotFoundView />;

  const resource = `/stocks/${id}`;
  const { symbol } = stock;
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
        <AsDialog open={false} title="Add a New Note">
          <AddDiaryEditor stock={stock.id} />
        </AsDialog>
      </ListItem>
    </List>
  );

  return (
    <Page title={symbol}>
      <Container maxWidth={false}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h1" mb={10} mt={10}>
            {symbol}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            divider={<Divider orientation="vertical" flexItem />}
          >
            <MenuBar
              root={resource}
              title="Price & Trends"
              items={price_menus}
            />
            {has_statements && (
              <MenuBar
                root={resource}
                title="Financial Statements"
                items={financial_statement_menus}
              />
            )}
            {has_statements && (
              <MenuBar
                root={resource}
                title="Valuation Models"
                items={valuation_menus}
              />
            )}
            <MenuBar
              root={resource}
              title="Tech Indicators"
              items={indicator_menus}
            />
            <DropdownMenu content={actions} />
          </Stack>
        </Stack>

        <StockDetailContext.Provider value={stock}>
          <Box mt={1}>
            <Outlet />
          </Box>
        </StockDetailContext.Provider>
      </Container>
    </Page>
  );
};

export default StockDetailView;

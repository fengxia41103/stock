import React, { useMemo } from "react";
import { Outlet, useParams, useLocation, useNavigate } from "react-router-dom";
import ScaleLoader from "react-spinners/ScaleLoader";

import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import { useStock } from "@/api";
import { NotFoundView, Page } from "@fengxia41103/storybook";
import AddDiaryEditor from "@Components/diary/AddDiaryEditor";
import DeleteStock from "@Components/stock/DeleteStock";
import StockLinkToSector from "@Components/stock/StockLinkToSector";
import UpdateStock from "@Components/stock/UpdateStock";

import StockDetailContext from "./context";

const sections = [
  {
    label: "Price & Trends",
    items: [
      { url: "historical/price", text: "Daily Prices" },
      { url: "historical/last/lower", text: "Last Lower & Next Better" },
      { url: "historical/return/24hr", text: "24hr Returns" },
      { url: "historical/return/daily", text: "Daytime Returns" },
      { url: "historical/return/overnight", text: "Overnight Returns" },
    ],
  },
  {
    label: "Tech Indicators",
    items: [
      { url: "historical/indicator/bollinger", text: "Bollinger" },
      { url: "historical/indicator/macd", text: "MACD" },
      { url: "historical/indicator/rsi", text: "RSI" },
      { url: "historical/indicator/sar", text: "SAR" },
      { url: "historical/indicator/stochastics", text: "Stochastics" },
      { url: "historical/indicator/heikin", text: "Heikin-Ashi" },
      { url: "historical/indicator/elder", text: "Elder Ray" },
    ],
  },
  {
    label: "Financials",
    items: [
      { url: "balance", text: "Balance Sheet" },
      { url: "income", text: "Income Statement" },
      { url: "cash", text: "Cash Flow" },
    ],
  },
  {
    label: "Valuation",
    items: [
      { url: "dupont", text: "Dupont ROE" },
      { url: "dcf", text: "DCF" },
      { url: "ratios", text: "Ratios" },
      { url: "nav", text: "NAV" },
      { url: "earnings", text: "Earnings" },
    ],
  },
  {
    label: "Ownership",
    items: [
      { url: "insider-trades", text: "Insider Trades" },
      { url: "institutional", text: "Institutional" },
    ],
  },
];

const StockDetailView = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: stock, isLoading, error } = useStock(id);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const basePath = `/stocks/${id}`;

  // Determine active section and item from current URL
  const { activeSection, activeItem } = useMemo(() => {
    const rel = location.pathname.replace(basePath + "/", "");
    for (let si = 0; si < sections.length; si++) {
      const idx = sections[si].items.findIndex((item) =>
        rel.startsWith(item.url),
      );
      if (idx !== -1) return { activeSection: si, activeItem: idx };
    }
    return { activeSection: 0, activeItem: 0 };
  }, [location.pathname, basePath]);

  if (isLoading) return <ScaleLoader loading />;
  if (error || !stock) return <NotFoundView />;

  const { symbol } = stock;
  const has_statements = !!stock.last_reporting_date;

  // Filter sections based on data availability
  const visibleSections = sections.filter((s) => {
    if (s.label === "Financials" || s.label === "Valuation")
      return has_statements;
    return true;
  });

  const currentSection = visibleSections[activeSection] || visibleSections[0];

  return (
    <Page title={symbol}>
      <Container maxWidth={false}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h1">
            {stock.name ? `${stock.name} (${symbol})` : symbol}
          </Typography>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <SettingsIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem>
              <StockLinkToSector {...stock} />
            </MenuItem>
            <MenuItem>
              <UpdateStock {...stock} />
            </MenuItem>
            <MenuItem>
              <DeleteStock {...stock} />
            </MenuItem>
          </Menu>
        </Stack>

        {/* Section tabs */}
        <Tabs
          value={activeSection}
          onChange={(_, v) => {
            const firstItem = visibleSections[v].items[0];
            navigate(`${basePath}/${firstItem.url}`);
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}
        >
          {visibleSections.map((s) => (
            <Tab key={s.label} label={s.label} />
          ))}
        </Tabs>

        {/* Sub-navigation tabs */}
        <Tabs
          value={activeItem}
          onChange={(_, v) =>
            navigate(`${basePath}/${currentSection.items[v].url}`)
          }
          variant="scrollable"
          scrollButtons="auto"
          textColor="secondary"
          indicatorColor="secondary"
          sx={{ mb: 2 }}
        >
          {currentSection.items.map((item) => (
            <Tab
              key={item.url}
              label={item.text}
              sx={{ textTransform: "none", minHeight: 36, py: 0 }}
            />
          ))}
        </Tabs>

        <Divider />

        {/* Content */}
        <StockDetailContext.Provider value={stock}>
          <Box mt={2}>
            <Outlet />
          </Box>
        </StockDetailContext.Provider>
      </Container>
    </Page>
  );
};

export default StockDetailView;

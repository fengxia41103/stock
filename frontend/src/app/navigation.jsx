/**
 * Navigation configuration — flat array of sidebar nav items.
 * Matches CWIS pattern: data-only, no rendering logic.
 */
import React from "react";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import BarChartIcon from "@mui/icons-material/BarChart";
import BusinessIcon from "@mui/icons-material/Business";
import CompareIcon from "@mui/icons-material/Compare";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import FilterListIcon from "@mui/icons-material/FilterList";
import GridViewIcon from "@mui/icons-material/GridView";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import SortIcon from "@mui/icons-material/Sort";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import SummarizeIcon from "@mui/icons-material/Summarize";

export const navItems = [
  { href: "/brief", icon: <SummarizeIcon />, title: "Brief" },
  { href: "/dashboard", icon: <DashboardIcon />, title: "Dashboard" },
  { href: "/screener", icon: <FilterListIcon />, title: "Screener" },
  { href: "/technicals", icon: <BarChartIcon />, title: "Technicals" },
  { href: "/compare", icon: <CompareArrowsIcon />, title: "Compare" },
  { href: "/charts", icon: <GridViewIcon />, title: "Charts" },
  { href: "/macro", icon: <ShowChartIcon />, title: "Macro" },
  { href: "/trending", icon: <TrendingUpIcon />, title: "Trending" },
  { href: "/stocks", icon: <BusinessIcon />, title: "Stocks" },
  { href: "/sectors", icon: <CompareIcon />, title: "Portfolios" },
  { href: "/rankings", icon: <SortIcon />, title: "Rankings" },
  {
    href: "/portfolio",
    icon: <AccountBalanceWalletIcon />,
    title: "Portfolio",
  },
  { href: "/backtest", icon: <AnalyticsIcon />, title: "Backtest" },
  { href: "/notes", icon: <EventNoteIcon />, title: "Notes" },
];

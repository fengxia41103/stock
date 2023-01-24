import React from "react";
import { Navigate } from "react-router-dom";

import AnnouncementIcon from "@mui/icons-material/Announcement";
import BusinessIcon from "@mui/icons-material/Business";
import CompareIcon from "@mui/icons-material/Compare";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import SortIcon from "@mui/icons-material/Sort";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { NotFoundView } from "@fengxia41103/storybook";

import MainLayout from "@Layouts/MainLayout";

import LoginView from "@Views/auth/LoginView";
import LogoutView from "@Views/auth/LogoutView";
import RegistrationView from "@Views/auth/RegistrationView";
import DashboardTrendingView from "@Views/dashboard/DashboardTrendingView";
import TodayDashboardView from "@Views/dashboard/TodayDashboardView";
import AddDiaryView from "@Views/diary/AddDiaryView";
import DiaryListView from "@Views/diary/DiaryListView";
import NewsListView from "@Views/news/NewsListView";
import SectorBalanceRankingView from "@Views/sector/SectorBalanceRankingView";
import SectorBalancesheetView from "@Views/sector/SectorBalancesheetView";
import SectorCashFlowView from "@Views/sector/SectorCashFlowView";
import SectorCashRankingView from "@Views/sector/SectorCashRankingView";
import SectorDetailView from "@Views/sector/SectorDetailView";
import SectorIncomeRankingView from "@Views/sector/SectorIncomeRankingView";
import SectorIncomeView from "@Views/sector/SectorIncomeView";
import SectorInstitutionOwnershipView from "@Views/sector/SectorInstitutionOwnershipView";
import SectorListView from "@Views/sector/SectorListView";
import SectorPriceView from "@Views/sector/SectorPriceView";
import SectorReturnView from "@Views/sector/SectorReturnView";
import SectorRoeRankingView from "@Views/sector/SectorRoeRankingView";
import SectorRoeView from "@Views/sector/SectorRoeView";
import SectorStocksLowerBetterView from "@Views/sector/SectorStocksLowerBetterView";
import SectorValuationRankingView from "@Views/sector/SectorValuationRankingView";
import BalanceView from "@Views/stock/BalanceView";
import CashFlowView from "@Views/stock/CashFlowView";
import DailyReturnView from "@Views/stock/DailyReturnView";
import DCFView from "@Views/stock/DCFView";
import DupontView from "@Views/stock/DupontView";
import IncomeView from "@Views/stock/IncomeView";
import LastLowerNextBetterView from "@Views/stock/LastLowerNextBetterView";
import NavView from "@Views/stock/NavView";
import OvernightReturnView from "@Views/stock/OvernightReturnView";
import PriceView from "@Views/stock/PriceView";
import RankingView from "@Views/stock/RankingView";
import StockDetailView from "@Views/stock/StockDetailView";
import StockHistoricalView from "@Views/stock/StockHistoricalView";
import StockListView from "@Views/stock/StockListView";
import StockSummaryView from "@Views/stock/StockSummaryView";
import TechIndicatorView from "@Views/stock/TechIndicatorView";
import TwentyFourHourReturnView from "@Views/stock/TwentyFourHourReturnView";
import ValuationRatiosView from "@Views/stock/ValuationRatiosView";

const navbar_items = [
  {
    href: "/dashboard",
    icon: <DashboardIcon />,
    title: "Today",
  },
  {
    href: "/trending",
    icon: <TrendingUpIcon />,
    title: "Price Trending",
  },
  {
    href: "/stocks",
    icon: <BusinessIcon />,
    title: "My Stocks",
  },
  {
    href: "/sectors",
    icon: <CompareIcon />,
    title: "My Sectors",
  },
  {
    href: "/rankings",
    icon: <SortIcon />,
    title: "Stock Rankings",
  },
  {
    href: "/notes",
    icon: <EventNoteIcon />,
    title: "My Notes",
  },
  {
    href: "/news",
    icon: <AnnouncementIcon />,
    title: "News",
  },
];

const routes = [
  // auth
  { path: "logout", element: <LogoutView /> },
  { path: "registration", element: <RegistrationView /> },

  // application specific
  {
    path: "/",
    element: <MainLayout sideNavs={navbar_items} />,
    children: [
      { path: "login", element: <LoginView /> },
      // stocks
      { path: "stocks", element: <StockListView /> },
      {
        path: "stocks/:id",
        element: <StockDetailView />,
        children: [
          { path: "summary", element: <StockSummaryView /> },
          { path: "nav", element: <NavView /> },
          { path: "balance", element: <BalanceView /> },
          { path: "income", element: <IncomeView /> },
          { path: "cash", element: <CashFlowView /> },
          { path: "dcf", element: <DCFView /> },
          { path: "ratios", element: <ValuationRatiosView /> },
          { path: "dupont", element: <DupontView /> },
          {
            path: "historical",
            element: <StockHistoricalView />,
            children: [
              { path: "price", element: <PriceView /> },
              { path: "return/daily", element: <DailyReturnView /> },
              { path: "return/overnight", element: <OvernightReturnView /> },
              { path: "return/24hr", element: <TwentyFourHourReturnView /> },
              { path: "indicator/:type", element: <TechIndicatorView /> },
              { path: "last/lower", element: <LastLowerNextBetterView /> },
            ],
          },
        ],
      },

      // sectors
      { path: "sectors", element: <SectorListView /> },
      {
        path: "sectors/:id",
        element: <SectorDetailView />,
        children: [
          { path: "price", element: <SectorPriceView /> },
          { path: "return", element: <SectorReturnView /> },
          { path: "dupont", element: <SectorRoeView /> },
          { path: "balance", element: <SectorBalancesheetView /> },
          { path: "income", element: <SectorIncomeView /> },
          { path: "cash", element: <SectorCashFlowView /> },
          { path: "institution", element: <SectorInstitutionOwnershipView /> },
          { path: "ranking/roe", element: <SectorRoeRankingView /> },
          { path: "ranking/balance", element: <SectorBalanceRankingView /> },
          { path: "ranking/income", element: <SectorIncomeRankingView /> },
          { path: "ranking/cash", element: <SectorCashRankingView /> },
          {
            path: "ranking/valuation",
            element: <SectorValuationRankingView />,
          },
          { path: "gains", element: <SectorStocksLowerBetterView /> },
        ],
      },
      { path: "rankings", element: <RankingView /> },
      { path: "notes", element: <DiaryListView /> },
      { path: "notes/add", element: <AddDiaryView /> },
      { path: "dashboard", element: <TodayDashboardView /> },
      { path: "trending", element: <DashboardTrendingView /> },
      {
        path: "news",
        element: <NewsListView />,
      },

      // landing page, default to dashboard
      { path: "/", element: <Navigate to="/sectors" /> },
      { path: "404", element: <NotFoundView /> },
      // catch all, 404
      { path: "*", element: <Navigate to="/404" /> },
    ],
  },
];

export default routes;

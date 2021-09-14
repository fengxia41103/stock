import React from "react";

import AnnouncementIcon from "@material-ui/icons/Announcement";
import BusinessIcon from "@material-ui/icons/Business";
import CompareIcon from "@material-ui/icons/Compare";
import DashboardIcon from "@material-ui/icons/Dashboard";
import EventNoteIcon from "@material-ui/icons/EventNote";
import SortIcon from "@material-ui/icons/Sort";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import { Navigate } from "react-router-dom";


import MainLayout from "src/layouts/MainLayout";
import LoginView from "src/views/auth/LoginView";
import LogoutView from "src/views/auth/LogoutView";
import DashboardTrendingView from "src/views/dashboard/DashboardTrendingView";
import TodayDashboardView from "src/views/dashboard/TodayDashboardView";
import DiaryListView from "src/views/diary/DiaryListView";
import NotFoundView from "src/views/errors/NotFoundView";
import NewsListView from "src/views/news/NewsListView";
import SectorBalanceRankingView from "src/views/sector/SectorBalanceRankingView";
import SectorBalancesheetView from "src/views/sector/SectorBalancesheetView";
import SectorCashFlowView from "src/views/sector/SectorCashFlowView";
import SectorCashRankingView from "src/views/sector/SectorCashRankingView";
import SectorDetailView from "src/views/sector/SectorDetailView";
import SectorIncomeRankingView from "src/views/sector/SectorIncomeRankingView";
import SectorIncomeView from "src/views/sector/SectorIncomeView";
import SectorInstitutionOwnershipView from "src/views/sector/SectorInstitutionOwnershipView";
import SectorListView from "src/views/sector/SectorListView";
import SectorPriceView from "src/views/sector/SectorPriceView";
import SectorReturnView from "src/views/sector/SectorReturnView";
import SectorRoeRankingView from "src/views/sector/SectorRoeRankingView";
import SectorRoeView from "src/views/sector/SectorRoeView";
import SectorStocksLowerBetterView from "src/views/sector/SectorStocksLowerBetterView";
import SectorValuationRankingView from "src/views/sector/SectorValuationRankingView";
import BalanceView from "src/views/stock/BalanceView";
import CashFlowView from "src/views/stock/CashFlowView";
import DCFView from "src/views/stock/DCFView";
import DailyReturnView from "src/views/stock/DailyReturnView";
import DupontView from "src/views/stock/DupontView";
import IncomeView from "src/views/stock/IncomeView";
import LastLowerNextBetterView from "src/views/stock/LastLowerNextBetterView";
import NavView from "src/views/stock/NavView";
import OvernightReturnView from "src/views/stock/OvernightReturnView";
import PriceView from "src/views/stock/PriceView";
import RankingView from "src/views/stock/RankingView";
import StockDetailView from "src/views/stock/StockDetailView";
import StockHistoricalView from "src/views/stock/StockHistoricalView";
import StockListView from "src/views/stock/StockListView";
import StockSummaryView from "src/views/stock/StockSummaryView";
import TechIndicatorView from "src/views/stock/TechIndicatorView";
import TwentyFourHourReturnView from "src/views/stock/TwentyFourHourReturnView";
import ValuationRatiosView from "src/views/stock/ValuationRatiosView";

const navbar_items = [
  {
    href: "/trending",
    icon: TrendingUpIcon,
    title: "Trending",
  },
  {
    href: "/dashboard",
    icon: DashboardIcon,
    title: "Dashboard",
  },
  {
    href: "/notes",
    icon: EventNoteIcon,
    title: "Notes",
  },
  {
    href: "/rankings",
    icon: SortIcon,
    title: "Rankings",
  },
  {
    href: "/news",
    icon: AnnouncementIcon,
    title: "News",
  },
  {
    href: "/sectors",
    icon: CompareIcon,
    title: "Sectors",
  },
  {
    href: "/stocks",
    icon: BusinessIcon,
    title: "Stocks",
  },
];

const routes = [
  // auth
  { path: "login", element: <LoginView /> },
  { path: "logout", element: <LogoutView /> },

  // application specific
  {
    path: "/",
    element: <MainLayout sideNavs={navbar_items} />,

    children: [
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
      { path: "dashboard", element: <TodayDashboardView /> },
      { path: "trending", element: <DashboardTrendingView /> },
      {
        path: "news",
        element: <NewsListView />,
      },

      // landing page, default to dashboard
      { path: "/", element: <Navigate to="/dashboard" /> },
      { path: "404", element: <NotFoundView /> },
      // catch all, 404
      { path: "*", element: <Navigate to="/404" /> },
    ],
  },
];

export default routes;

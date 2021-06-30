import React from "react";
import { Navigate } from "react-router-dom";

import SortIcon from "@material-ui/icons/Sort";
import CompareIcon from "@material-ui/icons/Compare";
import DashboardIcon from "@material-ui/icons/Dashboard";

import DashboardLayout from "src/layouts/DashboardLayout";
import MainLayout from "src/layouts/MainLayout";

import NotFoundView from "src/views/errors/NotFoundView";
import StockListView from "src/views/stock/StockListView";
import StockDetailView from "src/views/stock/StockDetailView";
import NavView from "src/views/stock/NavView";
import BalanceView from "src/views/stock/BalanceView";
import IncomeView from "src/views/stock/IncomeView";
import CashFlowView from "src/views/stock/CashFlowView";
import DCFView from "src/views/stock/DCFView";
import ValuationRatiosView from "src/views/stock/ValuationRatiosView";
import StockHistoricalView from "src/views/stock/StockHistoricalView";
import DupontView from "src/views/stock/DupontView";
import PriceView from "src/views/stock/PriceView";
import StockSummaryView from "src/views/stock/StockSummaryView";
import DailyReturnView from "src/views/stock/DailyReturnView";
import OvernightReturnView from "src/views/stock/OvernightReturnView";
import TwentyFourHourReturnView from "src/views/stock/TwentyFourHourReturnView";
import TechIndicatorView from "src/views/stock/TechIndicatorView";
import RankingView from "src/views/stock/RankingView";
import SectorListView from "src/views/sector/SectorListView";
import SectorDetailView from "src/views/sector/SectorDetailView";
import SectorPriceView from "src/views/sector/SectorPriceView";
import SectorReturnView from "src/views/sector/SectorReturnView";
import SectorRoeView from "src/views/sector/SectorRoeView";
import SectorBalancesheetView from "src/views/sector/SectorBalancesheetView";
import SectorIncomeView from "src/views/sector/SectorIncomeView";
import SectorCashFlowView from "src/views/sector/SectorCashFlowView";
import SectorInstitutionOwnershipView from "src/views/sector/SectorInstitutionOwnershipView";
import DiaryListView from "src/views/diary/DiaryListView";
import TodayDashboardView from "src/views/dashboard/TodayDashboardView";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import BusinessIcon from "@material-ui/icons/Business";
import EventNoteIcon from "@material-ui/icons/EventNote";
import NewsListView from "src/views/news/NewsListView";
import HistoricalRankingTrendView from "src/views/dashboard/HistoricalRankingTrendView";

const items = [
  {
    href: "/notes",
    icon: EventNoteIcon,
    title: "Notes",
  },
  {
    href: "/dashboard",
    icon: DashboardIcon,
    title: "Dashboard",
  },
  {
    href: "/news",
    icon: AnnouncementIcon,
    title: "News",
  },
  {
    href: "/rankings",
    icon: SortIcon,
    title: "Rankings",
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
  {
    path: "/",
    element: <DashboardLayout sideNavs={items} />,

    children: [
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
            ],
          },
        ],
      },
      { path: "rankings", element: <RankingView /> },
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
        ],
      },
      { path: "notes", element: <DiaryListView /> },
      { path: "dashboard", element: <TodayDashboardView /> },
      { path: "dashboard/trend", element: <HistoricalRankingTrendView /> },
      {
        path: "news",
        element: <NewsListView />,
      },
      { path: "/", element: <Navigate to="/dashboard" /> },
      { path: "*", element: <Navigate to="/404" /> },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "404", element: <NotFoundView /> },
      { path: "*", element: <Navigate to="/404" /> },
    ],
  },
];

export default routes;

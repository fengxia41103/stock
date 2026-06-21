import AnnouncementIcon from "@mui/icons-material/Announcement";
import BusinessIcon from "@mui/icons-material/Business";
import CompareIcon from "@mui/icons-material/Compare";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import SortIcon from "@mui/icons-material/Sort";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import React, { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import ScaleLoader from "react-spinners/ScaleLoader";

import MainLayout from "@Layouts/MainLayout";
import SectionErrorBoundary from "@Components/common/SectionErrorBoundary";
import LoginView from "@Views/auth/LoginView";
import LogoutView from "@Views/auth/LogoutView";
import ProtectedRoute from "@Views/auth/ProtectedRoute";
import RegistrationView from "@Views/auth/RegistrationView";

// Lazy-loaded views
const TodayDashboardView = lazy(() =>
  import("@Views/dashboard/TodayDashboardView"),
);
const DashboardTrendingView = lazy(() =>
  import("@Views/dashboard/DashboardTrendingView"),
);
const StockListView = lazy(() => import("@Views/stock/StockListView"));
const StockDetailView = lazy(() => import("@Views/stock/StockDetailView"));
const StockHistoricalView = lazy(() =>
  import("@Views/stock/StockHistoricalView"),
);
const StockSummaryView = lazy(() => import("@Views/stock/StockSummaryView"));
const PriceView = lazy(() => import("@Views/stock/PriceView"));
const DailyReturnView = lazy(() => import("@Views/stock/DailyReturnView"));
const OvernightReturnView = lazy(() =>
  import("@Views/stock/OvernightReturnView"),
);
const TwentyFourHourReturnView = lazy(() =>
  import("@Views/stock/TwentyFourHourReturnView"),
);
const TechIndicatorView = lazy(() => import("@Views/stock/TechIndicatorView"));
const LastLowerNextBetterView = lazy(() =>
  import("@Views/stock/LastLowerNextBetterView"),
);
const BalanceView = lazy(() => import("@Views/stock/BalanceView"));
const IncomeView = lazy(() => import("@Views/stock/IncomeView"));
const CashFlowView = lazy(() => import("@Views/stock/CashFlowView"));
const DCFView = lazy(() => import("@Views/stock/DCFView"));
const DupontView = lazy(() => import("@Views/stock/DupontView"));
const NavView = lazy(() => import("@Views/stock/NavView"));
const InsiderTradesView = lazy(() => import("@Views/stock/InsiderTradesView"));
const InstitutionalView = lazy(() => import("@Views/stock/InstitutionalView"));
const EarningsView = lazy(() => import("@Views/stock/EarningsView"));
const ValuationRatiosView = lazy(() =>
  import("@Views/stock/ValuationRatiosView"),
);
const RankingView = lazy(() => import("@Views/stock/RankingView"));
const SectorListView = lazy(() => import("@Views/sector/SectorListView"));
const SectorDetailView = lazy(() => import("@Views/sector/SectorDetailView"));
const SectorPriceView = lazy(() => import("@Views/sector/SectorPriceView"));
const SectorReturnView = lazy(() => import("@Views/sector/SectorReturnView"));
const SectorRoeView = lazy(() => import("@Views/sector/SectorRoeView"));
const SectorBalancesheetView = lazy(() =>
  import("@Views/sector/SectorBalancesheetView"),
);
const SectorIncomeView = lazy(() => import("@Views/sector/SectorIncomeView"));
const SectorCashFlowView = lazy(() =>
  import("@Views/sector/SectorCashFlowView"),
);
const SectorInstitutionOwnershipView = lazy(() =>
  import("@Views/sector/SectorInstitutionOwnershipView"),
);
const SectorRoeRankingView = lazy(() =>
  import("@Views/sector/SectorRoeRankingView"),
);
const SectorBalanceRankingView = lazy(() =>
  import("@Views/sector/SectorBalanceRankingView"),
);
const SectorIncomeRankingView = lazy(() =>
  import("@Views/sector/SectorIncomeRankingView"),
);
const SectorCashRankingView = lazy(() =>
  import("@Views/sector/SectorCashRankingView"),
);
const SectorValuationRankingView = lazy(() =>
  import("@Views/sector/SectorValuationRankingView"),
);
const SectorStocksLowerBetterView = lazy(() =>
  import("@Views/sector/SectorStocksLowerBetterView"),
);
const DiaryListView = lazy(() => import("@Views/diary/DiaryListView"));
const AddDiaryView = lazy(() => import("@Views/diary/AddDiaryView"));
const NewsListView = lazy(() => import("@Views/news/NewsListView"));

const Loader = <ScaleLoader loading />;

const S = ({ children }) => <Suspense fallback={Loader}>{children}</Suspense>;
const E = ({ section, children }) => (
  <SectionErrorBoundary section={section}>
    <S>{children}</S>
  </SectionErrorBoundary>
);

const navbar_items = [
  { href: "/dashboard", icon: <DashboardIcon />, title: "Today" },
  { href: "/trending", icon: <TrendingUpIcon />, title: "Price Trending" },
  { href: "/stocks", icon: <BusinessIcon />, title: "My Stocks" },
  { href: "/sectors", icon: <CompareIcon />, title: "My Sectors" },
  { href: "/rankings", icon: <SortIcon />, title: "Stock Rankings" },
  { href: "/notes", icon: <EventNoteIcon />, title: "My Notes" },
  { href: "/news", icon: <AnnouncementIcon />, title: "News" },
];

const routes = [
  { path: "logout", element: <LogoutView /> },
  { path: "registration", element: <RegistrationView /> },
  { path: "login", element: <LoginView /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout sideNavs={navbar_items} />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "stocks",
        element: (
          <S>
            <StockListView />
          </S>
        ),
      },
      {
        path: "stocks/:id",
        element: (
          <S>
            <StockDetailView />
          </S>
        ),
        children: [
          {
            path: "summary",
            element: (
              <S>
                <StockSummaryView />
              </S>
            ),
          },
          {
            path: "nav",
            element: (
              <S>
                <NavView />
              </S>
            ),
          },
          {
            path: "balance",
            element: (
              <S>
                <BalanceView />
              </S>
            ),
          },
          {
            path: "income",
            element: (
              <S>
                <IncomeView />
              </S>
            ),
          },
          {
            path: "cash",
            element: (
              <S>
                <CashFlowView />
              </S>
            ),
          },
          {
            path: "dcf",
            element: (
              <S>
                <DCFView />
              </S>
            ),
          },
          {
            path: "ratios",
            element: (
              <S>
                <ValuationRatiosView />
              </S>
            ),
          },
          {
            path: "dupont",
            element: (
              <S>
                <DupontView />
              </S>
            ),
          },
          {
            path: "insider-trades",
            element: (
              <S>
                <InsiderTradesView />
              </S>
            ),
          },
          {
            path: "institutional",
            element: (
              <S>
                <InstitutionalView />
              </S>
            ),
          },
          {
            path: "earnings",
            element: (
              <S>
                <EarningsView />
              </S>
            ),
          },
          {
            path: "historical",
            element: (
              <S>
                <StockHistoricalView />
              </S>
            ),
            children: [
              {
                path: "price",
                element: (
                  <S>
                    <PriceView />
                  </S>
                ),
              },
              {
                path: "return/daily",
                element: (
                  <S>
                    <DailyReturnView />
                  </S>
                ),
              },
              {
                path: "return/overnight",
                element: (
                  <S>
                    <OvernightReturnView />
                  </S>
                ),
              },
              {
                path: "return/24hr",
                element: (
                  <S>
                    <TwentyFourHourReturnView />
                  </S>
                ),
              },
              {
                path: "indicator/:type",
                element: (
                  <S>
                    <TechIndicatorView />
                  </S>
                ),
              },
              {
                path: "last/lower",
                element: (
                  <S>
                    <LastLowerNextBetterView />
                  </S>
                ),
              },
            ],
          },
        ],
      },
      {
        path: "sectors",
        element: (
          <S>
            <SectorListView />
          </S>
        ),
      },
      {
        path: "sectors/:id",
        element: (
          <S>
            <SectorDetailView />
          </S>
        ),
        children: [
          {
            path: "price",
            element: (
              <S>
                <SectorPriceView />
              </S>
            ),
          },
          {
            path: "return",
            element: (
              <S>
                <SectorReturnView />
              </S>
            ),
          },
          {
            path: "dupont",
            element: (
              <S>
                <SectorRoeView />
              </S>
            ),
          },
          {
            path: "balance",
            element: (
              <S>
                <SectorBalancesheetView />
              </S>
            ),
          },
          {
            path: "income",
            element: (
              <S>
                <SectorIncomeView />
              </S>
            ),
          },
          {
            path: "cash",
            element: (
              <S>
                <SectorCashFlowView />
              </S>
            ),
          },
          {
            path: "institution",
            element: (
              <S>
                <SectorInstitutionOwnershipView />
              </S>
            ),
          },
          {
            path: "ranking/roe",
            element: (
              <S>
                <SectorRoeRankingView />
              </S>
            ),
          },
          {
            path: "ranking/balance",
            element: (
              <S>
                <SectorBalanceRankingView />
              </S>
            ),
          },
          {
            path: "ranking/income",
            element: (
              <S>
                <SectorIncomeRankingView />
              </S>
            ),
          },
          {
            path: "ranking/cash",
            element: (
              <S>
                <SectorCashRankingView />
              </S>
            ),
          },
          {
            path: "ranking/valuation",
            element: (
              <S>
                <SectorValuationRankingView />
              </S>
            ),
          },
          {
            path: "gains",
            element: (
              <S>
                <SectorStocksLowerBetterView />
              </S>
            ),
          },
        ],
      },
      {
        path: "rankings",
        element: (
          <S>
            <RankingView />
          </S>
        ),
      },
      {
        path: "notes",
        element: (
          <S>
            <DiaryListView />
          </S>
        ),
      },
      {
        path: "notes/add",
        element: (
          <S>
            <AddDiaryView />
          </S>
        ),
      },
      {
        path: "dashboard",
        element: (
          <S>
            <TodayDashboardView />
          </S>
        ),
      },
      {
        path: "trending",
        element: (
          <S>
            <DashboardTrendingView />
          </S>
        ),
      },
      {
        path: "news",
        element: (
          <S>
            <NewsListView />
          </S>
        ),
      },
      { path: "/", element: <Navigate to="/sectors" /> },
    ],
  },
  { path: "*", element: <Navigate to="/404" /> },
];

export default routes;

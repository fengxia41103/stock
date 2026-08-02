import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the API hooks to avoid real network calls
vi.mock("@/api", () => ({
  useResource: () => ({ data: [], isLoading: false }),
  useStocksOverview: () => ({ data: [], isLoading: false }),
  useTriggeredAlerts: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/useMarketStatus", () => ({
  useMarketStatus: () => ({ isOpen: false, isExtended: false, isClosed: true, refetchInterval: false, label: "Market Closed" }),
}));

// Wrap component in required providers
const Providers = ({ children }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe("View Smoke Tests", () => {
  it("BriefView renders without crashing", async () => {
    const { default: BriefView } = await import("@Views/dashboard/BriefView");
    const { container } = render(<Providers><BriefView /></Providers>);
    expect(container).toBeTruthy();
  });

  it("TechnicalsView renders without crashing", async () => {
    const { default: TechnicalsView } = await import("@Views/dashboard/TechnicalsView");
    const { container } = render(<Providers><TechnicalsView /></Providers>);
    expect(container).toBeTruthy();
  });

  it("CompareView renders without crashing", async () => {
    const { default: CompareView } = await import("@Views/stock/CompareView");
    const { container } = render(<Providers><CompareView /></Providers>);
    expect(container).toBeTruthy();
  });

  it("PortfolioView renders without crashing", async () => {
    vi.doMock("@/api", () => ({
      useResource: () => ({ data: { positions: [], summary: {} }, isLoading: false, refetch: () => {} }),
      useStocks: () => ({ data: [] }),
      useStocksOverview: () => ({ data: [] }),
      useTriggeredAlerts: () => ({ data: [] }),
    }));
    const { default: PortfolioView } = await import("@Views/portfolio/PortfolioView");
    const { container } = render(<Providers><PortfolioView /></Providers>);
    expect(container).toBeTruthy();
  });
});

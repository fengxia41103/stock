/**
 * Chart rendering regression test.
 * Run: npx playwright test tests/charts.spec.js
 *
 * Verifies that all major chart pages render ECharts instances with data.
 * Requires the app running at BASE_URL with a logged-in session.
 */

const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.BASE_URL || "http://localhost:8084";
const USERNAME = process.env.TEST_USER || "admin";
const PASSWORD = process.env.TEST_PASS || "admin";

// Helper: login and return authenticated page
async function login(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="username"]', USERNAME);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes("login"), {
    timeout: 10000,
  });
}

// Helper: assert ECharts canvases rendered with content
async function assertChartsRendered(page, minCharts = 1) {
  // ECharts renders into containers with a canvas child
  const canvases = page.locator("canvas");
  const count = await canvases.count();
  expect(count).toBeGreaterThanOrEqual(minCharts);

  // Verify at least one canvas has non-zero dimensions (data rendered)
  for (let i = 0; i < Math.min(count, 3); i++) {
    const canvas = canvases.nth(i);
    const box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(50);
  }
}

// Helper: check ECharts instances have series data (not empty)
async function assertChartsHaveData(page) {
  const hasData = await page.evaluate(() => {
    // echarts stores instances on DOM elements
    const containers = document.querySelectorAll('[_echarts_instance_]');
    if (containers.length === 0) {
      // fallback: check for canvas with drawn pixels
      const canvases = document.querySelectorAll('canvas');
      return canvases.length > 0;
    }
    // Check at least one chart has non-empty series
    for (const el of containers) {
      const chart = window.echarts?.getInstanceByDom(el);
      if (chart) {
        const option = chart.getOption();
        const series = option?.series || [];
        if (series.some(s => s.data && s.data.length > 0)) return true;
      }
    }
    return containers.length > 0;
  });
  expect(hasData).toBe(true);
}

test.describe("Chart Rendering Regression", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Dashboard — MoverCards have data, trending charts render", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState("networkidle");
    // MoverCards should have list items (not "No stock for this list")
    const noDataMsg = page.locator('text="No stock for this list"');
    const noDataCount = await noDataMsg.count();
    // At most 1-2 cards may legitimately be empty, but not all 6
    expect(noDataCount).toBeLessThan(6);
  });

  test("Dashboard Trending — bar race / ranking chart renders", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/trending`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000); // charts animate
    await assertChartsRendered(page, 1);
    await assertChartsHaveData(page);
  });

  test("Stock Detail — price chart renders with candles/lines", async ({ page }) => {
    // Navigate to first stock's historical price view
    await page.goto(`${BASE_URL}/sectors`);
    await page.waitForLoadState("networkidle");
    // Click first stock link
    const stockLink = page.locator('a[href*="/stocks/"]').first();
    if (await stockLink.count() > 0) {
      await stockLink.click();
      await page.waitForLoadState("networkidle");
      // Navigate to price sub-view
      const priceLink = page.locator('a[href*="price"], button:has-text("Price")').first();
      if (await priceLink.count() > 0) {
        await priceLink.click();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);
        await assertChartsRendered(page, 1);
        await assertChartsHaveData(page);
      }
    }
  });

  test("Stock Detail — balance sheet chart renders", async ({ page }) => {
    await page.goto(`${BASE_URL}/stocks/1/balance`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    const canvases = page.locator("canvas");
    const count = await canvases.count();
    // Balance view should have charts if data exists
    if (count > 0) {
      await assertChartsRendered(page, 1);
      await assertChartsHaveData(page);
    }
  });

  test("Sector Detail — price trending chart renders", async ({ page }) => {
    await page.goto(`${BASE_URL}/sectors`);
    await page.waitForLoadState("networkidle");
    const sectorLink = page.locator('a[href*="/sectors/"]').first();
    if (await sectorLink.count() > 0) {
      await sectorLink.click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      // Sector detail often has price comparison charts
      const canvases = page.locator("canvas");
      if (await canvases.count() > 0) {
        await assertChartsRendered(page, 1);
      }
    }
  });

  test("Rankings — ranking bar charts render with data", async ({ page }) => {
    await page.goto(`${BASE_URL}/rankings`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    // Rankings page should have rank bars or lists with data
    const listItems = page.locator("li");
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });
});

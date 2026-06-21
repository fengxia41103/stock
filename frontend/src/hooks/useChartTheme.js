/**
 * Returns the ECharts theme name based on current dark mode setting.
 * @returns "dark" | undefined
 */
export function useChartTheme() {
  const mode = localStorage.getItem("themeMode");
  return mode === "dark" ? "dark" : undefined;
}

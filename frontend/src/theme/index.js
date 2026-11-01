import { createTheme, responsiveFontSizes } from "@mui/material/styles";

import shadows from "./shadows";
import typography from "./typography";

// Palette tokens per mode. The DARK values reproduce the retirement UI look
// (dark panels, accent blue, subtle borders); LIGHT keeps the prior slate/blue.
const TOKENS = {
  dark: {
    primary: "#4aa3ff",
    secondary: "#3fb950",
    bgDefault: "#0f141a",
    bgPaper: "#1a222c",
    textPrimary: "#e6edf3",
    textSecondary: "#8b98a5",
    divider: "#2a3542",
    appbar: "#141b23",
  },
  light: {
    primary: "#1565c0",
    secondary: "#10b981",
    bgDefault: "#f8fafc",
    bgPaper: "#ffffff",
    textPrimary: "#1e293b",
    textSecondary: "#64748b",
    divider: "#e2e8f0",
    appbar: "#ffffff",
  },
};

export function createAppTheme(mode = "dark") {
  const t = TOKENS[mode] || TOKENS.dark;
  return responsiveFontSizes(
    createTheme({
      spacing: 3,
      palette: {
        mode,
        primary: { main: t.primary },
        secondary: { main: t.secondary },
        background: { default: t.bgDefault, paper: t.bgPaper },
        text: { primary: t.textPrimary, secondary: t.textSecondary },
        success: { main: "#3fb950" },
        error: { main: "#ef4444" },
        warning: { main: "#d29922" },
        divider: t.divider,
      },
      shape: { borderRadius: 10 },
      shadows,
      typography,
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
              // The "panel" card look from the retirement UI.
              border: `1px solid ${t.divider}`,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: { border: `1px solid ${t.divider}`, backgroundImage: "none" },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: t.bgPaper,
              borderRight: `1px solid ${t.divider}`,
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: t.appbar,
              borderBottom: `1px solid ${t.divider}`,
              color: t.textPrimary,
              backgroundImage: "none",
            },
          },
        },
        MuiButton: {
          styleOverrides: { root: { textTransform: "none" } },
        },
        MuiToggleButton: {
          styleOverrides: {
            root: { textTransform: "none", paddingTop: 4, paddingBottom: 4 },
          },
        },
        MuiChip: {
          // Pill badges (yes/no, live/fallback, correct/wrong).
          styleOverrides: {
            root: { fontWeight: 600, borderRadius: 16 },
            sizeSmall: { height: 22, fontSize: "0.72rem" },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: { paddingTop: 7, paddingBottom: 7 },
            head: { color: t.textSecondary, fontWeight: 600 },
          },
        },
        MuiTextField: {
          defaultProps: { size: "small" },
        },
      },
    }),
  );
}

// Default export stays a ready-made theme (dark) for any direct importers.
const theme = createAppTheme("dark");
export default theme;

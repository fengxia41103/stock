import { createTheme, responsiveFontSizes } from "@mui/material/styles";

import shadows from "./shadows";
import typography from "./typography";

const theme = responsiveFontSizes(
  createTheme({
    spacing: 3,
    palette: {
      mode: "dark",
      primary: { main: "#3b82f6" },       // blue-500
      secondary: { main: "#10b981" },     // emerald-500 (gains)
      background: {
        default: "#0f172a",               // slate-900
        paper: "#1e293b",                 // slate-800
      },
      text: {
        primary: "#f8fafc",               // slate-50
        secondary: "#94a3b8",             // slate-400
      },
      success: { main: "#10b981" },       // emerald
      error: { main: "#ef4444" },         // red-500
      warning: { main: "#f59e0b" },       // amber-500
      divider: "#334155",                 // slate-700
    },
    shadows,
    typography,
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",      // Remove default MUI elevation gradient
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: "#1e293b",
            borderRight: "1px solid #334155",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "#1e293b",
            borderBottom: "1px solid #334155",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
    },
  }),
);

export default theme;

import { createTheme, responsiveFontSizes } from "@mui/material/styles";

import shadows from "./shadows";
import typography from "./typography";

const theme = responsiveFontSizes(
  createTheme({
    spacing: 3,
    palette: {
      mode: "light",
      primary: { main: "#1565c0" }, // blue-800
      secondary: { main: "#10b981" }, // emerald-500 (gains)
      background: {
        default: "#f8fafc", // slate-50
        paper: "#ffffff", // white
      },
      text: {
        primary: "#1e293b", // slate-800
        secondary: "#64748b", // slate-500
      },
      success: { main: "#10b981" }, // emerald
      error: { main: "#ef4444" }, // red-500
      warning: { main: "#f59e0b" }, // amber-500
      divider: "#e2e8f0", // slate-200
    },
    shadows,
    typography,
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: "#ffffff",
            borderRight: "1px solid #e2e8f0",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            color: "#1e293b",
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

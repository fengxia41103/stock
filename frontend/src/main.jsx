import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ThemeProvider as StylesThemeProvider } from "@mui/styles";

import App from "./App";
import theme from "./theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <StylesThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </StylesThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);

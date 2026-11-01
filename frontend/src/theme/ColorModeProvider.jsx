import PropTypes from "prop-types";
import React, { createContext, useContext, useMemo, useState } from "react";

import { CssBaseline, ThemeProvider } from "@mui/material";

import { createAppTheme } from "./index";

const STORAGE_KEY = "colorMode";
const ColorModeContext = createContext({ mode: "dark", toggle: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "dark";
    } catch {
      return "dark";
    }
  });

  const value = useMemo(
    () => ({
      mode,
      toggle: () =>
        setMode((m) => {
          const next = m === "dark" ? "light" : "dark";
          try {
            localStorage.setItem(STORAGE_KEY, next);
          } catch {
            /* ignore storage errors */
          }
          return next;
        }),
    }),
    [mode],
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ColorModeProvider.propTypes = {
  children: PropTypes.node,
};

export default ColorModeProvider;

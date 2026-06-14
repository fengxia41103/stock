import { colors } from "@mui/material";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

import shadows from "./shadows";
import typography from "./typography";

export const getTheme = (mode = "light") =>
  responsiveFontSizes(
    createTheme({
      spacing: 3,
      palette: {
        mode,
        ...(mode === "light"
          ? {
              background: { default: "#F4F6F8", paper: colors.common.white },
              primary: { main: colors.indigo[500] },
              secondary: { main: colors.pink[600] },
              text: {
                primary: colors.blueGrey[900],
                secondary: colors.blueGrey[600],
              },
              success: { main: "#4caf50" },
              error: { main: "#f44336" },
            }
          : {
              background: { default: "#121212", paper: "#1e1e1e" },
              primary: { main: colors.indigo[300] },
              secondary: { main: colors.pink[300] },
              success: { main: "#66bb6a" },
              error: { main: "#ef5350" },
            }),
      },
      shadows,
      typography,
    }),
  );

export default getTheme("light");

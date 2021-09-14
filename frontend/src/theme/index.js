import { colors } from "@material-ui/core";
import { createTheme, responsiveFontSizes } from "@material-ui/core/styles";

import { shadows } from "./shadows";
import { typography } from "./typography";

let theme = createTheme({
  spacing: 8,
  palette: {
    background: {
      dark: "#F4F6F8",
      default: colors.common.white,
      paper: colors.common.white,
    },
    primary: {
      main: colors.indigo[500],
    },
    secondary: {
      main: colors.pink[600],
    },
    text: {
      primary: colors.blueGrey[900],
      secondary: colors.blueGrey[600],
    },
  },
  shadows,
  typography,
  table: {
    minWidth: 650,
  },
});

theme = responsiveFontSizes(theme);

export default theme;

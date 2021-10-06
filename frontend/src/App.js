import { ThemeProvider } from "@material-ui/core";
import React from "react";
import "react-perfect-scrollbar/dist/css/styles.css";
import { useRoutes, useLocation } from "react-router-dom";
import { RestfulProvider } from "restful-react";

import GlobalStyles from "src/components/common/GlobalStyles";
import GlobalContext from "src/context";
import routes from "src/routes";
import theme from "src/theme";
import LoginView from "src/views/auth/LoginView";
import RegistrationView from "src/views/auth/RegistrationView";

const globals = {
  localhost: {
    api: "http://localhost:8003/api/v1",
    host: "http://localhost:8003",
  },
};

export default function App() {
  // global config
  const backend = globals.localhost;

  // check authentication
  const session = window.sessionStorage;
  const user = session.getItem("user");
  const api_key = session.getItem("api_key");

  // routing table
  const routing = useRoutes(routes);
  const location = useLocation();

  // goto where
  let here = null;
  if (location.pathname === "/registration") {
    here = <RegistrationView />;
  } else if (!!user && !!api_key) {
    here = routing;
  } else {
    here = <LoginView />;
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <RestfulProvider
        base={backend.api}
        requestOptions={(url, method, requestBody) => ({
          headers: {
            "content-type": "application/json",
            Authorization: `ApiKey ${user}:${api_key}`,
          },
        })}
      >
        <GlobalContext.Provider value={{ ...backend }}>
          {here}
        </GlobalContext.Provider>
      </RestfulProvider>
    </ThemeProvider>
  );
}

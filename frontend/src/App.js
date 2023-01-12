import React from "react";
import "react-perfect-scrollbar/dist/css/styles.css";
import { useLocation, useRoutes } from "react-router-dom";
import { RestfulProvider } from "restful-react";

import { ThemeProvider } from "@mui/material";

import GlobalContext from "src/context";
import routes from "src/routes";
import theme from "src/theme";
import LoginView from "src/views/auth/LoginView";
import RegistrationView from "src/views/auth/RegistrationView";

const globals = {
  backend: {
    api: "http://localhost:8003/api/v1",
    host: "http://localhost:8003",
  },
};

const App = () => {
  // global config
  const { backend } = globals;

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

  const auth = `ApiKey ${user}:${api_key}`;
  return (
    <ThemeProvider theme={theme}>
      <RestfulProvider
        base={backend.api}
        requestOptions={() => ({
          headers: {
            "content-type": "application/json",
            Authorization: auth,
          },
        })}
      >
        <GlobalContext.Provider value={{ ...backend, user, auth }}>
          {here}
        </GlobalContext.Provider>
      </RestfulProvider>
    </ThemeProvider>
  );
};

export default App;

import { ThemeProvider } from "@material-ui/core";
import React from "react";
import "react-perfect-scrollbar/dist/css/styles.css";
import { useRoutes } from "react-router-dom";
import { RestfulProvider } from "restful-react";

import GlobalStyles from "src/components/common/GlobalStyles";
import GlobalContext from "src/context";
import routes from "src/routes";
import theme from "src/theme";
import LoginView from "src/views/auth/LoginView";

const globals = {
  p517: {
    api: "http://192.168.68.107:8003/api/v1",
    host: "http://192.168.68.107:8003",
  },
};

const App = () => {
  // global config
  const backend = globals.p517;

  // check authentication
  const session = window.sessionStorage;
  const user = session.getItem("user");
  const api_key = session.getItem("api_key");

  // routing table
  const routing = useRoutes(routes);

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
          {!!user && !!api_key ? routing : <LoginView />}
        </GlobalContext.Provider>
      </RestfulProvider>
    </ThemeProvider>
  );
};

export default App;

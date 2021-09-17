import { ThemeProvider } from "@material-ui/core";
import React, { useState, useMemo } from "react";
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
  const backend = globals.p517;
  const [session] = useState(window.sessionStorage);
  const user = useMemo(() => session.getItem("user"));
  const api_key = useMemo(() => session.getItem("api_key"));
  const isAuthenticated = useMemo(() => !!user && !!api_key, [user, api_key]);
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
          {isAuthenticated ? routing : <LoginView />}
        </GlobalContext.Provider>
      </RestfulProvider>
    </ThemeProvider>
  );
};

export default App;

import React, { useState, useEffect } from "react";
import { useRoutes } from "react-router-dom";
import "react-perfect-scrollbar/dist/css/styles.css";
import { ThemeProvider } from "@material-ui/core";
import GlobalStyles from "src/components/common/GlobalStyles";
import "src/mixins/chartjs";
import theme from "src/theme";
import routes from "src/routes";
import LoginView from "src/views/auth/LoginView";
import GlobalContext from "src/context";
import { RestfulProvider } from "restful-react";

const globals = {
  localhost: {
    api: "http://localhost:8003/api/v1",
    host: "http://localhost:8003",
  },
};

const App = () => {
  const backend = globals.localhost;
  const session = window.sessionStorage;
  const [user, setUser] = useState();
  const [api_key, setApiKey] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const routing = useRoutes(routes);

  useEffect(() => {
    // MUST: read each time we mount this component!
    setUser(session.getItem("user"));
    setApiKey(session.getItem("api_key"));

    // this bool is for convenience
    setIsAuthenticated(!!user && !!api_key);
  });

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <RestfulProvider base={backend.api}>
        <GlobalContext.Provider value={{ ...backend }}>
          {isAuthenticated ? routing : <LoginView />}
        </GlobalContext.Provider>
      </RestfulProvider>
    </ThemeProvider>
  );
};

export default App;

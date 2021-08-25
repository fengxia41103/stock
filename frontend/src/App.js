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
  const routing = useRoutes(routes);

  useEffect(() => {
    setUser(session.getItem("user"));
    setApiKey(session.getItem("api_key"));
  }, [session]);

  // MUST: login will set the keys, but navigate will not force this view to
  // reload! Therefore, it's necessary to pass this call to login so that once
  // logged in, this view will be refreshed because state has changed.
  const set_auth = (user, key) => {
    session.setItem("user", user);
    session.setItem("api_key", key);

    // update state, will cause rerender
    setUser(user);
    setApiKey(key);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <RestfulProvider
        base={backend.api}
        requestOptions={(url, method, requestBody) => ({
          headers: { Authorization: `ApiKey ${user}:${api_key}` },
        })}
      >
        <GlobalContext.Provider
          value={{
            set_auth,
            ...backend,
          }}
        >
          {!!user && !!api_key ? routing : <LoginView />}
        </GlobalContext.Provider>
      </RestfulProvider>
    </ThemeProvider>
  );
};

export default App;

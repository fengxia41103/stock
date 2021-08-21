import React, { useState } from "react";
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
  p127: {
    api: "http://192.168.1.114:8003/api/v1",
    host: "http://192.168.1.114:8003",
  },
  p517: {
    api: "http://192.168.68.107:8003/api/v1",
    host: "http://192.168.68.107:8003",
  },
};

const App = () => {
  const backend = globals.localhost;
  const session = window.sessionStorage;
  const routing = useRoutes(routes);
  const [user] = useState(session.getItem("user"));
  const [api_key, setApiKey] = useState(session.getItem("api_key"));

  const set_auth = (user, key) => {
    session.setItem("user", user);
    session.setItem("api_key", key);

    // update state, will cause rerender
    setApiKey(key);
  };

  if (!!!api_key) {
    return <LoginView {...{ set_auth, ...backend }} />;
  }

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
            ...backend,
          }}
        >
          {routing}
        </GlobalContext.Provider>
      </RestfulProvider>
    </ThemeProvider>
  );
};

export default App;

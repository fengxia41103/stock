import LoginView from "@Views/auth/LoginView";
import RegistrationView from "@Views/auth/RegistrationView";
import React from "react";
import "react-perfect-scrollbar/dist/css/styles.css";
import { useLocation, useRoutes } from "react-router-dom";
import { RestfulProvider } from "restful-react";

import GlobalContext from "@/context";

import "./App.css";
import routes from "./routes";

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
  const location = useLocation();
  const routing = useRoutes(routes);

  // goto where
  let here = "hello world";
  if (location.pathname === "/registration") {
    here = <RegistrationView />;
  } else if (!!user && !!api_key) {
    here = routing;
  } else {
    here = <LoginView />;
  }

  const auth = `ApiKey ${user}:${api_key}`;

  return (
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
  );
};

export default App;

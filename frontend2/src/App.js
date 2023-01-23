import React from "react";
import "react-perfect-scrollbar/dist/css/styles.css";
import {
  BrowserRouter,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { RestfulProvider } from "restful-react";

import "@/App.css";
import GlobalContext from "@/context";
import routes from "@/routes";

import LoginView from "@Views/auth/LoginView";
import RegistrationView from "@Views/auth/RegistrationView";

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

  // goto where
  let here = "hello world";
  if (!!user && !!api_key) {
    const router = createBrowserRouter(routes);
    here = <RouterProvider router={router} />;
  } else {
    here = (
      <BrowserRouter>
        <LoginView />
      </BrowserRouter>
    );
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

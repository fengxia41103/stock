import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";
import App from "./App";
import GlobalContext from "src/context";

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

ReactDOM.render(
  <BrowserRouter>
    <GlobalContext.Provider value={globals.localhost}>
      <App />
    </GlobalContext.Provider>
  </BrowserRouter>,
  document.getElementById("root")
);

serviceWorker.unregister();

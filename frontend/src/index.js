import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";
import App from "./App";
import GlobalContext from "src/context";

const globals = {
  p127: {
    api: "http://192.168.1.114:8003/api/v1",
  },
  p517: {
    api: "http://192.168.68.107:8003/api/v1",
  },
};

ReactDOM.render(
  <BrowserRouter>
    <GlobalContext.Provider value={globals.p517}>
      <App />
    </GlobalContext.Provider>
  </BrowserRouter>,
  document.getElementById("root")
);

serviceWorker.unregister();

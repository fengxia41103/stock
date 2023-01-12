import React from "react";
import * as ReactDOM from "react-dom/clienr";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import * as serviceWorker from "./serviceWorker";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);

serviceWorker.unregister();

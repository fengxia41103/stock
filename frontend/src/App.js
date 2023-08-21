import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import routes from "@/routes";

const App = () => {
  // goto where
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};

export default App;

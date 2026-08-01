import { createContext } from "react";

const GlobalContext = createContext({
  api: "/api/v1",
  host: "",
  user: "",
});

export default GlobalContext;

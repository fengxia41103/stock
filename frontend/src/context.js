import { createContext } from "react";

const GlobalContext = createContext({
  backend: {
    api: "http://localhost:8003/api/v1",
    host: "http://localhost:8003",
  },
});

export default GlobalContext;

import { createContext } from "react";

const GlobalContext = createContext({
  api: `${process.env.REACT_APP_HOST_URL}/api/v1`,
  host: `${process.env.REACT_APP_HOST_URL}`,
});

export default GlobalContext;

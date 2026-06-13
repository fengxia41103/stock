import { createContext } from "react";

const GlobalContext = createContext({
  api: import.meta.env.VITE_API_URL || "/api/v1",
  host: import.meta.env.VITE_HOST_URL || "",
});

export default GlobalContext;

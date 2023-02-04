import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { RestfulProvider } from "restful-react";

import GlobalContext from "@/context";

const ProtectedRoute = ({ children }) => {
  const context = useContext(GlobalContext);
  const { backend } = context;

  // check authentication
  const session = window.sessionStorage;
  const user = session.getItem("user");
  const api_key = session.getItem("api_key");

  if (!!user && !!api_key) {
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
          {children}
        </GlobalContext.Provider>
      </RestfulProvider>
    );
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;

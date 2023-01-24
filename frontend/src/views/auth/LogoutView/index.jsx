import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Get } from "@fengxia41103/storybook";

import GlobalContext from "@/context";

const LogoutView = () => {
  const { backend } = useContext(GlobalContext);
  const { api } = backend;

  // states
  const [resource] = useState("/auth/logout/");
  const navigate = useNavigate();

  // callbacks
  const remove_auth = () => {
    // clear session storage
    const session = window.sessionStorage;
    session.removeItem("user");
    session.removeItem("api_key");
    session.clear();
  };

  // you decide what to do if logged out
  const on_success = (resp) => {
    if (resp.success) {
      // clear session storage
      remove_auth();

      // go to a landing page
      navigate("/login", { replace: true });
    }
    return null;
  };

  const on_error = (err) => console.error(err);

  return (
    <Get {...{ uri: `${api}resource`, on_success, on_error, silent: true }} />
  );
};

export default LogoutView;

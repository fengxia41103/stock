import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logout from "src/components/auth/Logout";

export default function LogoutView() {
  const navigate = useNavigate();
  const session = window.sessionStorage;

  // states
  const [resource] = useState("/auth/logout/");

  // callbacks
  const remove_auth = () => {
    // clear session storage
    session.removeItem("user");
    session.removeItem("api_key");
    session.clear();
  };

  // you decide what to do if logged in
  const on_success = (resp) => {
    if (resp.success) {
      remove_auth();

      // go to a landing page
      navigate("/login");
    }
  };
  const on_error = (err) => console.error(err);

  // render
  return (
    <Logout {...{ resource, on_success, on_error }} />
  );
}

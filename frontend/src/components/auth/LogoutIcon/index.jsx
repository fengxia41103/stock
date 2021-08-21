import React, { useState, useContext } from "react";
import { Tooltip } from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import GlobalContext from "src/context";
import { useNavigate } from "react-router-dom";

export default function LogoutIcon() {
  const { api } = useContext(GlobalContext);
  const [resource] = useState("/auth/logout/");
  const session = window.sessionStorage;
  const [user] = useState(session.getItem("user"));
  const [api_key] = useState(session.getItem("api_key"));
  const navigate = useNavigate();

  // call to logout
  const logout = () => {
    const uri = `${api}${resource}`;

    // Simple POST request with a JSON body using fetch
    const options = {
      method: "GET",
      cache: "no-cache",
      headers: {
        Authorization: `ApiKey ${user}:${api_key}`,
      },
    };
    return fetch(uri, options).then(response => response.json());
  };

  // call login handler
  const on_logout = async e => {
    e.preventDefault();
    const resp = await logout();

    if (resp.success) {
      // clear session storage
      session.removeItem("user");
      session.removeItem("api_key");
      session.clear();

      // back to root
      navigate("login");
    }
  };

  return (
    <Tooltip title="Logout">
      <ExitToAppIcon onClick={on_logout} />
    </Tooltip>
  );
}

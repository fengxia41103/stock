import PropTypes from "prop-types";
import React from "react";

import { Button } from "@mui/material";

import api from "@/api/client";

const LoginButton = ({ username, password, on_success, on_error }) => {
  const on_login = (event) => {
    event.preventDefault();
    api.post("/auth/login/", { username, password })
      .then((resp) => {
        const data = resp.data;
        if (data.success) {
          localStorage.setItem("apiKey", data.data.key);
          sessionStorage.setItem("user", data.data.user);
          sessionStorage.setItem("api_key", data.data.key);
        }
        if (on_success) on_success(data);
      })
      .catch((error) => { if (on_error) on_error(error); });
  };

  return (
    <Button variant="contained" color="primary" onClick={on_login}>
      Login
    </Button>
  );
};

LoginButton.propTypes = {
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  on_success: PropTypes.func.isRequired,
  on_error: PropTypes.func,
};

export default LoginButton;

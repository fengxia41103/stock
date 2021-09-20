import { Button } from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";

export default function LoginButton(props) {
  // props
  const { resource, username, password, on_success, on_error } = props;

  // event handlers
  const on_login = (event) => {
    event.preventDefault();

    // Simple POST request with a JSON body using fetch
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-cache",
      body: JSON.stringify({ ...{ username, password } }),
    };

    // call API
    return fetch(resource, options)
      .then((response) => response.json())
      .then((resp) => {
        if (on_success) on_success(resp);
      })
      .catch((error) => {
        if (on_error) on_error(error);
      });
  };

  // render
  return (
    <Button variant="contained" color="primary" onClick={on_login}>
      Login
    </Button>
  );
}

LoginButton.propTypes = {
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func.isRequired,
  on_error: PropTypes.func,
};

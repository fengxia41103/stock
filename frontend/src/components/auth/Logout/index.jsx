import React, { useContext, useEffect } from "react";
import GlobalContext from "src/context";
import PropTypes from "prop-types";
import CircularProgress from "@material-ui/core/CircularProgress";

export default function Logout(props) {
  // props
  const { username, api_key, resource, on_success, on_error } = props;

  const { api } = useContext(GlobalContext);

  // call to logout
  const on_logout = () => {
    const uri = `${api}${resource}`;

    // Simple POST request with a JSON body using fetch
    const options = {
      method: "GET",
      cache: "no-cache",
      headers: {
        Authorization: `ApiKey ${username}:${api_key}`,
      },
    };
    return fetch(uri, options)
      .then(response => response.json())
      .then(resp => {
        if (!!on_success) on_success(resp);
      })
      .catch(error => {
        if (!!on_error) on_error(error);
      });
  };

  // this component does nothing but to logout
  useEffect(() => {
    on_logout();
  });

  // wait
  return <CircularProgress />;
}

Logout.propTypes = {
  username: PropTypes.string.isRequired,
  api_key: PropTypes.string.isRequired,
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func.isRequired,
  on_error: PropTypes.func,
};

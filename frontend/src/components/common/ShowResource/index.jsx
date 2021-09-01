import React, { useState } from "react";
import NotFoundView from "src/views/errors/NotFoundView";
import Get from "src/components/common/Get";
import PropTypes from "prop-types";

export default function ShowResource(props) {
  const { resource, on_success, silent } = props;

  // get user and api key
  const session = window.sessionStorage;
  const [user] = useState(session.getItem("user"));
  const [api_key] = useState(session.getItem("api_key"));

  const options = { headers: { Authorization: `ApiKey ${user}:${api_key}` } };
  const on_error = () => <NotFoundView />;

  // if caller is not mounted anymore, quit
  //if (mounted && !mounted.current) return null;

  // everything is good, render
  return <Get {...{ uri: resource, options, on_success, on_error, silent }} />;
}

ShowResource.propTypes = {
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func.isRequired,
  silent: PropTypes.bool,
};

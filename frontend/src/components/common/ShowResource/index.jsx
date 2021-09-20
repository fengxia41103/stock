import PropTypes from "prop-types";
import React from "react";

import Get from "src/components/common/Get";
import NotFoundView from "src/views/errors/NotFoundView";

export default function ShowResource(props) {
  const { resource } = props;

  const on_error = () => <NotFoundView />;

  // if caller is not mounted anymore, quit
  //if (mounted && !mounted.current) return null;

  // everything is good, render
  return <Get {...{ uri: resource, on_error, ...props }} />;
}

ShowResource.propTypes = {
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func.isRequired,
  silent: PropTypes.bool,
};

import React from "react";
import PropTypes from "prop-types";
import Get from "src/components/common/Get";

export default function Logout(props) {
  // props
  const { resource } = props;

  return <Get {...{ uri: resource, ...props, silent: true }} />;
}

Logout.propTypes = {
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func.isRequired,
  on_error: PropTypes.func,
};

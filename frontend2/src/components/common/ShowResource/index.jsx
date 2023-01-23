import Get from "@Components/common/Get";
import PropTypes from "prop-types";
import React from "react";

import { NotFoundView } from "@fengxia41103/storybook";

const ShowResource = (props) => {
  const { resource } = props;

  const on_error = () => <NotFoundView />;

  // everything is good, render
  return <Get {...{ uri: resource, on_error, ...props }} />;
};

ShowResource.propTypes = {
  resource: PropTypes.string.isRequired,

  on_success: PropTypes.func,
  silent: PropTypes.bool,
};

export default ShowResource;

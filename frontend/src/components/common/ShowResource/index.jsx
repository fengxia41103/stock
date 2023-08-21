import PropTypes from "prop-types";
import React from "react";

import { NotFoundView } from "@fengxia41103/storybook";

import Get from "@Components/common/Get";

const ShowResource = (props) => {
  const { resource } = props;

  const on_error = () => <NotFoundView />;

  // everything is good, render
  return <Get {...{ uri: resource, on_error, ...props }} />;
};

ShowResource.propTypes = {
  resource: PropTypes.string.isRequired,
};

export default ShowResource;

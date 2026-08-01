import PropTypes from "prop-types";
import React from "react";

import { NotFoundView } from "@/components/shared";

import Get from "@Components/common/Get";

const ShowResource = (props) => {
  const { resource, on_success, on_error, silent, ...rest } = props;

  const handleError = on_error || (() => <NotFoundView />);

  return (
    <Get
      uri={resource}
      on_error={handleError}
      on_success={on_success}
      silent={silent}
      {...rest}
    />
  );
};

ShowResource.propTypes = {
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func,
  on_error: PropTypes.func,
  silent: PropTypes.bool,
};

export default ShowResource;

import PropTypes from "prop-types";
import React from "react";
import { Poll } from "restful-react";

import CircularProgress from "@mui/material/CircularProgress";

import { NotFoundView, SimpleSnackbar } from "@fengxia41103/storybook";

// hardcoded
const DEFAULT_SUCCESS = "Call to API was successful";
const DEFAULT_ERROR = "Call to API failed";
const DEFAULT_INTERVAL = 3; // in seconds

const PollResource = (props) => {
  // props
  const {
    resource,
    silent,
    on_success,
    success_msg,
    interval,
    error_msg,
    until,
  } = props;

  // helpers
  const on_error = () => <NotFoundView />;

  const if_loading = () => {
    if (silent) return null;
    return <CircularProgress />;
  };

  const if_success = (data) => (
    <>
      {silent === false ? <SimpleSnackbar msg={success_msg} /> : null}
      {on_success ? on_success(data) : null}
    </>
  );

  const if_error = (error) => (
    <>
      {silent === false ? <SimpleSnackbar msg={error_msg} /> : null}
      {on_error ? on_error(error) : null}
    </>
  );

  const on_polling = (data, loading, error, finished, polling) => {
    if (loading) return if_loading();
    if (finished || polling) return if_success(data);
    if (error) return if_error(error);

    return null;
  };

  const pollHandler = (data, { loading, error, finished, polling }) =>
    on_polling(data, loading, error, finished, polling);

  // render
  return (
    <Poll
      path={resource}
      interval={5000}
      resolve={(data) => data}
      until={until}
    >
      {pollHandler}
    </Poll>
  );
};

PollResource.propTypes = {
  resource: PropTypes.string.isRequired,

  on_success: PropTypes.func,
  silent: PropTypes.bool,
  success_msg: PropTypes.string,
  error_msg: PropTypes.string,

  // signature: (data, resp)=>{}
  until: PropTypes.func,

  // in seconds
  interval: PropTypes.number,
};

PollResource.default = {
  silent: false,
  success_msg: DEFAULT_SUCCESS,
  error_msg: DEFAULT_ERROR,
  interval: DEFAULT_INTERVAL,
};

export default PollResource;

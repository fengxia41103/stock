import CircularProgress from "@material-ui/core/CircularProgress";
import PropTypes from "prop-types";
import React from "react";
import { Poll } from "restful-react";

import SimpleSnackbar from "src/components/common/SimpleSnackbar";
import NotFoundView from "src/views/errors/NotFoundView";

export default function PollResource(props) {
  // hardcoded
  const DEFAULT_SUCCESS = "Call to API was successful";
  const DEFAULT_ERROR = "Call to API failed";
  const DEFAULT_INTERVAL = 3; // in seconds

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
    else {
      return <CircularProgress />;
    }
  };
  const if_success = (data) => (
    <>
      {silent === false ? (
        <SimpleSnackbar msg={success_msg ? success_msg : DEFAULT_SUCCESS} />
      ) : null}
      {on_success ? on_success(data) : null}
    </>
  );
  const if_error = (error) => {
    return (
      <>
        {silent === false ? (
          <SimpleSnackbar msg={error_msg ? error_msg : DEFAULT_ERROR} />
        ) : null}
        {on_error ? on_error(error) : null}
      </>
    );
  };

  const on_polling = (data, loading, error, finished, polling) => {
    if (loading) return if_loading();
    if (finished || polling) return if_success(data);
    if (error) return if_error(error);
  };

  // render
  return (
    <Poll
      path={resource}
      interval={(interval || DEFAULT_INTERVAL) * 1000}
      resolve={(data) => data}
      until={until}
    >
      {(data, { loading, error, finished, polling }, { start }) =>
        on_polling(data, loading, error, finished, polling)
      }
    </Poll>
  );
}

PollResource.propTypes = {
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func.isRequired,
  silent: PropTypes.bool,
  success_msg: PropTypes.string,
  error_msg: PropTypes.string,

  // signature: (data, resp)=>{}
  until: PropTypes.func,

  // in seconds
  interval: PropTypes.number,
};

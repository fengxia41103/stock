import PropTypes from "prop-types";
import React from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useGet } from "restful-react";

import SimpleSnackbar from "src/components/common/SimpleSnackbar";

export default function Get(props) {
  // hardcoded
  const DEFAULT_SUCCESS = "Call to API was successful";
  const DEFAULT_ERROR = "Call to API failed";

  // props
  const {
    uri,
    options,
    on_success,
    on_error,
    success_msg,
    error_msg,
    silent,
  } = props;

  const call_options = { path: encodeURI(uri), debounce: 200, ...options };

  // when waiting
  const { data, loading, error } = useGet(call_options);
  if (loading) {
    if (silent) return null;
    else {
      return <ScaleLoader loading={true} />;
    }
  }

  // when error
  if (error) {
    return (
      <>
        {silent === false ? (
          <SimpleSnackbar msg={error_msg ? error_msg : DEFAULT_ERROR} />
        ) : null}
        {on_error ? on_error(data) : null}
      </>
    );
  }

  // when success
  return (
    <>
      {silent === false ? (
        <SimpleSnackbar msg={success_msg ? success_msg : DEFAULT_SUCCESS} />
      ) : null}
      {on_success ? on_success(data) : null}
    </>
  );
}

Get.propTypes = {
  uri: PropTypes.string.isRequired,
  on_success: PropTypes.func.isRequired,
  options: PropTypes.object,
  on_error: PropTypes.func,
  success_msg: PropTypes.string,
  error_msg: PropTypes.string,
  silent: PropTypes.bool,
};

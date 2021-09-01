import React, { useEffect } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import SimpleSnackbar from "src/components/common/SimpleSnackbar";
import PropTypes from "prop-types";
import { useMutate } from "restful-react";

export default function Post(props) {
  // hardcoded
  const DEFAULT_SUCCESS = "Call to API was successful";
  const DEFAULT_ERROR = "Call to API failed";

  // props
  const {
    uri,
    options,
    data,
    on_success,
    on_error,
    success_msg,
    error_msg,
    silent,
  } = props;

  const call_options = { path: encodeURI(uri), debounce: 200, ...options };

  const { mutate, loading, error } = useMutate(call_options);

  // call API upon component mount
  useEffect(() => {
    // call API
    mutate(data);

    // when I'm done
    // MUST: For POST, we call on_success here because caller may choose to set
    // its state as its on_success
    return () => {
      if (error && !!on_error) on_error(error);

      if (!!on_success) on_success();
    };
  }, [mutate, data, error, on_error, on_success]);

  if (!!silent) {
    // when waiting
    if (loading) {
      return <CircularProgress />;
    }

    // when error
    if (error) {
      return <SimpleSnackbar msg={!!error_msg ? error_msg : DEFAULT_ERROR} />;
    }

    // when success
    return (
      <SimpleSnackbar msg={!!success_msg ? success_msg : DEFAULT_SUCCESS} />
    );
  } else {
    return null;
  }
}

Post.propTypes = {
  uri: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  on_success: PropTypes.func,
  on_error: PropTypes.func,
  success_msg: PropTypes.string,
  error_msg: PropTypes.string,
  silent: PropTypes.bool,
};

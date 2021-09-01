import React, { useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";

import { useMutate } from "restful-react";
import GlobalContext from "src/context";
import NotFoundView from "src/views/errors/NotFoundView";
import CircularProgress from "@material-ui/core/CircularProgress";
import SimpleSnackbar from "src/components/common/SimpleSnackbar";

export default function Post(props) {
  const { api } = useContext(GlobalContext);
  const {
    resource,
    data,
    on_success,
    on_error,
    silent,
    success_msg,
    error_msg,
  } = props;
  const [notification, setNotification] = useState(
    "Done as you wish, my master"
  );

  // get user and api key
  const session = window.sessionStorage;
  const [user] = useState(session.getItem("user"));
  const [api_key] = useState(session.getItem("api_key"));

  // actual POST call
  const {
    mutate: create,
    loading,
    error,
  } = useMutate({
    verb: "POST",
    path: `${api}${resource}/`,
    headers: { Authorization: `ApiKey ${user}:${api_key}` },
  });

  // actual call to API
  const action = () => {
    // call API
    create(data).then(() => {
      if (!!on_success) on_success();

      if (!!success_msg) {
        setNotification(success_msg);
      } else {
        setNotification(`Call to ${resource} was a success`);
      }
    });

    // if in error
    if (error) {
      if (!!on_error) on_error();

      if (!!error_msg) {
        setNotification(error_msg);
      } else {
        setNotification(`Call to ${resource} failed`);
      }
    }
    return null;
  };

  // call API upon component mount
  useEffect(() => {
    action();
  }, [resource]);

  // if loading, wait
  if (loading) {
    if (!!!silent) {
      return <CircularProgress />;
    } else {
      return null;
    }
  }

  // after action, just show a message if any
  return <SimpleSnackbar msg={notification} />;
}

Post.propTypes = {
  resource: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  silent: PropTypes.bool,
  on_success: PropTypes.func,
  on_error: PropTypes.func,
  success_msg: PropTypes.string,
  error_msg: PropTypes.string,
};

import React, { useState } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useGet } from "restful-react";
import NotFoundView from "src/views/errors/NotFoundView";
import PropTypes from "prop-types";

export default function Fetch(props) {
  const { resource, render_data, mounted, silent } = props;

  // get user and api key
  const session = window.sessionStorage;
  const [user] = useState(session.getItem("user"));
  const [api_key] = useState(session.getItem("api_key"));

  // get data as caller want
  const { data, loading, error } = useGet({
    path: encodeURI(resource),
    debounce: 200,
    headers: { Authorization: `ApiKey ${user}:${api_key}` },
  });

  // if loading, wait
  if (loading) {
    if (!!!silent) {
      return <CircularProgress />;
    } else {
      return null;
    }
  }

  // if error
  if (error) return <NotFoundView />;

  // if caller is not mounted anymore, quit
  if (mounted && !mounted.current) return null;

  // everything is good, render
  return render_data(data);
}

Fetch.propTypes = {
  resource: PropTypes.string.isRequired,
  render_data: PropTypes.func.isRequired,
  mounted: PropTypes.object,
  silent: PropTypes.bool,
};

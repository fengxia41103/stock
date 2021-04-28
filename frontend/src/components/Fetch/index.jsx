import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useGet } from "restful-react";
import NotFoundView from "src/views/errors/NotFoundView";

export default function Fetch(props) {
  const { api, resource, render_data, mounted } = props;

  const { data, loading, error } = useGet({
    path: api + encodeURI(resource),
    debounce: 200,
  });

  if (loading) return <CircularProgress />;
  if (error) return <NotFoundView />;

  // if caller is not mounted anymore, quit
  if (mounted && !mounted.current) return null;

  // everything is good, render
  return render_data(data);
}

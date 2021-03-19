import React, { useState, useEffect } from "react";
import { isNull } from "lodash";
import AjaxContainer from "./ajax.jsx";

function Fetch(props) {
  const [data, setData] = useState(null);
  const [get_data, setGetData] = useState(false);
  const [controller] = useState(new AbortController());

  useEffect(() => {
    if (isNull(data)) {
      setGetData(true);
    }

    const cleanup = () => controller.abort();
    return cleanup;
  }, [data, controller]);

  const handleUpdate = data => {
    setData(data);
    setGetData(false);
  };

  const { api, resource, render_data } = props;

  // go get data
  if (get_data) {
    const query = api + encodeURI(resource);

    return (
      <AjaxContainer
        apiUrl={query}
        handleUpdate={handleUpdate}
        controller={controller}
      />
    );
  }

  // initial rendering
  if (isNull(data)) return null;

  // data is here
  return render_data(data);
}

export default Fetch;

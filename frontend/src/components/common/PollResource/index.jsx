import React, { useEffect, useRef, useState } from "react";

import PropTypes from "prop-types";
import ScaleLoader from "react-spinners/ScaleLoader";

import api from "@/api/client";

const PollResource = ({ resource, on_success, interval = 10, silent }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const fetchData = () => {
    api
      .get(encodeURI(resource))
      .then((r) => {
        setData(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, interval * 1000);
    return () => clearInterval(timerRef.current);
  }, [resource, interval]);

  if (loading) return silent ? null : <ScaleLoader loading />;
  return on_success ? on_success(data) : null;
};

PollResource.propTypes = {
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func,
  interval: PropTypes.number,
  silent: PropTypes.bool,
};

export default PollResource;

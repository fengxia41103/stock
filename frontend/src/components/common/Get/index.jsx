import React, { useEffect, useState } from "react";

import PropTypes from "prop-types";
import ScaleLoader from "react-spinners/ScaleLoader";

import api from "@/api/client";

const Get = ({ uri, on_success, on_error, silent }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get(encodeURI(uri))
      .then((r) => {
        if (!cancelled) {
          // Normalize paginated responses
          const d = r.data;
          const normalized = d && !Array.isArray(d) && Array.isArray(d.results) ? d.results : d;
          setData(normalized);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [uri]);

  if (loading) return silent ? null : <ScaleLoader loading />;
  if (error) return on_error ? on_error(error) : null;
  return on_success ? on_success(data) : null;
};

Get.propTypes = {
  uri: PropTypes.string.isRequired,
  on_success: PropTypes.func,
  on_error: PropTypes.func,
  silent: PropTypes.bool,
};

export default Get;

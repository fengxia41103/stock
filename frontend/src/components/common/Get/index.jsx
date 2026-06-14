import React from "react";
import PropTypes from "prop-types";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useQuery } from "@tanstack/react-query";

import api from "@/api/client";

const Get = ({ uri, on_success, on_error, silent }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["get", uri],
    queryFn: () =>
      api.get(encodeURI(uri)).then((r) => {
        const d = r.data;
        return d && !Array.isArray(d) && Array.isArray(d.results) ? d.results : d;
      }),
    enabled: !!uri,
  });

  if (isLoading) return silent ? null : <ScaleLoader loading />;
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

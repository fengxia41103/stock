import React from "react";
import PropTypes from "prop-types";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useQuery } from "@tanstack/react-query";

import api from "@/api/client";

const PollResource = ({ resource, on_success, interval = 10, silent }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["poll", resource],
    queryFn: () =>
      api.get(encodeURI(resource)).then((r) => {
        const d = r.data;
        return d && !Array.isArray(d) && Array.isArray(d.results) ? d.results : d;
      }),
    enabled: !!resource,
    refetchInterval: interval * 1000,
  });

  if (isLoading) return silent ? null : <ScaleLoader loading />;
  return on_success ? on_success(data) : null;
};

PollResource.propTypes = {
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func,
  interval: PropTypes.number,
  silent: PropTypes.bool,
};

export default PollResource;

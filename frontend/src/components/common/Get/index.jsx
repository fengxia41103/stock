import React from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useResource } from "@/api";

/**
 * Legacy data-fetching wrapper. Uses react-query under the hood.
 * Props: uri, children (render prop or elements), on_error, on_success
 */
const Get = ({ uri, children, on_error, on_success, silent, ...rest }) => {
  const enabled = !!uri && uri.length > 0;
  const { data, isLoading, error } = useResource(
    enabled ? uri : "__disabled__",
    enabled ? uri : "/__disabled__",
    { enabled }
  );

  if (!enabled) return null;
  if (isLoading && !silent) return <ScaleLoader loading />;
  if (isLoading && silent) return null;
  if (error && on_error) return on_error();
  if (!data) return null;

  // Support on_success callback pattern (used by ShowResource)
  if (on_success) {
    return on_success(data);
  }

  if (typeof children === "function") {
    return children(data);
  }

  // Clone children with data prop
  return React.Children.map(children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child, { data, ...rest })
      : child
  );
};

export default Get;

import React from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useResource } from "@/api";

/**
 * Legacy data-fetching wrapper. Uses react-query under the hood.
 * Props: uri, children (render prop), on_error
 */
const Get = ({ uri, children, on_error, ...rest }) => {
  const { data, isLoading, error } = useResource(uri, uri);

  if (isLoading) return <ScaleLoader loading />;
  if (error && on_error) return on_error();
  if (!data) return null;

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

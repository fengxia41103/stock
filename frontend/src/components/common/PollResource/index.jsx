import React, { useEffect, useState } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

/**
 * Legacy polling wrapper. Polls a URI every `interval` seconds.
 * Supports two usage patterns:
 *   1. <PollResource uri="/api/..." interval={5000}>{(data) => ...}</PollResource>
 *   2. <PollResource resource="/tasks/" on_success={renderFn} silent interval={3} />
 */
const PollResource = ({
  uri,
  resource,
  interval = 5000,
  on_success,
  silent,
  children,
  ...rest
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Support both `uri` (full URL) and `resource` (relative API path)
  const endpoint = uri || (resource ? `/api/v1${resource}` : null);

  // interval can be in seconds (legacy pattern) or milliseconds
  const intervalMs = interval < 100 ? interval * 1000 : interval;

  useEffect(() => {
    if (!endpoint) {
      setLoading(false);
      return;
    }

    let active = true;
    const fetchData = async () => {
      try {
        const key = localStorage.getItem("apiKey");
        const resp = await fetch(endpoint, {
          headers: key ? { Authorization: `ApiKey ${key}` } : {},
        });
        if (resp.ok && active) {
          const json = await resp.json();
          setData(json);
          setLoading(false);
        }
      } catch (e) {
        // silently retry
      }
    };

    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [endpoint, intervalMs]);

  if (loading) {
    if (silent) return null;
    return <ScaleLoader loading />;
  }
  if (!data) return null;

  // Pattern 2: on_success callback
  if (on_success) {
    return on_success(data);
  }

  // Pattern 1: children as function
  if (typeof children === "function") {
    return children(data);
  }

  return React.Children.map(children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child, { data, ...rest })
      : child,
  );
};

export default PollResource;

import React, { useEffect, useState } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

/**
 * Legacy polling wrapper. Polls a URI every `interval` ms.
 */
const PollResource = ({ uri, interval = 5000, children, ...rest }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const key = localStorage.getItem("apiKey");
        const resp = await fetch(uri, {
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
    const id = setInterval(fetchData, interval);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [uri, interval]);

  if (loading) return <ScaleLoader loading />;
  if (!data) return null;

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

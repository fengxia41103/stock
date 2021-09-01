import React, { useState } from "react";
import NotFoundView from "src/views/errors/NotFoundView";
import Post from "src/components/common/Post";
import PropTypes from "prop-types";

export default function UpdateResource(props) {
  const { resource } = props;

  // get user and api key
  const session = window.sessionStorage;
  const [user] = useState(session.getItem("user"));
  const [api_key] = useState(session.getItem("api_key"));

  const options = {
    verb: "PATCH",
    headers: { Authorization: `ApiKey ${user}:${api_key}` },
  };

  const on_error = error => {
    console.error(error);
  };

  // API is expecting trailing slash
  const resource_with_trailing_slash = resource.endsWith("/")
    ? resource
    : `${resource}/`;

  // everything is good, render
  return (
    <Post
      {...{ ...props, uri: resource_with_trailing_slash, options, on_error}}
    />
  );
}

UpdateResource.propTypes = {
  resource: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
};

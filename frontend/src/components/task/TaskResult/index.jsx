import PropTypes from "prop-types";
import React, { useState } from "react";

import { Box, Typography } from "@material-ui/core";

import ShowResource from "src/components/common/ShowResource";

export default function TaskResult(props) {
  // props
  const { task_id } = props;

  // states
  const [resource] = useState(`/task-results?task_id=${task_id}`);

  // render
  const render_data = (data) => {
    const { objects: results } = data;

    const result = results[0];

    return (
      <>
        <Typography variant="h3">{result?.task_name}</Typography>
        <Box mt={1}>
          <Typography component="pre">{result?.traceback}</Typography>
        </Box>
      </>
    );
  };

  return (
    <ShowResource
      {...{
        resource: resource,
        on_success: render_data,
        silent: true,
      }}
    />
  );
}

TaskResult.propTypes = {
  task_id: PropTypes.string.isRequired,
};

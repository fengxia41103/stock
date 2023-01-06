import {
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import { groupBy, map } from "lodash";
import PropTypes from "prop-types";
import React, { useState } from "react";

import NotificationsIcon from "@material-ui/icons/NotificationsOutlined";

import PollResource from "src/components/common/PollResource";
import TaskResult from "src/components/task/TaskResult";

export default function TaskNotificationIcon(props) {
  // props
  const { id } = props;
  const filter = id ? `?stocks=${id}` : "";

  // states
  const [resource] = useState(`/tasks/${filter}`);
  const [open, setOpen] = useState(false);

  // hooks

  // event handlers
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // render
  const render_data = (data) => {
    const count = data.meta.total_count;
    const tasks = data.objects;

    // nothing to show
    if (count === 0) return null;

    const tooltip = `There are ${count} tasks in progress`;
    const tasks_groupby_state = groupBy(tasks, (t) => t.state);

    const task_list = map(tasks_groupby_state, (tasks, state) => {
      // map tasks under a state
      const tmp = map(tasks, (task) => {
        const { stocks } = task;

        // map stock associated w/ this task
        const stocks_in_play = map(stocks, (d) => (
          <Chip key={d.id} label={d.symbol} />
        ));

        return (
          <Box key={task.id}>
            <Box mt={1}>
              <Stack direction="row">{stocks_in_play}</Stack>
            </Box>
            <Box mt={3}>
              <TaskResult {...{ task_id: task.id }} />
            </Box>
          </Box>
        );
      });

      return (
        <Box key={state}>
          <Typography variat="h4">{state}</Typography>
          <Divider />
          {tmp}
        </Box>
      );
    });

    return (
      <>
        <Tooltip title={tooltip}>
          <IconButton color="inherit" onClick={handleClickOpen}>
            <Badge badgeContent={count} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
          fullWidth={true}
        >
          <DialogTitle id="form-dialog-title">Tasks</DialogTitle>
          <DialogContent>
            <Stack>{task_list}</Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  return (
    <PollResource
      {...{
        resource: resource,
        on_success: render_data,
        silent: true,
        interval: 3,
      }}
    />
  );
}

TaskNotificationIcon.propTypes = {
  // optional, stock ID
  id: PropTypes.number,
};

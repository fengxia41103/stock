import clsx from "clsx";
import PropTypes from "prop-types";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Hidden,
  IconButton,
  makeStyles,
  Toolbar,
} from "@mui/material";
import Stack from "@mui/material/Stack";

import { DropdownMenu, Logo } from "@fengxia41103/storybook";

import LogoutIcon from "src/components/auth/LogoutIcon";
import AddNewStockDialog from "src/components/stock/AddNewStockDialog";
import UpdateAllStock from "src/components/stock/UpdateAllStock";
import TaskNotificationIcon from "src/components/task/TaskNotificationIcon";

const useStyles = makeStyles(() => ({
  root: {},
  avatar: {
    width: 60,
    height: 60,
  },
}));

export default function TopBar({ className, onMobileNavOpen, ...rest }) {
  const classes = useStyles();

  const actions = (
    <Stack alignItems="flex-start">
      <AddNewStockDialog />
      <UpdateAllStock />
    </Stack>
  );
  return (
    <AppBar className={clsx(classes.root, className)} elevation={0} {...rest}>
      <Toolbar>
        <RouterLink to="/">
          <Logo />
        </RouterLink>

        <Box flexGrow={1} />
        <DropdownMenu title="Management" content={actions} />
        <TaskNotificationIcon />
        <LogoutIcon />
        <Hidden lgUp>
          <IconButton color="inherit" onClick={onMobileNavOpen}>
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
}

TopBar.propTypes = {
  className: PropTypes.string,
  onMobileNavOpen: PropTypes.func,
};

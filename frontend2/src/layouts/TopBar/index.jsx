import clsx from "clsx";
import PropTypes from "prop-types";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, Hidden, IconButton, Toolbar } from "@mui/material";
import { Stack, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { DropdownMenu, Logo } from "@fengxia41103/storybook";

import LogoutIcon from "@Components/auth/LogoutIcon";
// import AddNewStockDialog from "@Components/stock/AddNewStockDialog";
// import UpdateAllStock from "@Components/stock/UpdateAllStock";
// import TaskNotificationIcon from "@Components/task/TaskNotificationIcon";

const myStyles = makeStyles(() => ({
  root: {},
  avatar: {
    width: 60,
    height: 60,
  },
}));

const TopBar = ({ className, onMobileNavOpen, ...rest }) => {
  const classes = myStyles();

  const actions = (
    <Stack alignItems="flex-start">
      <Button>sldjfldsjf</Button>
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
        <LogoutIcon />
        <Hidden lgUp>
          <IconButton color="inherit" onClick={onMobileNavOpen}>
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
};

TopBar.propTypes = {
  className: PropTypes.string,
  onMobileNavOpen: PropTypes.func,
};

export default TopBar;

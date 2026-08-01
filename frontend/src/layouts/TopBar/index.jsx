import PropTypes from "prop-types";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, Hidden, IconButton, Toolbar } from "@mui/material";
import { Button, Stack } from "@mui/material";

import { DropdownMenu, Logo } from "@/components/shared";

import LogoutIcon from "@Components/auth/LogoutIcon";
import AddNewStockDialog from "@Components/stock/AddNewStockDialog";
import TaskNotificationIcon from "@Components/task/TaskNotificationIcon";
import { useColorMode } from "@/main";

const TopBar = ({ className, onMobileNavOpen, ...rest }) => {
  const { mode, toggleColorMode } = useColorMode();

  const actions = (
    <Stack alignItems="flex-start">
      <AddNewStockDialog />
    </Stack>
  );

  return (
    <AppBar className={className} elevation={0} {...rest}>
      <Toolbar>
        <RouterLink to="/">
          <Logo />
        </RouterLink>
        <Box flexGrow={1} />
        <IconButton color="inherit" onClick={toggleColorMode}>
          {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
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
};

TopBar.propTypes = {
  className: PropTypes.string,
  onMobileNavOpen: PropTypes.func,
};

export default TopBar;

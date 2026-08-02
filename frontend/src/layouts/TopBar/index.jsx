import PropTypes from "prop-types";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  AppBar,
  Badge,
  Box,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

import { DropdownMenu, Logo } from "@/components/shared";
import { useTriggeredAlerts } from "@/api";
import { useMarketStatus } from "@/hooks/useMarketStatus";

import LogoutIcon from "@Components/auth/LogoutIcon";
import AddNewStockDialog from "@Components/stock/AddNewStockDialog";
import TaskNotificationIcon from "@Components/task/TaskNotificationIcon";
import api from "@/api/client";

const AlertsDrawer = ({ open, onClose, alerts }) => (
  <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 360 } }}>
    <Box p={2}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Alerts
      </Typography>
      {(!alerts || alerts.length === 0) ? (
        <Typography color="text.secondary">No triggered alerts</Typography>
      ) : (
        <List dense>
          {alerts.map((evt) => (
            <ListItem key={evt.id} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
              <ListItemText
                primary={evt.message}
                secondary={new Date(evt.triggered_at).toLocaleString()}
                primaryTypographyProps={{ fontSize: "0.85rem" }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  </Drawer>
);

const TopBar = ({ className, onMobileNavOpen, ...rest }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: triggeredAlerts } = useTriggeredAlerts();
  const { isOpen: marketOpen, label: marketLabel } = useMarketStatus();
  const alertCount = Array.isArray(triggeredAlerts) ? triggeredAlerts.length : 0;

  const handleOpenAlerts = () => {
    setDrawerOpen(true);
  };

  const handleCloseAlerts = () => {
    setDrawerOpen(false);
    if (alertCount > 0) {
      api.post("/alerts/mark-read/").catch(() => {});
    }
  };

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
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: marketOpen ? "#10b981" : "#ef4444",
            ml: 1.5,
          }}
          title={marketLabel}
        />
        <Box flexGrow={1} />
        <DropdownMenu title="Management" content={actions} />
        <IconButton color="inherit" onClick={handleOpenAlerts}>
          <Badge badgeContent={alertCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <TaskNotificationIcon />
        <LogoutIcon />
        <Hidden lgUp>
          <IconButton color="inherit" onClick={onMobileNavOpen}>
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>
      <AlertsDrawer open={drawerOpen} onClose={handleCloseAlerts} alerts={triggeredAlerts || []} />
    </AppBar>
  );
};

TopBar.propTypes = {
  className: PropTypes.string,
  onMobileNavOpen: PropTypes.func,
};

export default TopBar;

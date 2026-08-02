import PropTypes from "prop-types";
import React from "react";
import { useLocation } from "react-router-dom";

import {
  Box,
  Divider,
  Drawer,
  List,
  Typography,
  Avatar,
  Stack,
} from "@mui/material";

import NavItem from "@Layouts/NavBarItem";

const NavBar = (props) => {
  const { onMobileClose, isMobileMode, items } = props;

  const content = (
    <Box height="100%" display="flex" flexDirection="column">
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
          S
        </Avatar>
        <Typography variant="subtitle2" fontWeight={700}>
          Stock App
        </Typography>
      </Box>
      <Divider />
      <Box p={2}>
        <List>
          {items.map((item) => (
            <NavItem
              key={item.title}
              href={item.href}
              title={item.title}
              icon={item.icon}
            />
          ))}
        </List>
      </Box>
      <Box flexGrow={1} />
    </Box>
  );

  const mobileNavDrawer = (
    <Box sx={{ display: { xs: "block", sm: "block", md: "none", lg: "none" } }}>
      <Drawer
        anchor="left"
        PaperProps={{ sx: { width: 256 } }}
        onClose={onMobileClose}
        open={isMobileMode}
        variant="temporary"
      >
        {content}
      </Drawer>
    </Box>
  );
  const desktopNavDrawer = (
    <Box sx={{ display: { xs: "none", sm: "none", md: "none", lg: "block" } }}>
      <Drawer
        anchor="left"
        PaperProps={{
          sx: { width: 256, top: 64, height: "calc(100% - 64px)" },
        }}
        open={!isMobileMode}
        variant="persistent"
      >
        {content}
      </Drawer>
    </Box>
  );

  return (
    <>
      {desktopNavDrawer}
      {mobileNavDrawer}
    </>
  );
};

NavBar.propTypes = {
  onMobileClose: PropTypes.func,
  isMobileMode: PropTypes.bool,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string,
      icon: PropTypes.node,
      title: PropTypes.string,
    }),
  ),
};

NavBar.defaultProps = {
  onMobileClose: () => {},
  isMobileMode: false,
  items: [],
};

export default NavBar;

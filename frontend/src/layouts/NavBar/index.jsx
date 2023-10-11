import { faker } from "@faker-js/faker";
import PropTypes from "prop-types";
import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { Box, Divider, Drawer, Hidden, List } from "@mui/material";
import { makeStyles } from "@mui/styles";

import GlobalContext from "@/context";

import AuthenticatedUser from "@Components/user/AuthenticatedUser";

import NavItem from "@Layouts/NavBarItem";

const myStyles = makeStyles(() => ({
  mobileDrawer: {
    width: 256,
  },
  desktopDrawer: {
    width: 256,
    top: 64,
    height: "calc(100% - 64px)",
  },
}));

const NavBar = (props) => {
  const { onMobileClose, isMobileMode, items } = props;
  const { user: username } = useContext(GlobalContext);
  const user = {
    avatar: faker.image.animals(),
    name: username,
  };

  const classes = myStyles();
  const location = useLocation();

  const content = (
    <Box height="100%" display="flex" flexDirection="column">
      <AuthenticatedUser {...{ user }} />
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
        classes={{ paper: classes.mobileDrawer }}
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
        classes={{ paper: classes.desktopDrawer }}
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

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

const NavBar = ({ onMobileClose, openMobile, items }) => {
  const { user: username } = useContext(GlobalContext);
  const user = {
    avatar: faker.image.animals(),
    name: username,
  };

  const classes = myStyles();
  const location = useLocation();

  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname, openMobile, onMobileClose]);

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

  return (
    <>
      <Hidden lgUp>
        <Drawer
          anchor="left"
          classes={{ paper: classes.mobileDrawer }}
          onClose={onMobileClose}
          open={openMobile}
          variant="temporary"
        >
          {content}
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        <Drawer
          anchor="left"
          classes={{ paper: classes.desktopDrawer }}
          open
          variant="persistent"
        >
          {content}
        </Drawer>
      </Hidden>
    </>
  );
};

NavBar.propTypes = {
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool,
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
  openMobile: false,
  items: [],
};

export default NavBar;

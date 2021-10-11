import {
  Box,
  Divider,
  Drawer,
  Hidden,
  List,
  makeStyles,
} from "@material-ui/core";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

import AuthenticatedUser from "src/components/user/AuthenticatedUser";

import NavItem from "./NavItem";

const user = {
  avatar: "/static/images/avatars/avatar_6.png",
  jobTitle: "Senior Developer",
  name: "Katarina Smith",
};

const useStyles = makeStyles(() => ({
  mobileDrawer: {
    width: 256,
  },
  desktopDrawer: {
    width: 256,
    top: 64,
    height: "calc(100% - 64px)",
  },
}));

export default function NavBar({ onMobileClose, openMobile, items }) {
  const classes = useStyles();
  const location = useLocation();

  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const content = (
    <Box height="100%" display="flex" flexDirection="column">
      <AuthenticatedUser {...{ user }} />
      <Divider />
      <Box p={2}>
        <List>
          {items.map((item) => (
            <NavItem
              href={item.href}
              key={item.title}
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
}

NavBar.propTypes = {
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool,
  items: PropTypes.array,
};

NavBar.defaultProps = {
  onMobileClose: () => {},
  openMobile: false,
  items: [],
};

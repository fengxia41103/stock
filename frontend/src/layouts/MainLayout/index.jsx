import PropTypes from "prop-types";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import { Box } from "@mui/material";
import { makeStyles } from "@mui/styles";

import NavBar from "@Layouts/NavBar";
import TopBar from "@Layouts/TopBar";

const myStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    display: "flex",
    height: "100%",
    overflow: "hidden",
    width: "100%",
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
  },
  wrapper: {
    display: "flex",
    flex: "1 1 auto",
    overflow: "hidden",
    paddingTop: 64,
    [theme.breakpoints.up("lg")]: {
      paddingLeft: 256,
    },
  },
  contentContainer: {
    display: "flex",
    flex: "1 1 auto",
    overflow: "hidden",
  },
  content: {
    flex: "1 1 auto",
    height: "100%",
    overflow: "auto",
  },
}));

const MainLayout = (props) => {
  const { sideNavs } = props;
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const classes = myStyles();

  return (
    <Box className={classes.root}>
      <TopBar onMobileNavOpen={() => setMobileNavOpen(true)} />
      <NavBar
        onMobileClose={() => setMobileNavOpen(false)}
        openMobile={isMobileNavOpen}
        items={sideNavs}
      />
      <Box className={classes.wrapper}>
        <Box className={classes.contentContainer}>
          <Box className={classes.content}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

MainLayout.propTypes = {
  sideNavs: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string,
      icon: PropTypes.node,
      title: PropTypes.string,
    }),
  ).isRequired,
};

export default MainLayout;

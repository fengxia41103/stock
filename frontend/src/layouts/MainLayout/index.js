import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { makeStyles, Box } from "@material-ui/core";
import NavBar from "./NavBar";
import TopBar from "./TopBar";

const useStyles = makeStyles((theme) => ({
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

export default function MainLayout(props) {
  const classes = useStyles();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <Box className={classes.root}>
      <TopBar onMobileNavOpen={() => setMobileNavOpen(true)} />
      <NavBar
        onMobileClose={() => setMobileNavOpen(false)}
        openMobile={isMobileNavOpen}
        items={props.sideNavs}
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
}

import PropTypes from "prop-types";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import { Box, Toolbar } from "@mui/material";

import NavBar from "@Layouts/NavBar";
import TopBar from "@Layouts/TopBar";

const DRAWER_WIDTH = 256;

const MainLayout = (props) => {
  const { sideNavs } = props;
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      <TopBar onMobileNavOpen={() => setMobileNavOpen(!isMobileNavOpen)} />
      <NavBar
        onMobileClose={() => setMobileNavOpen(false)}
        isMobileMode={isMobileNavOpen}
        items={sideNavs}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: "auto",
          minHeight: "100vh",
          ml: { lg: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar />
        <Outlet />
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

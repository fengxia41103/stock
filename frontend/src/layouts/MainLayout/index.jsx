import PropTypes from "prop-types";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import { Box } from "@mui/material";

import NavBar from "@Layouts/NavBar";
import TopBar from "@Layouts/TopBar";


const MainLayout = (props) => {
  const { sideNavs } = props;
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  

  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden", width: "100%" }}>
      <TopBar onMobileNavOpen={() => setMobileNavOpen(!isMobileNavOpen)} />
      <NavBar
        onMobileClose={() => setMobileNavOpen(false)}
        isMobileMode={isMobileNavOpen}
        items={sideNavs}
      />
      <Box sx={{ display: "flex", flex: "1 1 auto", overflow: "hidden", pt: "64px" }}>
        <Box sx={{ display: "flex", flex: "1 1 auto", overflow: "hidden" }}>
          <Box sx={{ flex: "1 1 auto", height: "100%", overflow: "auto" }}>
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

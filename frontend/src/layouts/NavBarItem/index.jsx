import PropTypes from "prop-types";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

import { Button, ListItem } from "@mui/material";

const NavItem = (props) => {
  const { href, icon, title } = props;
  const location = useLocation();

  // Check if this nav item is active
  const isActive =
    href === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(href);

  return (
    <ListItem sx={{ display: "flex", py: 0.5 }} disableGutters>
      <Button
        sx={{
          color: isActive ? "primary.main" : "text.secondary",
          fontWeight: isActive ? "bold" : "medium",
          justifyContent: "flex-start",
          textTransform: "none",
          width: "100%",
          backgroundColor: isActive ? "action.selected" : "transparent",
          borderLeft: isActive ? "3px solid" : "3px solid transparent",
          borderColor: isActive ? "primary.main" : "transparent",
          borderRadius: 0,
          pl: 2,
          "&:hover": {
            backgroundColor: isActive ? "action.selected" : "action.hover",
          },
        }}
        component={NavLink}
        to={href}
      >
        {icon && (
          <span style={{ marginRight: 10, display: "flex", alignItems: "center" }}>
            {icon}
          </span>
        )}
        <span>{title}</span>
      </Button>
    </ListItem>
  );
};

NavItem.propTypes = {
  href: PropTypes.string,
  icon: PropTypes.node,
  title: PropTypes.string,
};

export default NavItem;

import { Button, ListItem } from "@mui/material";

import PropTypes from "prop-types";
import React from "react";
import { NavLink } from "react-router-dom";

const NavItem = ({ className, href, icon: Icon, title, ...rest }) => {
  return (
    <ListItem sx={{ display: "flex", py: 0 }} disableGutters {...rest}>
      <Button
        sx={{
          color: "text.secondary",
          fontWeight: "medium",
          justifyContent: "flex-start",
          textTransform: "none",
          width: "100%",
        }}
        component={NavLink}
        to={href}
      >
        {Icon && <Icon style={{ marginRight: 8 }} size="20" />}
        <span>{title}</span>
      </Button>
    </ListItem>
  );
};

NavItem.propTypes = {
  className: PropTypes.string,
  href: PropTypes.string,
  icon: PropTypes.node,
  title: PropTypes.string,
};

export default NavItem;

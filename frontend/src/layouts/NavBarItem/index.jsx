import PropTypes from "prop-types";
import React from "react";
import { NavLink } from "react-router-dom";

import { Button, Icon, ListItem } from "@mui/material";

const NavItem = (props) => {
  const { href, icon, title } = props;

  return (
    <ListItem sx={{ display: "flex", py: 0 }} disableGutters>
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
        {icon && <Icon style={{ marginRight: 8 }} size="20" />}
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

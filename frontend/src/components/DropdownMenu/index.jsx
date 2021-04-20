import React, { useState } from "react";

import { Box, Button, Menu } from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";

export default function DropdownMenu(props) {
  const { content } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <SettingsIcon />
        Options
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Box p={3}>{content}</Box>
      </Menu>
    </Box>
  );
}

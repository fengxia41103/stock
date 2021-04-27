import React, { useState } from "react";

import { Box, IconButton, Menu, Typography } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { isNull, isUndefined } from "lodash";

export default function DropdownMenu(props) {
  const { title, content, keep_open } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (isNull(content)) return null;

  return (
    <Box>
      <IconButton
        aria-controls="simple-menu"
        aria-haspopup="true"
        aria-label="options"
        onClick={handleClick}
      >
        <MoreVertIcon />
        <Typography variant={"body2"}>
          {isUndefined(title) ? null : title}
        </Typography>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Box p={3} onClick={isUndefined(keep_open) ? handleClose : null}>
          {content}
        </Box>
      </Menu>
    </Box>
  );
}

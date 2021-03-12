import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Link } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

function MenuBar() {
  const { id } = useParams();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const mappings = [
    {
      url: "nav",
      text: "Net Asset Value",
    },
    {
      url: "balance",
      text: "Balance Sheet",
    },
    {
      url: "income",
      text: "Income Statement",
    },
    {
      url: "cash",
      text: "Cash Flow Statement",
    },
  ];
  const links = mappings.map(x => {
    const url = `/app/stocks/${id}/${x.url}`;
    return (
      <MenuItem key={x.url} onClick={handleClose}>
        <Link href={url}>{x.text}</Link>
      </MenuItem>
    );
  });

  return (
    <Box
      display="flex"
      justifyContent="flex-end"
      mb={3}
      borderBottom={1}
      borderColor="secondary.main"
    >
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        Financial Statements
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {links}
      </Menu>
    </Box>
  );
}

export default MenuBar;

import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Link, Grid } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

function MenuBar(props) {
  const { id } = useParams();
  const { title, items } = props;

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const links = items.map(x => {
    const url = `/app/stocks/${id}/${x.url}`;

    return (
      <MenuItem key={x.url} onClick={handleClose}>
        <Link href={url}>{x.text}</Link>
      </MenuItem>
    );
  });

  return (
    <Grid item lg={2} sm={6} xs={12}>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        {title}
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {links}
      </Menu>
    </Grid>
  );
}

export default MenuBar;

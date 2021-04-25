import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Link, Grid } from "@material-ui/core";
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
    const url = `${x.url}`;

    return (
      <MenuItem key={x.url} onClick={handleClose}>
        <Link href={url}>{x.text}</Link>
      </MenuItem>
    );
  });

  return (
    <Grid item xs>
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

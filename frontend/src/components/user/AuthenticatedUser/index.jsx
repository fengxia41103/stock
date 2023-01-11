import PropTypes from "prop-types";
import React from "react";

import { Avatar, Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  avatar: {
    cursor: "pointer",
    width: 64,
    height: 64,
  },
}));

export default function AuthenticatedUser(props) {
  const classes = useStyles();
  const { user } = props;

  return (
    <Box alignItems="center" display="flex" flexDirection="column" p={2}>
      <Avatar className={classes.avatar} src={user.avatar} />
      <Typography className={classes.name} color="textPrimary" variant="h5">
        Welcome back
      </Typography>
      <Typography color="secondary" variant="body2">
        {user.name}
      </Typography>
    </Box>
  );
}

AuthenticatedUser.propTypes = {
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool,
  items: PropTypes.array,
};

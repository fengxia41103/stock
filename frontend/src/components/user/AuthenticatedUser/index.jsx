import { Avatar, Box, Typography, makeStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

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
      <Avatar
        className={classes.avatar}
        component={RouterLink}
        src={user.avatar}
        to="/app/account"
      />
      <Typography className={classes.name} color="textPrimary" variant="h5">
        {user.name}
      </Typography>
      <Typography color="secondary" variant="body2">
        {user.jobTitle}
      </Typography>
    </Box>
  );
}

AuthenticatedUser.propTypes = {
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool,
  items: PropTypes.array,
};

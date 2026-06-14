import PropTypes from "prop-types";
import React from "react";

import { Avatar, Box, Typography } from "@mui/material";

const AuthenticatedUser = (props) => {
  const { user } = props;

  return (
    <Box alignItems="center" display="flex" flexDirection="column" p={2}>
      <Avatar sx={{ width: 60, height: 60 }} src={user.avatar} />
      <Typography color="textPrimary" variant="h5">
        Welcome back
      </Typography>
      <Typography color="secondary" variant="body2">
        {user.name}
      </Typography>
    </Box>
  );
};

AuthenticatedUser.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.node,
  }),
};

export default AuthenticatedUser;

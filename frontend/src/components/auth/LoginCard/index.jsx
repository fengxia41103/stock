import PropTypes from "prop-types";
import React, { useState } from "react";

import { Face, Fingerprint } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Link,
  TextField,
  Typography,
} from "@mui/material";

import LoginButton from "@Components/auth/LoginButton";

const LoginCard = (props) => {
  // props
  const { resource, on_success, on_error, error } = props;

  // states
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");

  // event handlers
  const on_user_change = (event) => setUser(event.target.value);
  const on_pwd_change = (event) => setPwd(event.target.value);

  // render
  return (
    <Card>
      <CardHeader
        title={<Typography variant="h3">Welcome to MyStock</Typography>}
      />

      <CardContent>
        <Grid container spacing={1} alignItems="flex-end">
          <Grid item lg={1} sm={2} xs={3}>
            <Face />
          </Grid>
          <Grid item lg={11} sm={10} xs={9}>
            <TextField
              fullWidth
              autoFocus
              required
              id="username"
              label="Username"
              value={user}
              onChange={on_user_change}
            />
          </Grid>

          <Grid item lg={1} sm={2} xs={3}>
            <Fingerprint />
          </Grid>
          <Grid item lg={11} sm={10} xs={9}>
            <TextField
              fullWidth
              required
              id="password"
              label="Password"
              type="password"
              value={pwd}
              onChange={on_pwd_change}
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Link href="/registration">Signup</Link>
            <LoginButton
              {...{
                username: user,
                password: pwd,
                resource,
                on_success,
                on_error,
              }}
            />
          </Grid>
        </Box>
        <Box mt={1}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

LoginCard.propTypes = {
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func.isRequired,
  on_error: PropTypes.func,
  error: PropTypes.string,
};

export default LoginCard;

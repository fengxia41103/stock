import React, { useState } from "react";
import {
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
} from "@material-ui/core";
import { Face, Fingerprint } from "@material-ui/icons";
import PropTypes from "prop-types";
import LoginButton from "src/components/auth/LoginButton";

export default function LoginCard(props) {
  // props
  const { resource, on_success, on_error } = props;

  // states
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");

  // event handlers
  const on_user_change = (event) => setUser(event.target.value);
  const on_pwd_change = (event) => setPwd(event.target.value);

  // render
  return (
    <Card>
      <CardContent>
        <Grid container spacing={1} alignItems="flex-end">
          <Grid item lg={1} sm={2} xs={3}>
            <Face />
          </Grid>
          <Grid item lg={11} sm={10} xs={9}>
            <TextField
              id="username"
              label="Username"
              value={user}
              fullWidth
              autoFocus
              required
              onChange={on_user_change}
            />
          </Grid>

          <Grid item lg={1} sm={2} xs={3}>
            <Fingerprint />
          </Grid>
          <Grid item lg={11} sm={10} xs={9}>
            <TextField
              id="password"
              label="Password"
              type="password"
              value={pwd}
              fullWidth
              required
              onChange={on_pwd_change}
            />
          </Grid>
        </Grid>
      </CardContent>

      <CardActions>
        <Grid
          container
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Button
            disableFocusRipple
            disableRipple
            variant="text"
            color="primary"
          >
            Forgot password ?
          </Button>

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
      </CardActions>
    </Card>
  );
}

LoginCard.propTypes = {
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func.isRequired,
  on_error: PropTypes.func,
};

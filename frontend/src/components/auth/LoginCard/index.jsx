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
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export default function LoginCard(props) {
  // props
  const { resource, on_success, on_error } = props;

  // states
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");

  // event handlers
  const on_user_change = event => setUser(event.target.value);
  const on_pwd_change = event => setPwd(event.target.value);
  const on_login = event => {
    event.preventDefault();
    const credentials = { username: user, password: pwd };

    // Simple POST request with a JSON body using fetch
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-cache",
      body: JSON.stringify(credentials),
    };
    return fetch(resource, options)
      .then(response => response.json())
      .then(resp => {
        if (!!on_success) on_success(resp);
      })
      .catch(error => {
        if (!!on_error) on_error(error);
      });
  };

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

          <Button variant="contained" color="primary" onClick={on_login}>
            Login
          </Button>
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

import React, { useState, useContext } from "react";
import {
  Paper,
  makeStyles,
  Box,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  CardActions,
} from "@material-ui/core";
import { Face, Fingerprint } from "@material-ui/icons";
import clsx from "clsx";
import GlobalContext from "src/context";
import { Redirect } from "react-router-dom";

const useStyles = makeStyles(theme => ({
  card: {
    marginTop: "37vh",
  },
  paper: {
    padding: theme.spacing(3),
    backgroundImage: `url(${"/static/images/auth.jpeg"})`,
    height: "100vh",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
  },
}));

export default function LoginView() {
  const classes = useStyles();
  const [user, setUser] = useState("fengxia");
  const [pwd, setPwd] = useState("natalie");
  const { api, set_auth } = useContext(GlobalContext);
  const [resource] = useState(`/auth`);

  const on_user_change = event => setUser(event.target.value);
  const on_pwd_change = event => setPwd(event.target.value);
  const on_submit = event => {
    const uri = `${api}${resource}/login/`;
    const credentials = { username: user, password: pwd };

    // Simple POST request with a JSON body using fetch
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-cache",
      body: JSON.stringify(credentials),
    };
    fetch(uri, options)
      .then(response => response.json())
      .then(data => {
        // if login success, save api key
        if (data.success) {
          set_auth(user, data.data);
        }
      });
  };

  return (
    <Paper className={clsx(classes.paper)}>
      <Grid container justifyContent="center" className={classes.margin}>
        <Grid item lg={6} sm={6} xs={12}></Grid>
        <Grid item lg={4} sm={5} xs={12}>
          <Card className={clsx(classes.card)}>
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
                <Grid item xs={12}>
                  <Box mt={2}>
                    <FormControlLabel
                      control={<Checkbox color="primary" />}
                      label="Remember me"
                    />
                  </Box>
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

                <Button variant="contained" color="primary" onClick={on_submit}>
                  Login
                </Button>
              </Grid>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
}

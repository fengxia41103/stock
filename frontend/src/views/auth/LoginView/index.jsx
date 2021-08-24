import React, { useState, useContext } from "react";
import {
  Paper,
  makeStyles,
  Box,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Card,
  CardContent,
  CardActions,
} from "@material-ui/core";
import { Face, Fingerprint } from "@material-ui/icons";
import clsx from "clsx";
import GlobalContext from "src/context";
import { useNavigate } from "react-router-dom";

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
  const { api, set_auth } = useContext(GlobalContext);
  const classes = useStyles();
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [resource] = useState(`/auth/login/`);
  const navigate = useNavigate();

  const on_user_change = event => setUser(event.target.value);
  const on_pwd_change = event => setPwd(event.target.value);

  // call to login
  const login = () => {
    const uri = `${api}${resource}`;
    const credentials = { username: user, password: pwd };

    // Simple POST request with a JSON body using fetch
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-cache",
      body: JSON.stringify(credentials),
    };
    return fetch(uri, options).then(response => response.json());
  };

  // call login handler
  const on_submit = async e => {
    e.preventDefault();
    const resp = await login({ user, pwd });

    if (resp.success) {
      set_auth(user, resp.data);
      navigate("/");
    }
  };

  // render
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

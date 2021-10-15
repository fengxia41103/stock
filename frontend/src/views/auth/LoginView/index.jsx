import { Paper, makeStyles, Box, Grid } from "@material-ui/core";
import clsx from "clsx";
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import LoginCard from "src/components/auth/LoginCard";
import GlobalContext from "src/context";

const useStyles = makeStyles((theme) => ({
  card: {
    marginTop: "30vh",
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
  const { api } = useContext(GlobalContext);
  const classes = useStyles();
  const navigate = useNavigate();

  // states
  const [resource] = useState("/auth/login/");
  const [error, setError] = useState();

  // callbacks
  const session = window.sessionStorage;
  const save_auth = (resp) => {
    session.setItem("user", resp.data.user);
    session.setItem("api_key", resp.data.key);
  };

  // you decide what to do if logged in
  const on_success = (resp) => {
    if (resp.success) {
      // save auth somewhere for all calls
      save_auth(resp);

      // go to a landing page
      navigate("/", true);
    } else {
      setError(resp.message);
    }
  };

  // render
  return (
    <Paper className={clsx(classes.paper)}>
      <Grid container justifyContent="center" className={classes.margin}>
        <Grid item lg={6} sm={6} xs={12}></Grid>
        <Grid item lg={4} sm={5} xs={12}>
          <Box className={clsx(classes.card)}>
            <LoginCard
              {...{ resource: `${api}${resource}`, on_success, error }}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

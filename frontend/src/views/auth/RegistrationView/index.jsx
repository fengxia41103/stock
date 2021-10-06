import { Paper, makeStyles, Box, Grid, Typography } from "@material-ui/core";
import clsx from "clsx";
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import RegistrationCard from "src/components/auth/RegistrationCard";
import GlobalContext from "src/context";

const useStyles = makeStyles((theme) => ({
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

export default function RegistrationView() {
  const { api } = useContext(GlobalContext);
  const classes = useStyles();
  const navigate = useNavigate();

  // states
  const [resource] = useState("/users");
  const [error, setError] = useState();

  // you decide what to do if logged in
  const on_success = (resp) => {
    if (resp.success) {
      // go to a landing page
      navigate("/", true);
    }
  };

  const on_error = (err) => {
    setError(err.data.error);
    console.error(err);
  };

  // render
  return (
    <Paper className={clsx(classes.paper)}>
      <Grid container justifyContent="center" className={classes.margin}>
        <Grid item lg={6} sm={6} xs={12}></Grid>
        <Grid item lg={4} sm={5} xs={12}>
          <Box className={clsx(classes.card)}>
            <RegistrationCard
              {...{ resource: `${api}${resource}`, on_success, on_error }}
            />
            <Box mt={2}>
              <Typography variant="body1" color="error">
                {error}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

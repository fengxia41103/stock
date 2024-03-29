import clsx from "clsx";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Grid, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";

import GlobalContext from "@/context";

import RegistrationCard from "@Components/auth/RegistrationCard";

const myStyles = makeStyles((theme) => ({
  card: {
    marginTop: "30vh",
  },
  paper: {
    padding: theme.spacing(3),
    backgroundImage: `url(${"/static/images/DSC_1379.JPG"})`,
    height: "100vh",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
  },
}));

const RegistrationView = () => {
  const { api } = useContext(GlobalContext);

  // const { api } = useContext(GlobalContext);
  const classes = myStyles();
  const navigate = useNavigate();

  // states
  const [resource] = useState("/users/");

  // you decide what to do if logged in
  const on_success = () => {
    // go to a landing page
    navigate("/", true);
  };

  // render
  return (
    <Paper className={clsx(classes.paper)}>
      <Grid container justifyContent="center" className={classes.margin}>
        <Grid item lg={6} sm={6} xs={12} />
        <Grid item lg={4} sm={5} xs={12}>
          <Box className={clsx(classes.card)}>
            <RegistrationCard
              {...{ resource: `${api}${resource}`, on_success }}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RegistrationView;

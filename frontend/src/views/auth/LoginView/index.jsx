import clsx from "clsx";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

import GlobalContext from "@/context";

import LoginCard from "@Components/auth/LoginCard";

const MyBox = styled(Box)({
  marginTop: "30vh",
});

const MyPaper = styled(Paper)((theme) => ({
  padding: theme.spacing,
  backgroundImage: `url(${"/static/images/auth.jpeg"})`,
  height: "100vh",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center center",
  backgroundSize: "cover",
  backgroundAttachment: "fixed",
}));

const LoginView = () => {
  const { api } = useContext(GlobalContext);
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
      navigate("/", { replace: true });
    } else {
      setError(resp.message);
    }
  };

  // render
  return (
    <MyPaper>
      <Grid container justifyContent="center">
        <Grid item lg={6} sm={6} xs={12} />
        <Grid item lg={4} sm={5} xs={12}>
          <MyBox>
            <LoginCard
              {...{ resource: `${api}${resource}`, on_success, error }}
            />
          </MyBox>
        </Grid>
      </Grid>
    </MyPaper>
  );
};

export default LoginView;

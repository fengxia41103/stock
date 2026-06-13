import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

import LoginCard from "@Components/auth/LoginCard";

const MyPaper = styled(Paper)({
  height: "100vh",
  backgroundImage: 'url("/static/images/auth.jpeg")',
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center center",
  backgroundSize: "cover",
  backgroundAttachment: "fixed",
});

const LoginView = () => {
  const navigate = useNavigate();
  const [error, setError] = useState();

  const on_success = (resp) => {
    if (resp.success) {
      navigate("/", { replace: true });
    } else {
      setError(resp.message);
    }
  };

  return (
    <MyPaper>
      <Grid container justifyContent="center">
        <Grid item lg={6} sm={6} xs={12} />
        <Grid item lg={4} sm={5} xs={12}>
          <Box sx={{ marginTop: "30vh" }}>
            <LoginCard on_success={on_success} error={error} />
          </Box>
        </Grid>
      </Grid>
    </MyPaper>
  );
};

export default LoginView;

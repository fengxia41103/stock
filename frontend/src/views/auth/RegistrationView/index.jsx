import React from "react";
import { useNavigate } from "react-router-dom";

import { Box, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

import RegistrationCard from "@Components/auth/RegistrationCard";

const MyPaper = styled(Paper)({
  height: "100vh",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center center",
  backgroundSize: "cover",
  backgroundAttachment: "fixed",
});

const RegistrationView = () => {
  const navigate = useNavigate();

  const on_success = () => navigate("/", { replace: true });

  return (
    <MyPaper>
      <Grid container justifyContent="center">
        <Grid item lg={6} sm={6} xs={12} />
        <Grid item lg={4} sm={5} xs={12}>
          <Box sx={{ marginTop: "30vh" }}>
            <RegistrationCard on_success={on_success} />
          </Box>
        </Grid>
      </Grid>
    </MyPaper>
  );
};

export default RegistrationView;

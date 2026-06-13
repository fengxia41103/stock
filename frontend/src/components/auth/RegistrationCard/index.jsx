import PropTypes from "prop-types";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Face } from "@mui/icons-material";
import { Box, Button, Card, CardContent, CardHeader, Grid, Link, TextField, Typography } from "@mui/material";

import api from "@/api/client";

const RegistrationCard = ({ on_success, on_error }) => {
  const [error, setError] = useState();
  const { handleSubmit, control } = useForm();

  const onSubmit = (data) => {
    const username = `${data.firstName}.${data.lastName}`;
    api.post("/users/", { ...data, username })
      .then(() => { if (on_success) on_success(); })
      .catch((e) => {
        setError(e.response?.data?.error || "Registration failed");
        if (on_error) on_error(e);
      });
  };

  return (
    <Card>
      <CardHeader title={<Grid container direction="row" alignItems="center"><Face /><Typography variant="h3">Join Us</Typography></Grid>} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Box padding={1}>
            <Controller name="firstName" control={control} defaultValue="" rules={{ required: "First name required" }}
              render={({ field: { onChange, value }, fieldState: { error: e } }) => (
                <TextField required fullWidth autoFocus label="First Name" variant="standard" value={value} onChange={onChange} error={!!e} helperText={e?.message} />
              )} />
            <Controller name="lastName" control={control} defaultValue="" rules={{ required: "Last name required" }}
              render={({ field: { onChange, value }, fieldState: { error: e } }) => (
                <TextField required fullWidth label="Last Name" variant="standard" value={value} onChange={onChange} error={!!e} helperText={e?.message} />
              )} />
            <Controller name="email" control={control} defaultValue="" rules={{ required: "Email required" }}
              render={({ field: { onChange, value }, fieldState: { error: e } }) => (
                <TextField fullWidth required label="Email" variant="standard" value={value} onChange={onChange} error={!!e} helperText={e?.message} type="email" />
              )} />
            <Controller name="password" control={control} defaultValue="" rules={{ required: "Password required" }}
              render={({ field: { onChange, value }, fieldState: { error: e } }) => (
                <TextField required fullWidth label="Password" variant="standard" value={value} onChange={onChange} error={!!e} helperText={e?.message} type="password" />
              )} />
          </Box>
          <Box mt={3}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Link href="/login">Already has an account</Link>
              <Button type="submit" color="primary" variant="contained">Signup</Button>
            </Grid>
          </Box>
          {error && <Box mt={1}><Typography color="error">{error}</Typography></Box>}
        </CardContent>
      </form>
    </Card>
  );
};

RegistrationCard.propTypes = {
  on_success: PropTypes.func.isRequired,
  on_error: PropTypes.func,
};

export default RegistrationCard;

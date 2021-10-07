import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Link,
  Typography,
} from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutate } from "restful-react";
import { Face } from "@material-ui/icons";

export default function RegistrationCard(props) {
  // props
  const { resource, on_success, on_error } = props;

  // hooks
  const { mutate: create } = useMutate({
    verb: "POST",
    path: resource,
  });

  const { handleSubmit, control } = useForm();
  const onSubmit = (data) => {
    const username = `${data.firstName}.${data.lastName}`;
    create({
      ...{
        ...data,
        username,
      },
    })
      .then(() => {
        if (on_success) on_success();
      })
      .catch((error) => {
        if (on_error) on_error();
      });
  };

  // render
  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h3">
            <Face />
            Come to Join Us
          </Typography>
        }
      ></CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Box mt={1}>
            <Controller
              name="firstName"
              control={control}
              defaultValue=""
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <TextField
                  required
                  label="First Name"
                  variant="standard"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                />
              )}
              rules={{ required: "First name required" }}
            />
            <Controller
              name="lastName"
              control={control}
              defaultValue=""
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <TextField
                  required
                  label="Last Name"
                  variant="standard"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                />
              )}
              rules={{ required: "Last name required" }}
            />
          </Box>

          <Box mt={2}>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <TextField
                  label="Email"
                  variant="standard"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                  type="email"
                />
              )}
              rules={{ required: "Email required" }}
            />
            <Controller
              name="password"
              control={control}
              defaultValue=""
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <TextField
                  required
                  label="Password"
                  variant="standard"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  helperText={error ? error.message : null}
                  type="password"
                />
              )}
              rules={{ required: "Password required" }}
            />
          </Box>
          <Box mt={3}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Link href="/login">Already has an account</Link>
              <Button type="submit" color="primary" variant="contained">
                Signup
              </Button>
            </Grid>
          </Box>
        </CardContent>
      </form>
    </Card>
  );
}

RegistrationCard.propTypes = {
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func.isRequired,
  on_error: PropTypes.func,
};

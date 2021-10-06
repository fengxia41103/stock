import {
  Button,
  TextField,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
} from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutate } from "restful-react";

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
        title={<Typography variant="h3">Welcome to MyStock</Typography>}
      ></CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Controller
            name="firstName"
            control={control}
            defaultValue=""
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextField
                label="First Name"
                variant="filled"
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
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextField
                label="Last Name"
                variant="filled"
                value={value}
                onChange={onChange}
                error={!!error}
                helperText={error ? error.message : null}
              />
            )}
            rules={{ required: "Last name required" }}
          />
          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextField
                label="Email"
                variant="filled"
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
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextField
                label="Password"
                variant="filled"
                value={value}
                onChange={onChange}
                error={!!error}
                helperText={error ? error.message : null}
                type="password"
              />
            )}
            rules={{ required: "Password required" }}
          />
        </CardContent>

        <CardActions>
          <Button type="submit" variant="contained" color="primary">
            Signup
          </Button>
        </CardActions>
      </form>
    </Card>
  );
}

RegistrationCard.propTypes = {
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func.isRequired,
  on_error: PropTypes.func,
};

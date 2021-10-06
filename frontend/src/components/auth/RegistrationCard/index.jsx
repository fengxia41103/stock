import {
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
} from "@material-ui/core";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutate } from "restful-react";

import GlobalContext from "src/context";

export default function RegistrationCard() {
  const { api } = useContext(GlobalContext);
  const [resource] = useState("/users");

  const { mutate: create } = useMutate({
    verb: "POST",
    path: `${api}${resource}/?`,
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
      .then((resp) => console.log(resp))
      .catch((error) => {
        console.error(error);
      });
  };

  // render
  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
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
          <div>
            <Button type="submit" variant="contained" color="primary">
              Signup
            </Button>
          </div>
        </form>
      </CardContent>

      <CardActions></CardActions>
    </Card>
  );
}

RegistrationCard.propTypes = {
  resource: PropTypes.string.isRequired,
  on_success: PropTypes.func.isRequired,
  on_error: PropTypes.func,
};

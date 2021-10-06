import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Typography,
} from "@material-ui/core";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutate } from "restful-react";

import GlobalContext from "src/context";

export default function RegistrationCard() {
  // context
  const { api } = useContext(GlobalContext);

  // states
  const [resource] = useState("/users");
  const [error, setError] = useState("");

  // other hooks
  const navigate = useNavigate();

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
      .then(() => {
        // go to a landing page
        navigate("/", true);
      })
      .catch((error) => {
        // set error message to display
        setError(error.data.error);

        // print to console
        console.error(error);
      });
  };

  // render
  return (
    <Card>
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

          <Box mt={2}>
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          </Box>
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

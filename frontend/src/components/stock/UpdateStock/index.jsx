import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { useMutate } from "restful-react";

import RefreshIcon from "@mui/icons-material/Refresh";
import { Button } from "@mui/material";

import { SimpleSnackbar } from "@fengxia41103/storybook";

import GlobalContext from "src/context";

const UpdateStock = (props) => {
  const { host } = useContext(GlobalContext);
  const { symbol, resource_uri } = props;
  const [notification, setNotification] = useState("");

  const { mutate: update } = useMutate({
    verb: "PATCH",
    path: `${host}${resource_uri}`,
  });

  const handle_update = () => {
    update({}).then(setNotification(`Updating ${symbol} has been requested.`));
  };

  return (
    <Button color="secondary" onClick={handle_update}>
      <RefreshIcon />
      Update
      <SimpleSnackbar msg={notification} />
    </Button>
  );
};

UpdateStock.propTypes = {
  resource_uri: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
};

export default UpdateStock;

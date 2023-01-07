import { SimpleSnackbar } from "@fengxia41103/storybook";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button } from "@mui/material";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { useMutate } from "restful-react";

import GlobalContext from "src/context";

export default function UpdateStock(props) {
  const { host } = useContext(GlobalContext);
  const { symbol, resource_uri } = props;
  const [notification, setNotification] = useState("");

  const { mutate: update } = useMutate({
    verb: "PATCH",
    path: `${host}${resource_uri}`,
  });

  const handle_update = (event) => {
    update({}).then(setNotification(`Updating ${symbol} has been requested.`));
  };

  return (
    <Button color="secondary" onClick={handle_update}>
      <RefreshIcon />
      Update
      <SimpleSnackbar msg={notification} />
    </Button>
  );
}

UpdateStock.propTypes = {
  resource_uri: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
};

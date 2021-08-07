import React, { useState, useContext } from "react";
import { Button } from "@material-ui/core";
import { useMutate } from "restful-react";

import SimpleSnackbar from "src/components/common/SimpleSnackbar";
import PropTypes from "prop-types";
import GlobalContext from "src/context";
import RefreshIcon from "@material-ui/icons/Refresh";

export default function UpdateStock(props) {
  const { host } = useContext(GlobalContext);
  const { symbol, resource_uri } = props;
  const [notification, setNotification] = useState("");

  const { mutate: update } = useMutate({
    verb: "PATCH",
    path: `${host}${resource_uri}`,
  });

  const handle_update = event => {
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

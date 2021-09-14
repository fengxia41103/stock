import React, { useState, useContext } from "react";

import { Button } from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";
import PropTypes from "prop-types";
import { useMutate } from "restful-react";

import SimpleSnackbar from "src/components/common/SimpleSnackbar";
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

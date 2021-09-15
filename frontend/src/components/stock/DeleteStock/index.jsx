
import { Button } from "@material-ui/core";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import PropTypes from "prop-types";
import React, { useState, useContext } from "react";
import { useMutate } from "restful-react";

import SimpleSnackbar from "src/components/common/SimpleSnackbar";
import GlobalContext from "src/context";

export default function DeleteStock(props) {
  const { host } = useContext(GlobalContext);
  const { symbol, resource_uri } = props;
  const [notification, setNotification] = useState("");

  const { mutate: del } = useMutate({
    verb: "DELETE",
    path: `${host}${resource_uri}`,
  });

  const handle_delete = event => {
    del().then(setNotification(`Stock ${symbol} has been deleted.`));
  };

  return (
    <Button color="secondary" onClick={handle_delete}>
      <DeleteForeverIcon />
      Delete
      <SimpleSnackbar msg={notification} />
    </Button>
  );
}

DeleteStock.propTypes = {
  resource_uri: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
};

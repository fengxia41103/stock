import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Button } from "@mui/material";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutate } from "restful-react";

import SimpleSnackbar from "src/components/common/SimpleSnackbar";
import GlobalContext from "src/context";

export default function DeleteStock(props) {
  // props
  const { symbol, resource_uri } = props;

  // context
  const { host } = useContext(GlobalContext);

  // states
  const [notification, setNotification] = useState("");

  // hooks
  const navigate = useNavigate();
  const { mutate: del } = useMutate({
    verb: "DELETE",
    path: `${host}${resource_uri}`,
  });

  // event handlers
  const handle_delete = (event) => {
    del().then(() => {
      setNotification(`Stock ${symbol} has been deleted.`);
      navigate("/stocks");
    });
  };

  // render
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

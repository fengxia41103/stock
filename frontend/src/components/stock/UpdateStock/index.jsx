import PropTypes from "prop-types";
import React, { useState } from "react";

import RefreshIcon from "@mui/icons-material/Refresh";
import { Button } from "@mui/material";

import { useUpdate } from "@/api";
import { SimpleSnackbar } from "@fengxia41103/storybook";

const UpdateStock = ({ id, symbol }) => {
  const [notification, setNotification] = useState("");
  const { mutate: update } = useUpdate(`/stocks/${id}/`, ["stocks", "stock"]);

  const handle_update = () => {
    update(
      {},
      {
        onSuccess: () =>
          setNotification(`Updating ${symbol} has been requested.`),
      },
    );
  };

  return (
    <Button color="secondary" onClick={handle_update}>
      <RefreshIcon /> Update
      {notification && <SimpleSnackbar msg={notification} />}
    </Button>
  );
};

UpdateStock.propTypes = {
  id: PropTypes.number.isRequired,
  symbol: PropTypes.string.isRequired,
};

export default UpdateStock;

import { map, truncate } from "lodash";
import PropTypes from "prop-types";
import React, { useState } from "react";

import UpdateIcon from "@mui/icons-material/Update";
import { Button } from "@mui/material";

import { SimpleSnackbar } from "@fengxia41103/storybook";

import api from "@/api/client";

const UpdateAllStock = ({ stocks }) => {
  const [notification, setNotification] = useState("");

  const update_all = () => {
    const symbols = truncate(map(stocks, (s) => s.symbol).join(","), 20);
    const promises = stocks.map((s) => api.patch(`/stocks/${s.id}/`, {}));
    Promise.all(promises).then(() =>
      setNotification(`${symbols} updates have been requested.`),
    );
  };

  return (
    <Button color="secondary" onClick={update_all}>
      <UpdateIcon /> Update All
      {notification && <SimpleSnackbar msg={notification} />}
    </Button>
  );
};

UpdateAllStock.propTypes = {
  stocks: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number })),
};

export default UpdateAllStock;

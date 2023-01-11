import { map, truncate } from "lodash";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";

import UpdateIcon from "@mui/icons-material/Update";
import { Button } from "@mui/material";

import { SimpleSnackbar } from "@fengxia41103/storybook";

import GlobalContext from "src/context";

const UpdateAllStock = (props) => {
  const { api, auth } = useContext(GlobalContext);
  const [resource] = useState("/stocks");
  const { stocks } = props;
  const [notification, setNotification] = useState("");

  // API will treat `all:True` as a request to update all stocks.
  const symbols = truncate(map(stocks, (s) => s.symbol).join(","), 20);
  const update_all = (stocks) => {
    const call_api = (s) => {
      const uri = `${api}${resource}/${s.id}/`;
      return fetch(uri, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body: JSON.stringify({}),
      });
    };

    const promises = stocks.map((s) => call_api(s));
    Promise.all(promises).then(
      setNotification(`${symbols} updates have been requested.`),
    );
  };

  return (
    <Button color="secondary" onClick={() => update_all(stocks)}>
      <UpdateIcon />
      Update All
      <SimpleSnackbar msg={notification} />
    </Button>
  );
};

UpdateAllStock.propTypes = {
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
    }),
  ),
};

export default UpdateAllStock;

import React, { useState, useContext } from "react";

import { Button } from "@material-ui/core";
import UpdateIcon from "@material-ui/icons/Update";
import { map, truncate } from "lodash";
import PropTypes from "prop-types";

import SimpleSnackbar from "src/components/common/SimpleSnackbar";
import GlobalContext from "src/context";

export default function UpdateAllStock(props) {
  const { api } = useContext(GlobalContext);
  const [resource] = useState("/stocks");
  const { stocks } = props;
  const [notification, setNotification] = useState("");

  // API will treat `all:True` as a request to update all stocks.
  const symbols = truncate(map(stocks, s => s.symbol).join(","), 20);
  const update_all = stocks => {
    const call_api = s => {
      const uri = `${api}${resource}/${s.id}/`;
      return fetch(uri, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
    };

    const promises = stocks.map(s => call_api(s));
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
}

UpdateAllStock.propTypes = {
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
    }),
  ),
};

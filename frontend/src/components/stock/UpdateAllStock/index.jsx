import React, { useState } from "react";
import { Button } from "@material-ui/core";
import { map, truncate } from "lodash";
import PropTypes from "prop-types";
import UpdateIcon from "@material-ui/icons/Update";
import UpdateResource from "src/components/common/UpdateResource";

export default function UpdateAllStock(props) {
  const { stocks } = props;
  const [resource] = useState("/stocks");
  const [submit, setSubmit] = useState(false);

  // API will treat `all:True` as a request to update all stocks.
  const update_all = map(stocks, s => {
    const uri = `${resource}/${s.id}/`;
    const success_msg = `${s.symbol} updates have been requested.`;
    return (
      <UpdateResource
        {...{ resource: uri, data: {}, success_msg, silent: true }}
      />
    );
  });

  return (
    <>
      <Button color="secondary" onClick={() => setSubmit(true)}>
        <UpdateIcon />
        Update All
      </Button>
      {submit ? update_all : null}
    </>
  );
}

UpdateAllStock.propTypes = {
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
    })
  ),
};

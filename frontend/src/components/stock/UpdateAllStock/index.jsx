import React, { useState } from "react";
import { Button } from "@material-ui/core";
import { map, truncate } from "lodash";
import PropTypes from "prop-types";
import UpdateIcon from "@material-ui/icons/Update";
import UpdateResource from "src/components/common/UpdateResource";
import SimpleSnackbar from "src/components/common/SimpleSnackbar";

export default function UpdateAllStock(props) {
  const { stocks } = props;
  const [resource] = useState("/stocks");
  const [submit, setSubmit] = useState(false);

  // API will treat `all:True` as a request to update all stocks.
  const update_all = map(stocks, s => {
    const uri = `${resource}/${s.id}/`;
    return (
      <UpdateResource
        key={s.id}
        {...{ resource: uri, data: {}, silent: true }}
      />
    );
  });

  const symbols = truncate(map(stocks, s => s.symbol).join(","), 20);
  const success_msg = `${symbols} updates have been requested.`;

  return (
    <>
      <Button color="secondary" onClick={() => setSubmit(true)}>
        <UpdateIcon />
        Update All
      </Button>
      {submit ? (
        <>
          {update_all}
          <SimpleSnackbar msg={success_msg} />
        </>
      ) : null}
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

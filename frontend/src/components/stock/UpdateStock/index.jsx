import React, { useState, useContext } from "react";
import { Button } from "@material-ui/core";
import PropTypes from "prop-types";
import GlobalContext from "src/context";
import RefreshIcon from "@material-ui/icons/Refresh";
import UpdateResource from "src/components/common/UpdateResource";

export default function UpdateStock(props) {
  const { host } = useContext(GlobalContext);
  const { symbol, resource_uri } = props;
  const [submit, setSubmit] = useState(false);

  const success_msg = `Updating ${symbol} has been requested.`;

  return (
    <>
      <Button color="secondary" onClick={() => setSubmit(true)}>
        <RefreshIcon />
        Update
      </Button>
      {submit ? (
        <UpdateResource
          {...{
            resource: `${host}${resource_uri}`,
            data: {},
            success_msg,
          }}
        />
      ) : null}
    </>
  );
}

UpdateStock.propTypes = {
  resource_uri: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
};

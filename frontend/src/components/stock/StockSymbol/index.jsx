import { Link, Box } from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";

import StockLinkToSector from "src/components/stock/StockLinkToSector";
import TaskNotificationIcon from "src/components/task/TaskNotificationIcon";

export default function StockSymbol(props) {
  const { symbol, id } = props;

  return (
    <Box display="inline">
      <StockLinkToSector {...props} minimal={true} />
      <Link href={`/stocks/${id}/historical/price`}>{symbol}</Link>
      <TaskNotificationIcon {...props} />
    </Box>
  );
}

StockSymbol.propTypes = {
  id: PropTypes.number.isRequired,
  symbol: PropTypes.string.isRequired,
  resource_uri: PropTypes.string.isRequired,
};

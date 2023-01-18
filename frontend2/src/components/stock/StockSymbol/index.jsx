import PropTypes from "prop-types";
import React from "react";

import { Box, Link } from "@mui/material";

import StockLinkToSector from "@Components/stock/StockLinkToSector";
import TaskNotificationIcon from "@Components/task/TaskNotificationIcon";

const StockSymbol = (props) => {
  const { symbol, id } = props;

  return (
    <Box display="inline">
      <StockLinkToSector {...props} minimal />
      <Link href={`/stocks/${id}/historical/price`}>{symbol}</Link>
      <TaskNotificationIcon {...props} />
    </Box>
  );
};

StockSymbol.propTypes = {
  id: PropTypes.number.isRequired,
  symbol: PropTypes.string.isRequired,
  resource_uri: PropTypes.string.isRequired,
};

export default StockSymbol;

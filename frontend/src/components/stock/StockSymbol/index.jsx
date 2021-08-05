import React from 'react';
import PropTypes from 'prop-types';
import { Link, Box } from '@material-ui/core';
import StockLinkToSector from 'src/components/stock/StockLinkToSector';

export default function StockSymbol(props) {
  const { symbol, id } = props;

  return (
    <Box display="inline">
      <StockLinkToSector {...props} minimal={true} />
      <Link href={`/stocks/${id}/historical/price`}>{symbol}</Link>
    </Box>
  );
}

StockSymbol.propTypes = {
  id: PropTypes.number.isRequired,
  symbol: PropTypes.string.isRequired,
  resource_uri: PropTypes.string,
};

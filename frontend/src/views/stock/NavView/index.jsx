import React, { useContext } from "react";
import FinancialCard from "src/components/stock/FinancialCard";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";
import { Box, Typography } from "@material-ui/core";

function NavView(props) {
  const stock = useContext(StockDetailContext);

  const reported = {
    nav: "NAV",
  };

  const { nav_model } = stock;

  return (
    <Box>
      <Typography variant="h1">{stock.symbol} Net Asset Model</Typography>
      <FinancialCard data={nav_model} reported={reported} />
    </Box>
  );
}
export default NavView;

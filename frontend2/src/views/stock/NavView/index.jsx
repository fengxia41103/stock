import React, { useContext } from "react";

import { Typography } from "@mui/material";

import FinancialCard from "@Components/stock/FinancialCard";
import StockDetailContext from "@Views/stock/StockDetailView/context";

const NavView = () => {
  const stock = useContext(StockDetailContext);
  const { symbol } = stock;

  const reported = {
    nav: "NAV",
  };

  const { nav_model } = stock;

  return (
    <>
      <Typography variant="h1">{symbol} Net Asset Model</Typography>
      <FinancialCard data={nav_model} reported={reported} />
    </>
  );
};
export default NavView;

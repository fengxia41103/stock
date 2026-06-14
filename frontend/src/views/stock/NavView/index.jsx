import React from "react";
import { useParams } from "react-router-dom";

import { Typography } from "@mui/material";

import { useResource } from "@/api";
import FinancialCard from "@Components/stock/FinancialCard";
import ScaleLoader from "react-spinners/ScaleLoader";

const NavView = () => {
  const { id } = useParams();
  const { data, isLoading } = useResource(["nav", id], `/stocks/${id}/nav/`);

  if (isLoading || !data) return <ScaleLoader loading />;

  const reported = {
    nav: "Net Asset Value Per Share",
  };

  return (
    <>
      <Typography variant="h2">Net Asset Value</Typography>
      <FinancialCard data={data} reported={reported} />
    </>
  );
};

export default NavView;

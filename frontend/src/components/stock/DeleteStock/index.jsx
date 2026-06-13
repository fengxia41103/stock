import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Button } from "@mui/material";

import { useDelete } from "@/api";

const DeleteStock = ({ id, symbol }) => {
  const navigate = useNavigate();
  const { mutate: del } = useDelete(`/stocks/${id}/`, ["stocks"]);

  return (
    <Button
      color="secondary"
      onClick={() => del(null, { onSuccess: () => navigate("/stocks") })}
    >
      <DeleteForeverIcon /> Delete {symbol}
    </Button>
  );
};

DeleteStock.propTypes = {
  id: PropTypes.number.isRequired,
  symbol: PropTypes.string.isRequired,
};

export default DeleteStock;

import React, { useState, useEffect } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import PropTypes from "prop-types";

export default function SimpleSnackbar(props) {
  const { msg } = props;
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!!msg) {
      setOpen(true);
    }
  }, [msg]);

  // guard against null msg
  if (!!!msg) return null;

  const handleClose = (event) => setOpen(false);

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={open}
      onClose={handleClose}
      autoHideDuration={6000}
      message={msg}
    />
  );
}

SimpleSnackbar.propTypes = {
  msg: PropTypes.string.isRequired,
};

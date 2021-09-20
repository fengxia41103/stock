import Snackbar from "@material-ui/core/Snackbar";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";

export default function SimpleSnackbar(props) {
  const { msg } = props;
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (msg) {
      setOpen(true);
    }
  }, [msg]);

  // guard against null msg
  if (!msg) return null;

  const handleClose = (event) => setOpen(false);

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      open={open}
      onClose={handleClose}
      autoHideDuration={3000}
      message={msg}
    />
  );
}

SimpleSnackbar.propTypes = {
  msg: PropTypes.string.isRequired,
};

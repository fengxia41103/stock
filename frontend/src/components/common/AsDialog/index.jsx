import { Box } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import PropTypes from "prop-types";
import React, { useState } from "react";

export default function AsDialog(props) {
  // props
  const { as, title, content, when_confirm } = props;

  // states
  const [open, setOpen] = useState(false);

  // event handlres
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Box onClick={handleClickOpen}>{as}</Box>
      <Dialog open={open} onClose={handleClose} aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title">{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
          {when_confirm}
        </DialogActions>
      </Dialog>
    </>
  );
}

AsDialog.propTypes = {
  // whatever triggers this dialog
  // most likely it's a string, but it can also be a button for example.
  as: PropTypes.any.isRequired,

  // dialog box title
  title: PropTypes.string.isRequired,

  // the component to show as dialog content
  content: PropTypes.any.isRequired,

  // confirm action
  when_confirm: PropTypes.any,
};

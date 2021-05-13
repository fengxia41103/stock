import React, { useState, useContext } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useMutate } from "restful-react";
import AddIcon from "@material-ui/icons/Add";
import GlobalContext from "src/context";
import MDEditor from "@uiw/react-md-editor";

export default function AddDiaryDialog(props) {
  const { api } = useContext(GlobalContext);
  const [open, setOpen] = useState(false);
  const [resource] = useState("/diaries");
  const [comment, setComment] = useState("");
  const { stock } = props;

  const { mutate: create } = useMutate({
    verb: "POST",
    path: `${api}${resource}/`,
  });

  const reload = () => window.location.reload();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // call API and close this dialog
  const on_create = () => {
    create({
      stock: `/api/v1/stocks/${stock}/`,
      content: comment,
      judgement: 1,
      was_correct: false,
    }).then(setOpen(false));
  };

  return (
    <Box>
      <Button color="primary" onClick={handleClickOpen}>
        <AddIcon />
        Add diary
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Write your comments</DialogTitle>
        <DialogContent>
          <MDEditor value={comment} onChange={setComment} />
          <MDEditor.Markdown source={comment} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={on_create}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

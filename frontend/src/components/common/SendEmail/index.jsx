import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Link from "@material-ui/core/Link";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import EmailIcon from "@mui/icons-material/Email";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MDEditor from "@uiw/react-md-editor";
import { map } from "lodash";
import PropTypes from "prop-types";
import React, { useState, useContext } from "react";
import { DebounceInput } from "react-debounce-input";
import { useMutate } from "restful-react";

import SimpleSnackbar from "src/components/common/SimpleSnackbar";
import GlobalContext from "src/context";

export default function SendEmail(props) {
  // context
  const { host } = useContext(GlobalContext);

  // props
  const { url, whom, from, to } = props;

  // states
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState(`Hi ${whom},`);
  const [notification, setNotification] = useState("");

  // hooks
  const { mutate: send } = useMutate({
    verb: "POST",
    path: `${host}${url}/?`,
    mode: "same-origin",
  });

  // event handlers
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const on_subject_change = (e) => {
    setSubject(e.target.value);
  };

  const on_send = () => {
    const msg = "Email has been sent.";

    send({ ...{ from, to, subject, message } })
      .then(setMessage(""))
      .then(setNotification(msg));
  };

  const receivers = map(to, (t) => (
    <Box
      key={t}
      display="flex"
      flexDirection="row"
      alignItems="center"
      spacing={3}
    >
      <PersonOutlineIcon />
      <Link href={`mailto: ${t}`}>
        <Typography variant="body2">{t}</Typography>
      </Link>
    </Box>
  ));

  // render
  return (
    <>
      <Box display="flex" flexDirection="row">
        <EmailIcon />
        <Typography variant="body2" onClick={handleClickOpen}>
          Send email
        </Typography>
      </Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title" color="secondary">
          Email {whom}
        </DialogTitle>
        <DialogContent>
          {receivers}
          <Box mt={3}>
            <DebounceInput
              element={TextField}
              autoFocus
              margin="dense"
              value={subject}
              onChange={on_subject_change}
              placeholder="Subject"
              fullWidth
              debounceTimeout={1200}
            />
          </Box>
          <Box mt={2}>
            <MDEditor
              value={message}
              onChange={setMessage}
              height={500}
              preview="edit"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={on_send}>
            Send
          </Button>
        </DialogActions>
        <SimpleSnackbar msg={notification} />
      </Dialog>
    </>
  );
}

SendEmail.propTypes = {
  // call url
  url: PropTypes.string.isRequired,

  // team name
  whom: PropTypes.string.isRequired,

  // from email address
  from: PropTypes.string.isRequired,

  // to email list
  to: PropTypes.arrayOf(PropTypes.string).isRequired,
};

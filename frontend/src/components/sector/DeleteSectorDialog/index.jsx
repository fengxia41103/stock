import React, { useState, useContext } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import GlobalContext from "src/context";
import { useMutate } from "restful-react";
import DeleteIcon from "@material-ui/icons/Delete";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Link from "@material-ui/core/Link";
import { map } from "lodash";

export default function DeleteSectorDialog(props) {
  const { host } = useContext(GlobalContext);
  const { resource_uri:sector, stocks_property:stocks } = props;
  const [open, setOpen] = useState(false);

  const { mutate: del } = useMutate({
    verb: "DELETE",
    path: `${host}${sector}`,
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const stock_links = map(stocks, v => {
    return (
      <ListItem key={v.id}>
        <Link key={v.id} href={`/stocks/${v.id}/historical/price`}>
          {v.symbol}
        </Link>
      </ListItem>
    );
  });

  return (
    <Box>
      <Button color="primary" onClick={handleClickOpen}>
        <DeleteIcon />
        Delete sector
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>Delete Sector</DialogTitle>
        <DialogContent>
          Deleting this sector will NOT delete stocks associated w/
          it. Stock belonging to no sector, however, will not be
          visible in the sector page. You can go to the stock detail
          page and add it to a new sector.
          <Box mt={2}>
            <List>{stock_links}</List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => del().then(handleClose())}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

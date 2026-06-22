import { map } from "lodash";
import PropTypes from "prop-types";
import React, { useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
} from "@mui/material";

import { useDelete } from "@/api";
import StockSymbol from "@Components/stock/StockSymbol";

const DeleteSectorDialog = ({ id, stocks_detail: stocks }) => {
  const [open, setOpen] = useState(false);
  const { mutate: del } = useDelete(`/sectors/${id}/`, ["sectors"]);

  return (
    <Box flexDirection="row">
      <Button color="primary" onClick={() => setOpen(true)}>
        <DeleteIcon /> Delete sector
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Delete Portfolio</DialogTitle>
        <DialogContent>
          Deleting this sector will NOT delete stocks associated with it.
          <Box mt={2}>
            <List>
              {map(stocks, (v) => (
                <ListItem key={v.id}>
                  <StockSymbol {...v} />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => del(null, { onSuccess: () => setOpen(false) })}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

DeleteSectorDialog.propTypes = {
  id: PropTypes.number.isRequired,
  stocks_detail: PropTypes.array.isRequired,
};

export default DeleteSectorDialog;

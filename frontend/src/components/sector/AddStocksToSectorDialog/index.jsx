import { map } from "lodash";
import PropTypes from "prop-types";
import React, { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import ListItem from "@mui/material/ListItem";

import { useSectors } from "@/api";
import api from "@/api/client";
import { useQueryClient } from "@tanstack/react-query";

const AddStocksToSectorDialog = ({ stocks }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState({});
  const { data: sectors = [] } = useSectors();
  const qc = useQueryClient();

  const handleChange = (e) => {
    setSelected((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const add = async () => {
    const stockIds = stocks.map((s) => s.id);

    const promises = (Array.isArray(sectors) ? sectors : [])
      .filter((s) => selected[s.name])
      .map((s) => {
        const existingIds = (s.stocks_detail || []).map((st) => st.id);
        const merged = [...new Set([...existingIds, ...stockIds])];
        return api.patch(`/sectors/${s.id}/`, { stocks: merged });
      });

    await Promise.all(promises);
    qc.invalidateQueries({ queryKey: ["sectors"] });
    setOpen(false);
    setSelected({});
  };

  const sectorList = Array.isArray(sectors) ? sectors : [];

  return (
    <>
      <Button color="secondary" onClick={() => setOpen(true)}>
        <AddIcon />
        Add stocks to sector
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add stocks to sector</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Typography variant="body2">
              Select a sector to add these stocks to:
            </Typography>
            <Grid container spacing={1}>
              {sectorList.map((s) => (
                <Grid key={s.id} item lg={3} md={4} sm={6} xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!selected[s.name]}
                        onChange={handleChange}
                        name={s.name}
                      />
                    }
                    label={s.name}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          <Box mt={2}>
            <Typography variant="body2">
              The following stocks will be added:
            </Typography>
            {map(stocks, (v) => (
              <ListItem key={v.id}>{v.symbol}</ListItem>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={add}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

AddStocksToSectorDialog.propTypes = {
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      symbol: PropTypes.string,
    }),
  ).isRequired,
};

export default AddStocksToSectorDialog;

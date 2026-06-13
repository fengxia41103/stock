import { map, remove } from "lodash";
import PropTypes from "prop-types";
import React, { useState } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

import { Box, Checkbox, Divider, FormControl, FormControlLabel, FormGroup, Grid, Popover, Tooltip, Typography } from "@mui/material";

import { useSectors, useUpdate } from "@/api";
import { SimpleSnackbar } from "@fengxia41103/storybook";
import DeleteStock from "@Components/stock/DeleteStock";
import UpdateStock from "@Components/stock/UpdateStock";

const StockLinkToSector = (props) => {
  const { id, symbol, minimal } = props;
  const [notification, setNotification] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const { data, isLoading } = useSectors();

  // We need a generic update that can target any sector
  const { mutate: updateSector } = useUpdate("/sectors/", ["sectors", "stocks"]);

  const open = Boolean(anchorEl);
  const sectors = data?.results || data || [];

  const handle_update = (sectorId, stocks, checked, sectorName) => {
    let newStocks = [...stocks];
    if (checked) {
      newStocks.push(id);
      setNotification(`Added to "${sectorName}"`);
    } else {
      remove(newStocks, (s) => s === id);
      setNotification(`Removed from "${sectorName}"`);
    }
    // Use the api client directly for per-sector update
    import("@/api/client").then(({ default: api }) => {
      api.patch(`/sectors/${sectorId}/`, { stocks: newStocks });
    });
  };

  const content = isLoading ? <ScaleLoader loading /> : (
    <Box padding={2}>
      <Typography variant="h6">Link {symbol} to a Sector</Typography>
      <Divider />
      <Box mt={2}>
        <FormControl component="fieldset">
          <FormGroup>
            <Grid container spacing={1}>
              {map(sectors, (s) => {
                const checked = s.stocks?.includes(id);
                return (
                  <Grid item key={s.id} lg={3} sm={4} xs={6}>
                    <FormControlLabel
                      control={<Checkbox checked={checked} onChange={(e) => handle_update(s.id, s.stocks || [], e.target.checked, s.name)} name={s.name} />}
                      label={s.name}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </FormGroup>
        </FormControl>
      </Box>
      {notification && <SimpleSnackbar msg={notification} />}
      <Divider />
      <Box mt={2}>
        <Grid container spacing={1}>
          <UpdateStock {...props} />
          <DeleteStock {...props} />
        </Grid>
      </Box>
    </Box>
  );

  return (
    <Box display="inline">
      <Tooltip title="Assign stock to a sector" onClick={(e) => setAnchorEl(e.currentTarget)} arrow>
        <Typography color="secondary" display="inline">
          &#47;&#47; {minimal ? null : "Link to Sector"}
        </Typography>
      </Tooltip>
      <Popover open={open} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}>
        {content}
      </Popover>
    </Box>
  );
};

StockLinkToSector.propTypes = {
  id: PropTypes.number.isRequired,
  symbol: PropTypes.string.isRequired,
  minimal: PropTypes.bool,
};

export default StockLinkToSector;

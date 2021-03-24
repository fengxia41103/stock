import React, { useState, useContext } from "react";
import { map, filter, sortBy, groupBy } from "lodash";
import Fetch from "src/components/fetch.jsx";
import {
  Box,
  Button,
  Container,
  Grid,
  Link,
  TextField,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  Menu,
  MenuItem,
} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import Page from "src/components/Page";
import StockListGroupCard from "./card.jsx";
import GlobalContext from "src/context";

function StockListView(props) {
  const { api } = useContext(GlobalContext);

  const [resource] = useState("/stocks");
  const [searching, setSearching] = useState("");
  const [group_by, setGroupBy] = useState("last_reporting_date");

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const symbol_filter_change = event => {
    const tmp = event.target.value.trim().toUpperCase();
    setSearching(tmp);
  };

  const group_by_change = event => {
    setGroupBy(event.target.value);
  };

  const render_data = data => {
    const stocks = data.objects;

    // filter based on search string
    const filtered = filter(stocks, x => x.symbol.includes(searching));

    // when select
    const grouped = groupBy(filtered, v => {
      let g = null;

      switch (group_by) {
        case "name":
          g = v.symbol.charAt(0);
          break;

        case "sector":
          g = v.sectors[0];
          break;

        default:
          g = v.last_reporting_date;
          break;
      }

      return g;
    });

    const sorted_keys = sortBy(Object.keys(grouped));
    const selectors = map(sorted_keys, index => {
      const symbols = grouped[index];
      const sorted = sortBy(symbols, s => s.symbol);
      const links = map(sorted, v => {
        return (
          <Link key={v.id} href={`/app/stocks/${v.id}/historical/price`}>
            {v.symbol}
          </Link>
        );
      });

      return (
        <StockListGroupCard
          key={index}
          {...{ group_by, index }}
          stocks={links}
        />
      );
    });

    return (
      <Page title="Stocks">
        <Container maxWidth={false}>
          <Box display="flex" flexDirection="row-reverse" mt={1}>
            <Button
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleClick}
            >
              <SettingsIcon />
              Options
            </Button>
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <Box p={3}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Group By</FormLabel>
                  <RadioGroup
                    aria-label="Group By"
                    name="group_by"
                    value={group_by}
                    onChange={group_by_change}
                    row
                  >
                    <FormControlLabel
                      value="name"
                      control={<Radio />}
                      label="Symbol"
                    />
                    <FormControlLabel
                      value="last_reporting_date"
                      control={<Radio />}
                      label="Last Income Statement Date"
                    />
                    <FormControlLabel
                      value="sector"
                      control={<Radio />}
                      label="Sector"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            </Menu>
          </Box>

          <Box mt={1}>
            <Card>
              <CardContent>
                <TextField
                  label="Filter by Symbol"
                  value={searching}
                  onChange={symbol_filter_change}
                  fullWidth={true}
                />
              </CardContent>
            </Card>
          </Box>
          <Box mt={3}>
            <Grid container spacing={1}>
              {selectors}
            </Grid>
          </Box>
        </Container>
      </Page>
    );
  };

  return <Fetch api={api} resource={resource} render_data={render_data} />;
}
export default StockListView;

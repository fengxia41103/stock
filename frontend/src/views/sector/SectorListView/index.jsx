import React, { useState, useContext } from "react";
import { map, filter } from "lodash";
import Fetch from "src/components/Fetch";
import {
  Box,
  Container,
  Grid,
  Link,
  TextField,
  Card,
  CardContent,
} from "@material-ui/core";
import Page from "src/components/Page";
import GlobalContext from "src/context";
import AddNewSectorDialog from "src/components/stock/AddNewSectorDialog";
import ListStockCard from "src/components/stock/ListStockCard";
import EditSectorDialog from "src/components/stock/EditSectorDialog";

export default function SectorListView(props) {
  const { api } = useContext(GlobalContext);
  const [resource] = useState("/sectors");
  const [searching, setSearching] = useState("");

  const sector_filter_change = event => {
    const tmp = event.target.value.trim();
    setSearching(tmp);
  };

  const render_data = data => {
    const sectors = data.objects;
    const existing_names = map(sectors, s => s.name);

    // filter based on search string
    const filtered = filter(sectors, x => x.name.includes(searching));

    const group_by = "sector";

    const selectors = map(filtered, s => {
      const actions = [<EditSectorDialog {...s} existings={existing_names} />];

      const links = map(s.stocks_id_symbol, v => {
        return (
          <Link key={v.id} href={`/app/stocks/${v.id}/historical/price`}>
            {v.symbol}
          </Link>
        );
      });

      return (
        <ListStockCard
          key={s.name}
          {...{ group_by, actions, index: s.resource_uri }}
          stocks={links}
        />
      );
    });

    return (
      <Page title="Stocks">
        <Container maxWidth={false}>
          <Box display="flex" flexDirection="row-reverse" mt={1}>
            <AddNewSectorDialog />
          </Box>

          <Box mt={1}>
            <Card>
              <CardContent>
                <TextField
                  label="Filter by sector name"
                  value={searching}
                  onChange={sector_filter_change}
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

  return <Fetch {...{ api, resource, render_data }} />;
}

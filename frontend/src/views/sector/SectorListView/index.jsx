import React, { useState } from "react";
import { map, filter } from "lodash";
import Fetch from "src/components/common/Fetch";
import {
  Box,
  Container,
  Grid,
  TextField,
  Card,
  CardContent,
} from "@material-ui/core";
import Page from "src/components/common/Page";
import AddNewSectorDialog from "src/components/sector/AddNewSectorDialog";
import ListSectorCard from "src/components/sector/ListSectorCard";

export default function SectorListView(props) {
  const [resource] = useState("/sectors");
  const [searching, setSearching] = useState("");

  const sector_filter_change = (event) => {
    const tmp = event.target.value.trim();
    setSearching(tmp);
  };

  const render_data = (data) => {
    const sectors = data.objects;

    // filter based on search string
    const filtered = filter(sectors, (x) => x.name.includes(searching));

    const selectors = map(filtered, (s) => {
      return (
        <Grid key={s.name} item lg={6} md={6} sm={12} xs={12}>
          <ListSectorCard {...{ me: s, all: sectors }} />
        </Grid>
      );
    });

    return (
      <Page title="Sectors">
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
          <Box mt={1}>
            <Grid container spacing={1}>
              {selectors}
            </Grid>
          </Box>
        </Container>
      </Page>
    );
  };

  return <Fetch {...{ resource, render_data }} />;
}

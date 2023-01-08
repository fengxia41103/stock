import { filter, map } from "lodash";
import React, { useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
} from "@mui/material";

import { Page, PollResource } from "@fengxia41103/storybook";

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

  return <PollResource {...{ resource, on_success: render_data }} />;
}

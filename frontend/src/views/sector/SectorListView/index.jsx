import { filter, map } from "lodash";
import React, { useState } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

import { Box, Card, CardContent, Container, Grid, TextField } from "@mui/material";

import { useSectors } from "@/api";
import { Page } from "@fengxia41103/storybook";
import AddNewSectorDialog from "@Components/sector/AddNewSectorDialog";
import ListSectorCard from "@Components/sector/ListSectorCard";

const SectorListView = () => {
  const [searching, setSearching] = useState("");
  const { data, isLoading } = useSectors();

  if (isLoading) return <ScaleLoader loading />;

  const sectors = data?.results || data || [];
  const filtered = filter(sectors, (x) => x.name.includes(searching));

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
                onChange={(e) => setSearching(e.target.value.trim())}
                fullWidth
              />
            </CardContent>
          </Card>
        </Box>
        <Box mt={1}>
          <Grid container spacing={1}>
            {map(filtered, (s) => (
              <Grid key={s.name} item lg={6} md={6} sm={12} xs={12}>
                <ListSectorCard me={s} all={sectors} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Page>
  );
};

export default SectorListView;

import { map } from "lodash";
import React, { useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
} from "@mui/material";

import { Page } from "@fengxia41103/storybook";

import ListNewsCard from "src/components/news/ListNewsCard";

const NewsListView = () => {
  const TOPICS = [
    "tech",
    "news",
    "business",
    "science",
    "finance",
    "politics",
    "economics",
    "world",
  ];

  const [searching, setSearching] = useState("");

  const search_change = (event) => {
    setSearching(event.target.value.trim().toUpperCase());
  };

  const news = map(TOPICS, (t) => {
    return (
      <Grid key={t} item lg={4} sm={6} xs={12}>
        <ListNewsCard topic={t} searching={searching} />
      </Grid>
    );
  });

  return (
    <Page title="News">
      <Container maxWidth={false}>
        <Box mt={1}>
          <Card>
            <CardContent>
              <TextField
                label="Search text"
                value={searching}
                onChange={search_change}
                fullWidth={true}
              />
            </CardContent>
          </Card>
        </Box>

        <Box mt={1}>
          <Grid container spacing={1} alignItems="stretch">
            {news}
          </Grid>
        </Box>
      </Container>
    </Page>
  );
};

export default NewsListView;

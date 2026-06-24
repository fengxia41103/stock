import React, { useState } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

import { Box, Container, TextField } from "@mui/material";

import { useStocks } from "@/api";
import { Page } from "@fengxia41103/storybook";
import ListDiary from "@Components/diary/ListDiary";

import DiaryListContext from "./context";

const DiaryListView = () => {
  const { data, isLoading } = useStocks();
  const [search, setSearch] = useState("");

  if (isLoading) return <ScaleLoader loading />;

  const stocks = data?.results || data || [];

  // Create a mock stock object for the filter if searching
  const stockFilter = search
    ? { symbol: search.toUpperCase().trim() }
    : undefined;

  return (
    <Page title="Notes">
      <Container maxWidth={false}>
        <Box mb={2}>
          <TextField
            label="Search by stock symbol (e.g. MSFT)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
          />
        </Box>
        <DiaryListContext.Provider value={stocks}>
          <Box mt={1}>
            <ListDiary stock={stockFilter} key={search} />
          </Box>
        </DiaryListContext.Provider>
      </Container>
    </Page>
  );
};

export default DiaryListView;

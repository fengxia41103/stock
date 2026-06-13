import React from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

import { Box, Container } from "@mui/material";

import { useStocks } from "@/api";
import { Page } from "@fengxia41103/storybook";
import ListDiary from "@Components/diary/ListDiary";

import DiaryListContext from "./context";

const DiaryListView = () => {
  const { data, isLoading } = useStocks();

  if (isLoading) return <ScaleLoader loading />;

  const stocks = data?.results || data || [];

  return (
    <Page title="Notes">
      <Container maxWidth={false}>
        <DiaryListContext.Provider value={stocks}>
          <Box mt={1}>
            <ListDiary />
          </Box>
        </DiaryListContext.Provider>
      </Container>
    </Page>
  );
};

export default DiaryListView;

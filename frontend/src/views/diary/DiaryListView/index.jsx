import React, { useState } from "react";

import { Box, Container } from "@mui/material";

import { Page } from "@fengxia41103/storybook";

import ShowResource from "@Components/common/ShowResource";
import ListDiary from "@Components/diary/ListDiary";

import DiaryListContext from "./context";

const DiaryListView = () => {
  const [resource] = useState("/stocks");

  const render_data = (data) => {
    return (
      <Page title="Notes">
        <Container maxWidth={false}>
          <DiaryListContext.Provider value={data.objects}>
            <Box mt={1}>
              <ListDiary />
            </Box>
          </DiaryListContext.Provider>
        </Container>
      </Page>
    );
  };

  return <ShowResource {...{ resource, on_success: render_data }} />;
};

export default DiaryListView;

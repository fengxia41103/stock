import React, { useState } from "react";

import { Box, Container } from "@mui/material";

import { Page, ShowResource } from "@fengxia41103/storybook";

import ListDiary from "src/components/diary/ListDiary";

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

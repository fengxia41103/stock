import { Box, Container } from "@material-ui/core";
import React, { useState } from "react";


import Page from "src/components/common/Page";
import ShowResource from "src/components/common/ShowResource";
import ListDiary from "src/components/diary/ListDiary";

import DiaryListContext from "./context.jsx";


export default function DiaryListView() {
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
}

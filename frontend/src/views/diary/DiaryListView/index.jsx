import React, { useState, useContext } from "react";
import { Box, Container } from "@material-ui/core";
import ListDiary from "src/components/diary/ListDiary";
import Page from "src/components/Page";
import DiaryListContext from "./context.jsx";
import Fetch from "src/components/Fetch";
import GlobalContext from "src/context";

export default function DiaryListView() {
  const { api } = useContext(GlobalContext);
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

  return <Fetch {...{ api, resource, render_data }} />;
}

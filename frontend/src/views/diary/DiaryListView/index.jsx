import React from "react";
import { Box, Container } from "@material-ui/core";
import ListDiary from "src/components/diary/ListDiary";
import Page from "src/components/Page";

export default function DiaryListView() {
  return (
    <Page title="Notes">
      <Container maxWidth={false}>
        <Box mt={1}>
          <ListDiary />
        </Box>
      </Container>
    </Page>
  );
}

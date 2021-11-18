import { Container, Button, Box, Typography } from "@material-ui/core";
import React from "react";

import Page from "src/components/common/Page";
import AddDiaryEditor from "src/components/diary/AddDiaryEditor";

export default function AddDiaryView() {
  return (
    <Page title="New Notes">
      <Container maxWidth={false}>
        <Typography variant="h1">Add a New Note</Typography>
        <Box mt={3}>
          <AddDiaryEditor />
          <Button href="/notes">Cancel</Button>
        </Box>
      </Container>
    </Page>
  );
}

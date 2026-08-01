import React from "react";

import { Box, Button, Container, Typography } from "@mui/material";

import { Page } from "@/components/shared";

import AddDiaryEditor from "@Components/diary/AddDiaryEditor";

const AddDiaryView = () => {
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
};

export default AddDiaryView;

import React, { useContext, useState } from "react";
import GlobalContext from "src/context";
import {
  Box,
  Container,
  Button,
  Typography,
  List,
  ListItem,
  Card,
  CardHeader,
  CardContent,
} from "@material-ui/core";
import Fetch from "src/components/Fetch";
import { map } from "lodash";
import AddDiaryEditor from "src/components/diary/AddDiaryEditor";
import ListDiaryEntry from "src/components/diary/ListDiary/entry";
import AddIcon from "@material-ui/icons/Add";
import DropdownMenu from "src/components/DropdownMenu";
import Page from "src/components/Page";

export default function DiaryListView() {
  const { api } = useContext(GlobalContext);
  const [resource] = useState("/diaries");
  const [toAdd, setToAdd] = useState(false);

  const menu_content = (
    <List>
      <ListItem>
        <Button color="primary" onClick={() => setToAdd(!toAdd)}>
          <AddIcon />
          Add new note
        </Button>
      </ListItem>
    </List>
  );

  const render_data = resp => {
    const data = resp.objects;
    const diaries = map(data, d => <ListDiaryEntry key={d.id} diary={d} />);

    return (
      <Page title="Notes">
        <Container maxWidth={false}>
          <Box mt={1}>
            <Card>
              <CardHeader
                title={<Typography variant="h3">My Notes</Typography>}
                action={<DropdownMenu content={menu_content} />}
              />
              <CardContent>{toAdd ? <AddDiaryEditor /> : diaries}</CardContent>
            </Card>
          </Box>
        </Container>
      </Page>
    );
  };

  // render as usual to get data
  return <Fetch {...{ api, resource, render_data }} />;
}

import { map } from "lodash";
import PropTypes from "prop-types";
import React, { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  Typography,
} from "@mui/material";

import { DropdownMenu } from "@fengxia41103/storybook";

import PollResource from "@Components/common/PollResource";
import ListDiaryEntry from "@Components/diary/ListDiaryEntry";

const ListDiary = (props) => {
  // props
  const { stock } = props;

  // states
  const filter = stock ? `?content__contains=${stock.symbol}` : "";
  const [resource] = useState(`/diaries${filter}`);

  // renders
  const menu_content = (
    <List>
      <ListItem>
        <Button color="secondary" href="/notes/add">
          <AddIcon />
          Add new note
        </Button>
      </ListItem>
    </List>
  );

  const render_data = (resp) => {
    const diaries = resp.objects;

    const diary_entries = map(diaries, (d) => (
      <Box key={d.id} mb={2}>
        <ListDiaryEntry diary={d} />
      </Box>
    ));

    return (
      <Card>
        <CardHeader
          title={<Typography variant="h3">My Notes</Typography>}
          action={<DropdownMenu content={menu_content} />}
        />

        <CardContent>{diary_entries}</CardContent>
      </Card>
    );
  };

  // render as usual to get data
  return <PollResource {...{ resource, on_success: render_data }} />;
};

ListDiary.propTypes = {
  stock: PropTypes.shape({
    id: PropTypes.number,
    symbol: PropTypes.string,
  }),
};

export default ListDiary;

import React, { useContext, useState } from "react";
import GlobalContext from "src/context";
import {
  Button,
  Box,
  Typography,
  List,
  ListItem,
  Card,
  CardHeader,
  CardContent,
} from "@material-ui/core";
import Fetch from "src/components/common/Fetch";
import { map } from "lodash";
import AddDiaryEditor from "src/components/diary/AddDiaryEditor";
import ListDiaryEntry from "src/components/diary/ListDiaryEntry";
import AddIcon from "@material-ui/icons/Add";
import DropdownMenu from "src/components/common/DropdownMenu";
import PropTypes from "prop-types";

export default function ListDiary(props) {
  const { api } = useContext(GlobalContext);
  const { stock } = props;

  let resource_uri = "/diaries";
  if (!!stock) {
    resource_uri += `?content__contains=${stock.symbol}`;
  }
  const [resource] = useState(resource_uri);
  const [toRefresh, setToRefresh] = useState(false);
  const [toAdd, setToAdd] = useState(false);

  const menu_content = (
    <List>
      <ListItem>
        <Button color="secondary" onClick={() => setToAdd(!toAdd)}>
          <AddIcon />
          Add new note
        </Button>
      </ListItem>
    </List>
  );

  const to_refresh = () => setToRefresh(!toRefresh);

  const render_data = (resp) => {
    const diaries = resp.objects;

    const diary_entries = map(diaries, (d) => (
      <Box key={d.id} mb={2}>
        <ListDiaryEntry diary={d} to_refresh={to_refresh} />
      </Box>
    ));

    let content = diary_entries;
    if (toAdd) {
      content = (
        <Box mt={1}>
          <AddDiaryEditor
            stock={!!!stock ? stock : stock.id}
            to_refresh={to_refresh}
          />
          <Button variant="text" onClick={() => setToAdd(false)}>
            Cancel
          </Button>
        </Box>
      );
    }
    return (
      <Card>
        <CardHeader
          title={<Typography variant="h3">My Notes</Typography>}
          action={<DropdownMenu content={menu_content} />}
        />

        <CardContent>{content}</CardContent>
      </Card>
    );
  };

  // render as usual to get data
  return <Fetch {...{ key: toRefresh, api, resource, render_data }} />;
}

ListDiary.propTypes = {
  stock: PropTypes.shape({
    id: PropTypes.number.isRequired,
    symbol: PropTypes.string.isRequired,
  }),
};

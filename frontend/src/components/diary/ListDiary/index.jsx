import React, { useContext, useState } from "react";
import GlobalContext from "src/context";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";
import {
  Button,
  Box,
  Typography,
  List,
  ListItem,
  Card,
  CardHeader,
  CardContent,
  Grid,
} from "@material-ui/core";
import Fetch from "src/components/Fetch";
import { map, isUndefined } from "lodash";
import AddDiaryEditor from "src/components/diary/AddDiaryEditor";
import ListDiaryEntry from "src/components/diary/ListDiaryEntry";
import AddIcon from "@material-ui/icons/Add";
import DropdownMenu from "src/components/DropdownMenu";
import PropTypes from "prop-types";

export default function ListDiary(props) {
  const { api } = useContext(GlobalContext);
  const { stock: stock_id } = props;

  let resource_uri = "/diaries";
  if (!isUndefined(stock_id)) {
    resource_uri += `?stock__in=${stock_id}`;
  }
  const [resource] = useState(resource_uri);
  const [toRefresh, setToRefresh] = useState(true);
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

    let content = diaries;
    if (toAdd) {
      content = (
        <Box mt={1}>
          <AddDiaryEditor stock={stock_id} />
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
  props: PropTypes.shape({
    stock: PropTypes.number,
  }),
};

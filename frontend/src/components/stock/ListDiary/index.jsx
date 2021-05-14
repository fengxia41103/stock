import React, { useContext, useState } from "react";
import GlobalContext from "src/context";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";
import {
  makeStyles,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  CardHeader,
  CardContent,
  Grid,
} from "@material-ui/core";
import Fetch from "src/components/Fetch";
import { map } from "lodash";
import MDEditor from "@uiw/react-md-editor";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import clsx from "clsx";
import AddDiaryEditor from "src/components/stock/AddDiaryEditor";
import EditDiaryEditor from "src/components/stock/EditDiaryEditor";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import DropdownMenu from "src/components/DropdownMenu";

const useStyles = makeStyles(theme => ({
  diary: {
    color: "#42A5F5",
  },
}));

export default function ListDiary() {
  const { api, host } = useContext(GlobalContext);
  const stock = useContext(StockDetailContext);
  const [resource] = useState(`/diaries?stock__in=${stock.id}`);
  const [toRefresh, setToRefresh] = useState(true);
  const [toAdd, setToAdd] = useState(false);

  const classes = useStyles();

  const render_data = resp => {
    const data = resp.objects;

    const diaries = map(data, d => {
      const created = new Date(d.created);

      // call to update backend
      const on_del = () => {
        const uri = `${host}${d.resource_uri}`;
        fetch(uri, {
          method: "DELETE",
        }).then(setToRefresh(!toRefresh));
      };

      const menu_content = (
        <List>
          <ListItem>
            <Button variant="text" color="primary" onClick={on_del}>
              <DeleteIcon />
              Delete this note
            </Button>
          </ListItem>
        </List>
      );

      return (
        <ListItem key={d.id} divider={true}>
          <Grid
            container
            spacing={1}
            alignItems="flex-start"
            alignContent="flex-start"
          >
            <Grid item lg={1} xs={8}>
              <Button variant="text" className={clsx(classes.diary)}>
                {created.toDateString()}
              </Button>
            </Grid>
            <Grid item lg={1} xs={4}>
              {d.judgement > 1 ? <TrendingDownIcon /> : <TrendingUpIcon />}
              <DropdownMenu content={menu_content} />
            </Grid>
            <Grid item lg={10} xs>
              <EditDiaryEditor diary={d} />
            </Grid>
          </Grid>
        </ListItem>
      );
    });

    return (
      <Card>
        <CardHeader
          title={
            <Grid container spacing={2}>
              <Grid item>
                <Typography variant="h3">My Notes</Typography>
              </Grid>
              <Grid item>
                <AddIcon onClick={() => setToAdd(!toAdd)} />
              </Grid>
            </Grid>
          }
        />
        <CardContent>
          {toAdd ? (
            <AddDiaryEditor stock={stock.id} />
          ) : (
            <List>
              <ListItem></ListItem>
              {diaries}
            </List>
          )}
        </CardContent>
      </Card>
    );
  };

  // render as usual to get data
  return <Fetch {...{ key: toRefresh, api, resource, render_data }} />;
}

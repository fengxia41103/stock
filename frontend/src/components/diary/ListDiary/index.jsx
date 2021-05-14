import React, { useContext, useState } from "react";
import GlobalContext from "src/context";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";
import {
  Button,
  Box,
  Typography,
  List,
  Card,
  CardHeader,
  CardContent,
  Grid,
} from "@material-ui/core";
import Fetch from "src/components/Fetch";
import { map } from "lodash";
import AddDiaryEditor from "src/components/diary/AddDiaryEditor";
import ListDiaryEntry from "./entry";
import AddIcon from "@material-ui/icons/Add";

export default function ListDiary() {
  const { api } = useContext(GlobalContext);
  const stock = useContext(StockDetailContext);
  const [resource] = useState(`/diaries?stock__in=${stock.id}`);
  const [toRefresh, setToRefresh] = useState(true);
  const [toAdd, setToAdd] = useState(false);

  const render_data = resp => {
    const data = resp.objects;
    const diaries = map(data, d => <ListDiaryEntry key={d.id} diary={d} />);

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
          {toAdd ? <AddDiaryEditor stock={stock.id} /> : diaries}
        </CardContent>
      </Card>
    );
  };

  // render as usual to get data
  return <Fetch {...{ key: toRefresh, api, resource, render_data }} />;
}

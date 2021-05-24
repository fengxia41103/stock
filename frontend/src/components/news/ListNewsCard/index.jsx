import React, { useState, useContext } from "react";
import { map, isUndefined } from "lodash";
import Fetch from "src/components/Fetch";
import {
  makeStyles,
  Box,
  Button,
  Card,
  CardContent,
  CardActionArea,
  CardActions,
  CardHeader,
  Typography,
  List,
  ListItem,
  Link,
  Grid,
} from "@material-ui/core";
import GlobalContext from "src/context";
import PropTypes from "prop-types";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  card: {
    height: "100%",
  },
}));

export default function ListNewsCard(props) {
  const { topic, limit } = props;
  const { api } = useContext(GlobalContext);
  const classes = useStyles();
  let limit_count = isUndefined(limit) ? 10 : limit;
  const [resource, setResource] = useState(
    `/news?topic=${topic}&limit=${limit_count}`
  );

  const [prev, setPrev] = useState();
  const [next, setNext] = useState();

  const on_next = next_page => {
    let next_offset = next_page.split("=").pop();
    setResource(
      `/news?topic=${topic}&limit=${limit_count}&offset=${next_offset}`
    );
  };

  const render_data = resp => {
    const what_is_next = resp.meta.next;
    const news = resp.objects;
    const news_list = map(news, n => {
      return (
        <ListItem key={n.id} divider={true}>
          <Link href={n.link}>{n.title}</Link>
        </ListItem>
      );
    });
    return (
      <Card className={clsx(classes.root, classes.card)}>
        <CardHeader
          title={<Typography variant="h3">{topic.toUpperCase()}</Typography>}
        />
        <CardActionArea>
          <CardContent>
            <List>{news_list}</List>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Grid container spacing={1} justify="flex-end" alignItems="center">
            <Button
              variant="text"
              color="primary"
              onClick={() => on_next(what_is_next)}
            >
              Load More
            </Button>
          </Grid>
        </CardActions>
      </Card>
    );
  };

  return <Fetch {...{ key: resource, api, resource, render_data }} />;
}

ListNewsCard.propTypes = {
  topic: PropTypes.string.isRequired,
  limit: PropTypes.number,
};

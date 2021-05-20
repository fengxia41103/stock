import React, { useState, useContext } from "react";
import { map } from "lodash";
import Fetch from "src/components/Fetch";
import {
  makeStyles,
  Link,
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
} from "@material-ui/core";
import GlobalContext from "src/context";
import PropTypes from "prop-types";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  avatar: {
    backgroundColor: "#d52349",
    height: 56,
    width: 56,
  },
  card: {
    height: "100%",
  },
}));

export default function ListNewsCard(props) {
  const { api } = useContext(GlobalContext);
  const { topic } = props;
  const [resource] = useState(`/news?topic=${topic}&limit=10`);

  const classes = useStyles();

  const render_data = resp => {
    const news = resp.objects;
    const news_list = map(news, n => {
      return (
        <ListItem key={n.id} divider={true}>
          <Link href={n.link}>{n.title.toUpperCase()}</Link>
        </ListItem>
      );
    });
    return (
      <Card className={clsx(classes.root, classes.card)}>
        <CardHeader title={<Typography variant="h3">{topic}</Typography>} />
        <CardContent>
          <List>{news_list}</List>
        </CardContent>
      </Card>
    );
  };

  return <Fetch {...{ api, resource, render_data }} />;
}

ListNewsCard.propTypes = {
  topic: PropTypes.string.isRequired,
};

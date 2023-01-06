import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Link,
  List,
  ListItem,
  makeStyles,
  Typography,
} from "@mui/material";
import clsx from "clsx";
import { isEmpty, isNull, isUndefined, map } from "lodash";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import ShowResource from "src/components/common/ShowResource";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  card: {
    height: "100%",
  },
}));

export default function ListNewsCard(props) {
  const { topic, limit, searching } = props;
  const [resource, setResource] = useState();
  const classes = useStyles();
  const limit_count = isUndefined(limit) ? 10 : limit;

  const get_uri = () => {
    let base_uri = `/news?topic=${topic}&limit=${limit_count}`;
    if (searching !== "") {
      base_uri += `&title__contains=${searching}`;
    }

    return base_uri;
  };

  // MUST: use effect to set initial URI because of searching string.
  useEffect(() => {
    setResource(get_uri());
  }, [searching, get_uri]);

  const on_next = (next_page) => {
    if (!isNull(next_page)) {
      const next_offset = next_page.split("=").pop();
      setResource(get_uri() + `&offset=${next_offset}`);
    }
  };

  const render_data = (resp) => {
    const what_is_next = resp.meta.next;

    const news = resp.objects;

    const news_list = map(news, (n) => {
      return (
        <ListItem key={n.id} divider={true}>
          <Link href={n.link}>
            {n.title}
            <Typography variant="h6" color="secondary">
              ({n.source})
            </Typography>
          </Link>
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
            <List>{isEmpty(news) ? "No matching data." : news_list}</List>
          </CardContent>
        </CardActionArea>
        <CardActions>
          {isEmpty(news) || news.length < limit_count ? null : (
            <Grid
              container
              spacing={1}
              justifyContent="flex-end"
              alignItems="center"
            >
              <Button
                variant="text"
                color="secondary"
                onClick={() => on_next(what_is_next)}
              >
                Load More
              </Button>
            </Grid>
          )}
        </CardActions>
      </Card>
    );
  };

  return <ShowResource {...{ resource, on_success: render_data }} />;
}

ListNewsCard.propTypes = {
  topic: PropTypes.string.isRequired,
  searching: PropTypes.string,
  limit: PropTypes.number,
};

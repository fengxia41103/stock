import { map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Link,
  List,
  ListItem,
  Typography,
} from "@mui/material";

import { ColoredNumber } from "@fengxia41103/storybook";

import TaskNotificationIcon from "@Components/task/TaskNotificationIcon";


const MoverCard = (props) => {
  const { title, subtitle, stocks, value, roundTo } = props;
  

  const entries = map(stocks, (s) => {
    return (
      <ListItem key={s.symbol} divider dense>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs="auto">
            <ColoredNumber {...{ val: s[value], roundTo }} />
          </Grid>
          <Grid
            item
            xs
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box display="inline">
              <Link href={`/stocks/${s.stock_id}/historical/price`}>
                {s.symbol}
              </Link>
            </Box>
            <TaskNotificationIcon id={s.stock_id} />
          </Grid>
        </Grid>
      </ListItem>
    );
  });

  const subHeader = (
    <Typography variant="body2" color="secondary">
      {subtitle}
    </Typography>
  );

  return (
    <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader
        title={<Typography variant="h3">{title}</Typography>}
        subheader={subHeader}
      />
      <CardContent>
        {stocks.length ? <List>{entries}</List> : "No stock for this list"}
      </CardContent>
    </Card>
  );
};

MoverCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      stock_id: PropTypes.number,
      symbol: PropTypes.string,

      // stock's own resource uri
      stock: PropTypes.string,
    }),
  ).isRequired,
  value: PropTypes.string.isRequired,
  roundTo: PropTypes.number,
};

export default MoverCard;

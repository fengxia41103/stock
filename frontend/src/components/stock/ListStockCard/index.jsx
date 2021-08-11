import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  makeStyles,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  Divider,
  Grid,
  Chip,
} from "@material-ui/core";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import { map, isUndefined } from "lodash";
import DropdownMenu from "src/components/common/DropdownMenu";
import RecentPriceSparkline from "src/components/stock/RecentPriceSparkline";
import ColoredNumber from "src/components/common/ColoredNumber";
import StockSymbol from "src/components/stock/StockSymbol";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";

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

export default function ListStockCard(props) {
  const { stocks, index, group_by, actions } = props;
  const classes = useStyles();

  let title;
  switch (group_by) {
    case "last_reporting_date":
      title = index === "null" ? "ETF" : index;
      break;

    default:
      title = index;
      break;
  }

  // if any menu contents
  let menu_content = null;

  if (!isUndefined(actions)) {
    const action_menu_content_list = map(actions, (action, index) => (
      <ListItem key={index}>{action}</ListItem>
    ));
    menu_content = <List>{action_menu_content_list}</List>;
  }

  const links = map(stocks, s => {
    return (
      <Grid key={s.id} container spacing={1} alignItems="center">
        <Grid item xs={2}>
          <StockSymbol {...s} />
        </Grid>
        <Grid item xs={4}>
          <RecentPriceSparkline stock={s.id} />
        </Grid>
        <Grid item xs={2}>
          <Typography variant="body2">P/E:</Typography>
          <ColoredNumber val={s.pe} />
        </Grid>
        <Grid item xs={2}>
          <Typography variant="body2">ROE:</Typography>
          <ColoredNumber val={s.roe} />
        </Grid>
        <Grid item xs={1}>
          {s.last_lower > 1 ? (
            <Chip
              avatar={<TrendingDownIcon />}
              variant={s.last_lower > 30 ? "default" : "outlined"}
              size="small"
              color={s.last_lower > 30 ? "secondary" : "default"}
              label={s.last_lower}
            />
          ) : null}
        </Grid>
      </Grid>
    );
  });

  return (
    <Card className={clsx(classes.root, classes.card)}>
      <CardHeader
        title={<Typography variant="h3">{title}</Typography>}
        subheader={<Typography variant="body2">{group_by}</Typography>}
        avartar={
          <Avatar className={classes.avatar}>
            <CalendarTodayIcon />
          </Avatar>
        }
        action={<DropdownMenu content={menu_content} />}
      />

      <Divider />
      <CardContent>{links}</CardContent>
    </Card>
  );
}

ListStockCard.propTypes = {
  index: PropTypes.string.isRequired,
  group_by: PropTypes.string,
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      symbol: PropTypes.string.isRequired,
      pe: PropTypes.number,
      ps: PropTypes.number,
      pb: PropTypes.number,
      resource_uri: PropTypes.string,
    })
  ).isRequired,
  actions: PropTypes.arrayOf(PropTypes.any),
};

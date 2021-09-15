
import {
  makeStyles,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  Grid,
  Chip,
  Tooltip,
} from "@material-ui/core";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import ErrorIcon from "@material-ui/icons/Error";
import clsx from "clsx";
import { map, isUndefined } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import ColoredNumber from "src/components/common/ColoredNumber";
import DropdownMenu from "src/components/common/DropdownMenu";
import RecentPriceSparkline from "src/components/stock/RecentPriceSparkline";
import StockSymbol from "src/components/stock/StockSymbol";

const useStyles = makeStyles((theme) => ({
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
    const action_menu_content_list = map(actions, (action, i) => (
      <ListItem key={i}>{action}</ListItem>
    ));
    menu_content = <List>{action_menu_content_list}</List>;
  }

  const links = map(stocks, (s) => {
    return (
      <ListItem key={s.id} divider={true}>
        <Grid container spacing={1} alignItems="center">
          <Grid item lg={2} md={2} sm={3} xs={3}>
            <StockSymbol {...s} />
          </Grid>
          <Grid item lg={4} md={4} sm={3} xs={3}>
            <RecentPriceSparkline stock={s.id} />
          </Grid>
          <Grid item lg={2} sm={2} xs={2}>
            {s.last_lower > 1 ? (
              <Tooltip title="Significant price drop has been detected.">
                <Chip
                  avatar={
                    <Avatar>
                      <ErrorIcon />
                    </Avatar>
                  }
                  variant={s.last_lower > 30 ? "default" : "outlined"}
                  size="small"
                  color={s.last_lower > 30 ? "secondary" : "primary"}
                  label={s.last_lower}
                />
              </Tooltip>
            ) : null}
          </Grid>
          <Grid item lg={2} sm={2} xs={2}>
            {s.price_to_cash_premium ? (
              <>
                <Typography variant="body1">P/C</Typography>
                <ColoredNumber val={s.price_to_cash_premium} />
              </>
            ) : null}
          </Grid>
          <Grid item lg={2} sm={2} xs={2}>
            {s.pe ? (
              <>
                <Typography variant="body1">P/E</Typography>
                <ColoredNumber val={s.pe} />
              </>
            ) : null}
          </Grid>
        </Grid>
      </ListItem>
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

      <CardContent>
        <List>{links}</List>
      </CardContent>
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
    }),
  ).isRequired,
  actions: PropTypes.arrayOf(PropTypes.any),
};

import { isUndefined, map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ErrorIcon from "@mui/icons-material/Error";
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  List,
  ListItem,
  Tooltip,
  Typography,
} from "@mui/material";

import { ColoredNumber } from "@fengxia41103/storybook";

import RecentPriceSparkline from "@Components/stock/RecentPriceSparkline";
import StockSymbol from "@Components/stock/StockSymbol";

const ListStockCard = (props) => {
  // props
  const { stocks, index, group_by, actions } = props;

  // hooks

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
  let action_content = null;

  if (!isUndefined(actions)) {
    action_content = (
      <Box display="flex" gap={1}>
        {map(actions, (action, i) => (
          <React.Fragment key={i}>{action}</React.Fragment>
        ))}
      </Box>
    );
  }

  const links = map(stocks, (s) => {
    return (
      <ListItem key={s.id} divider>
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
    <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader
        title={<Typography variant="h3">{title}</Typography>}
        subheader={<Typography variant="body2">{group_by}</Typography>}
        avartar={
          <Avatar sx={{ width: 60, height: 60 }}>
            <CalendarTodayIcon />
          </Avatar>
        }
        action={action_content}
      />

      <CardContent>
        <List>{links}</List>
      </CardContent>
    </Card>
  );
};

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
  actions: PropTypes.arrayOf(PropTypes.node),
};

export default ListStockCard;

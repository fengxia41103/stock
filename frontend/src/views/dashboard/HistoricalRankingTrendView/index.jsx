import React, { useState, useContext, useEffect } from "react";
import Fetch from "src/components/Fetch";
import {
  makeStyles,
  Box,
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Link,
  Typography,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  List,
  ListItem,
} from "@material-ui/core";
import Page from "src/components/Page";
import GlobalContext from "src/context";
import MoverCard from "src/components/dashboard/MoverCard";
import { map, sortBy, reverse, filter, groupBy, forEach } from "lodash";
import moment from "moment";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  diary: {
    color: "#D52349",
  },
}));

export default function HistoricalRankingTrendView(props) {
  const DATE_FORMAT = "YYYY-MM-DD";
  const classes = useStyles();
  const { api } = useContext(GlobalContext);
  const [resource, setResource] = useState("");
  const [today, setToday] = useState(moment());

  // default back track one week from today
  const [backWeek, setBackWeek] = useState(1);

  const [follow, setFollow] = useState("gainer");

  // adjusting the starting point, handling weekends
  const adjust_today = () => {
    let temp_now = moment(today);

    let adjust_in_day;
    switch (temp_now.day()) {
      case 0:
        // sunday
        adjust_in_day = -2;
        break;
      case 6:
        // saturday
        adjust_in_day = -1;
        break;

      default:
        adjust_in_day = 0;
        break;
    }

    // NOTE: must set `end` first because this modifies the `temp_now`
    // in place!
    let end = temp_now.add(adjust_in_day, "days").format(DATE_FORMAT);
    let start = temp_now.add(backWeek * -7, "days").format(DATE_FORMAT);
    setResource(`/historicals?on__range=${start},${end}&order_by=-on`);
  };

  useEffect(() => {
    adjust_today(today);
  });

  const today_change = event => {
    const now = moment(event.target.value, DATE_FORMAT);

    // update state
    setToday(now);

    // update resource
    adjust_today();
  };

  const backWeek_change = event => {
    setBackWeek(event.target.value);
    adjust_today();
  };

  const follow_change = event => {
    setFollow(event.target.value);
  };

  const select_follow = (
    <FormControl component="fieldset">
      <FormLabel component="legend">Trending By</FormLabel>
      <RadioGroup
        aria-label="Trending By"
        name="follow"
        value={follow}
        onChange={follow_change}
        row
      >
        <FormControlLabel value="gainer" control={<Radio />} label="Gainer" />
        <FormControlLabel value="loser" control={<Radio />} label="Loser" />
        <FormControlLabel value="mover" control={<Radio />} label="Mover" />
        <FormControlLabel
          value="volatility"
          control={<Radio />}
          label="Volatility"
        />
      </RadioGroup>
    </FormControl>
  );

  const render_data = data => {
    let stocks = data.objects;

    // compute values
    stocks = map(stocks, s => {
      return {
        gain: ((s.close_price - s.open_price) / s.open_price) * 100,
        volatility: ((s.high_price - s.low_price) / s.low_price) * 100,
        ...s,
      };
    });

    const group_by_on = groupBy(stocks, s => s.on);

    let ranks = [];
    forEach(group_by_on, (histories, on) => {
      let picks;

      switch (follow) {
        case "gainer":
          picks = reverse(
            sortBy(
              filter(histories, s => s.gain > 0),
              s => s.gain
            )
          ).slice(0, 10);
          break;

        case "loser":
          picks = sortBy(
            filter(histories, s => s.gain < 0),
            s => s.gain
          ).slice(0, 10);
          break;

        case "mover":
          picks = reverse(
            sortBy(histories, s => s.vol_over_share_outstanding)
          ).slice(0, 10);
          break;

        case "volatility":
          picks = reverse(sortBy(histories, s => s.volatility)).slice(0, 10);
          break;

        default:
          break;
      }

      ranks.push({ on: on, picks: picks });
    });

    // compute a score score is 1-10, each symbol computes a score by
    // adding its score of a day when it's on the ranking chart. So,
    // the highest score indicates this stock shows up more, or shoots
    // high.
    const symbols = [...new Set(map(stocks, s => s.symbol))];
    let scores = {};

    forEach(symbols, symbol => {
      let score = 0;
      forEach(ranks, r => {
        // max score is the length of the picks. If you only have two
        // symbols on the list, then top score will be 2; if you have
        // top 10, then it will be 10, and so on.
        const picked_symbols = map(r.picks, p => p.symbol);
        const max_score = picked_symbols.length;

        let index = picked_symbols.indexOf(symbol);
        if (index > -1) {
          score += max_score - index;
        }
      });

      scores[symbol] = score;
    });

    console.log(scores);

    const trends = map(ranks, r => {
      const picks = map(r.picks, p => {
        return (
          <ListItem key={p.stock_id}>
            <Link href={`/stocks/${p.stock_id}/historical/price`}>
              {p.symbol}
            </Link>
          </ListItem>
        );
      });
      return (
        <Grid item key={r.on} lg={1} sm={2} xs={3}>
          <Typography className={clsx(classes.diary)}>{r.on}</Typography>
          <Box mt={2}>
            <List>{picks}</List>
          </Box>
        </Grid>
      );
    });

    return (
      <Page title="Today">
        <Container maxWidth={false}>
          <Box mt={1}>
            <Card>
              <CardContent>
                <Grid container spacing={1}>
                  <Grid item xs>
                    <TextField
                      label="Pick a date"
                      type="date"
                      value={today.format(DATE_FORMAT)}
                      onChange={today_change}
                      fullWidth={true}
                    />
                  </Grid>
                  <Grid item xs>
                    <TextField
                      label="Backtrack in Weeks"
                      type="number"
                      value={backWeek}
                      onChange={backWeek_change}
                      fullWidth={true}
                    />
                  </Grid>
                  <Grid item xs>
                    {select_follow}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          <Box mt={3}>
            <Card>
              <CardHeader
                title={
                  <Typography variant="h3">
                    Top {follow.toUpperCase()} Trending
                  </Typography>
                }
              />
              <CardContent>
                <Grid container spacing={1}>
                  {trends}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Page>
    );
  };

  return <Fetch {...{ api, resource, render_data }} />;
}

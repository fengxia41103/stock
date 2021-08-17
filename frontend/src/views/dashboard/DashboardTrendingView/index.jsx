import React, { useState, useContext, useEffect } from "react";
import Fetch from "src/components/common/Fetch";
import {
  Box,
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Typography,
  FormGroup,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  List,
  ListItem,
  Switch,
} from "@material-ui/core";
import Page from "src/components/common/Page";
import GlobalContext from "src/context";
import { map, sortBy, reverse, groupBy, forEach } from "lodash";
import moment from "moment";
import RankingScores from "src/components/dashboard/RankingScores";
import { get_highlights } from "src/utils/helper.jsx";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import DailyRankingBarRaceChart from "src/components/dashboard/DailyRankingBarRaceChart";
import StockRankingGrid from "src/components/dashboard/StockRankingGrid";

export default function DashboardTrendingView() {
  const DATE_FORMAT = "YYYY-MM-DD";
  const { api } = useContext(GlobalContext);
  const [resource, setResource] = useState("");
  const [today, setToday] = useState(moment());
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const [useTimeLapseRanking, setUseTimeLapseRanking] = useState(false);

  // default back track one week from today
  const [backWeek, setBackWeek] = useState("1");

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
    setEnd(temp_now.add(adjust_in_day, "d").format(DATE_FORMAT));
    setStart(temp_now.add(-1 * parseInt(backWeek), "w").format(DATE_FORMAT));
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

  const backWeek_change = (event, val) => {
    setBackWeek(val);
    adjust_today();
  };

  const follow_change = event => {
    setFollow(event.target.value);
  };

  const select_follow = (
    <FormControl component="fieldset">
      <RadioGroup
        aria-label="Trending By"
        name="follow"
        value={follow}
        onChange={follow_change}
        row
      >
        <FormControlLabel value="gainer" control={<Radio />} label="Gainer" />
        <FormControlLabel value="loser" control={<Radio />} label="Loser" />
        <FormControlLabel value="volume" control={<Radio />} label="Volume" />
        <FormControlLabel
          value="volatility"
          control={<Radio />}
          label="Volatility"
        />
        <FormControlLabel
          value="last lower"
          control={<Radio />}
          label="Last Lower"
        />
        <FormControlLabel
          value="next better"
          control={<Radio />}
          label="Next Better"
        />
      </RadioGroup>
    </FormControl>
  );

  let symbols = [],
    highlights = [];

  // map option to data key
  let order_by = null;
  switch (follow) {
    case "gainer":
    case "loser":
      order_by = "gain";
      break;
    case "volume":
      order_by = "vol_over_share_outstanding";
      break;
    case "volatility":
      order_by = "volatility";
      break;

    case "last lower":
      order_by = "last_lower";
      break;
    case "next better":
      order_by = "next_better";
      break;

    default:
      order_by = "gain";
      break;
  }

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

    // all symbols are color-coded
    symbols = [...new Set(map(stocks, s => s.symbol))];
    if (symbols.length !== highlights.length) {
      // only recompute highlight color if list length is different
      highlights = get_highlights(symbols);
    }

    // group by date
    const group_by_on = groupBy(stocks, s => s.on);

    let ranks = [];
    forEach(group_by_on, (histories, on) => {
      let picks = sortBy(histories, s => s[order_by]);

      // for positive indexes, we rank high->low
      if (follow !== "loser") {
        picks = reverse(picks);
      }
      ranks.push({ category: on, stocks: picks.slice(0, 10) });
    });

    return (
      <Page title="Trending">
        <Container maxWidth={false}>
          <Box mt={1}>
            <Card>
              <CardContent>
                <List>
                  <ListItem>
                    <Grid container spacing={1}>
                      <Grid item xs>
                        <TextField
                          label="Pick an END Date"
                          type="date"
                          value={today.format(DATE_FORMAT)}
                          onChange={today_change}
                          fullWidth={true}
                        />
                      </Grid>
                      <Grid item xs>
                        <ToggleButtonGroup
                          value={backWeek}
                          exclusive
                          onChange={backWeek_change}
                          aria-label="back track in weeks"
                        >
                          <ToggleButton value="1" aria-label="1">
                            1W
                          </ToggleButton>
                          <ToggleButton value="2" aria-label="1">
                            2W
                          </ToggleButton>
                          <ToggleButton value="3" aria-label="1">
                            3W
                          </ToggleButton>
                          <ToggleButton value="4" aria-label="1">
                            4W
                          </ToggleButton>
                          <ToggleButton value="5" aria-label="2">
                            1M
                          </ToggleButton>
                          <ToggleButton value="13" aria-label="3">
                            3M
                          </ToggleButton>
                          <ToggleButton value="26" aria-label="3">
                            6M
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Grid>
                    </Grid>
                  </ListItem>
                  <ListItem>{select_follow}</ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          <Box mt={1}>
            <Card>
              <CardHeader
                title={
                  <Typography variant="h3">
                    Top {follow.toUpperCase()} Trending
                  </Typography>
                }
                subheader={
                  <Typography variant="body2">
                    {start} to {end}
                  </Typography>
                }
                action={
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          color="secondary"
                          checked={useTimeLapseRanking}
                          onChange={() =>
                            setUseTimeLapseRanking(!useTimeLapseRanking)
                          }
                          inputProps={{ "aria-label": "controlled" }}
                        />
                      }
                      label={
                        useTimeLapseRanking
                          ? "On Time Lapse View"
                          : "On Static View"
                      }
                    />
                  </FormGroup>
                }
              />
              <CardContent>
                {useTimeLapseRanking ? (
                  <Box mt={1}>
                    <DailyRankingBarRaceChart
                      {...{
                        ranks,
                        order_by,
                        highlights,
                        negative: follow === "loser" ? true : false,
                      }}
                    />
                  </Box>
                ) : (
                  <StockRankingGrid {...{ ranks, order_by, highlights }} />
                )}
              </CardContent>
            </Card>
          </Box>

          <RankingScores {...{ stocks, ranks, start, end }} />
        </Container>
      </Page>
    );
  };

  return <Fetch {...{ api, resource, render_data }} />;
}

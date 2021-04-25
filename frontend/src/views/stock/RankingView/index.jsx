import React, { useState } from "react";
import { map } from "lodash";
import {
  makeStyles,
  Avatar,
  Box,
  Container,
  Divider,
  Grid,
  TextField,
  Card,
  CardContent,
  Typography,
} from "@material-ui/core";
import WhatshotIcon from "@material-ui/icons/Whatshot";
import Page from "src/components/Page";
import Rank from "./rank.jsx";

const useStyles = makeStyles(theme => ({
  avatar: {
    backgroundColor: "#d52349",
    height: 56,
    width: 56,
  },
}));

function RankingView() {
  const classes = useStyles();
  const [interests, setInterests] = useState([]);

  // how many in a rank I'm interested in, eg. top 10
  const [top, setTop] = useState(5);

  // thresholds
  // well, there seems to be certain _filter_ method
  // that sets up a threhold on an index, which essentially
  // captures someone's judgement of _what is good/safe_.
  // key: API rank data's key
  // val: ">=" or "<="
  const [thresholds, setThresholds] = useState({
    roe: ">=20",
    current_ratio: ">=2",
    quick_ratio: ">=2",
    equity_multiplier: "<=2.5",
    dividend_payout_ratio: ">=25",
    net_income_margin: ">=20",
    gross_margin: ">=40",
    ocf_over_net_income: ">=100",
  });

  const handle_interests_change = event => {
    // inputs are space delimited values
    const tmp = event.target.value
      .split(/\s+/g)
      .map(x => x.trim())
      .map(x => x.toUpperCase());

    setInterests(tmp);
  };

  const handle_top_change = event => setTop(event.target.value);

  const handle_ratio_change = event => {
    const value = event.target.value;
    let old_thresholds = thresholds;
    old_thresholds[event.target.name] = value;
    setThresholds(old_thresholds);
  };

  const get_contrast = background => {
    // func to compute font color to contrast w/ background color
    return parseInt(background, 16) > 0xffffff / 2 ? "black" : "white";
  };

  // highlight background color choices
  let highlights = map(interests, i => {
    const bk_color = Math.floor(Math.random() * 16777215).toString(16);
    const font_color = get_contrast(bk_color);
    return [
      i,
      {
        background: bk_color,
        font: font_color,
      },
    ];
  });
  highlights = Object.fromEntries(highlights);

  const ranking_mapping = {
    "By ROE Analysis": "/stock-ranks",
    "By Balance Sheet Analysis": "/balance-ranks",
    "By Income Statement Analysis": "/income-ranks",
    "By Cash Flow Statement Analysis": "/cash-ranks",
  };
  const rankings = map(ranking_mapping, (resource, title) => {
    return (
      <Box key={resource} mb={3}>
        <Card>
          <CardContent>
            <Box mb={3}>
              <Grid container justify="space-between" spacing={3}>
                <Grid item>
                  <Typography variant="h3" color="textPrimary">
                    {title}
                  </Typography>
                </Grid>
                <Grid item>
                  <Avatar className={classes.avatar}>
                    <WhatshotIcon />
                  </Avatar>
                </Grid>
              </Grid>
              <Divider />
            </Box>
            <Rank
              {...{
                resource,
                highlights,
                top,
                thresholds,
                handle_ratio_change,
              }}
            />
          </CardContent>
        </Card>
      </Box>
    );
  });

  // render
  return (
    <Page title="Rankings">
      <Container maxWidth={false}>
        <Typography variant="h1">Stock Rankings</Typography>
        <Box mt={3}>
          <Card>
            <CardContent>
              <Grid container spacing={1}>
                <Grid item lg={6} xs={12}>
                  <TextField
                    label="Filter by Symbol"
                    value={interests.join(" ")}
                    onChange={handle_interests_change}
                    fullWidth={true}
                  />
                </Grid>
                <Grid item lg={6} xs={12}>
                  <TextField
                    label="View Top Ranks"
                    value={top}
                    type="number"
                    onChange={handle_top_change}
                    fullWidth={true}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
        <Box mt={3}>{rankings}</Box>
      </Container>
    </Page>
  );
}
export default RankingView;

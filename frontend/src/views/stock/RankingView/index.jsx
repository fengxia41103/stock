import React, { useState } from "react";
import { map, clone } from "lodash";
import {
  Box,
  Container,
  Grid,
  TextField,
  Card,
  CardContent,
  Typography,
} from "@material-ui/core";
import Page from "src/components/common/Page";
import StockRanking from "src/components/stock/StockRanking";
import { get_highlights } from "src/utils/helper.jsx";

export default function RankingView() {
  const [ranking_resources] = useState({
    "By ROE Analysis": "/stock-ranks",
    "By Balance Sheet Analysis": "/balance-ranks",
    "By Income Statement Analysis": "/income-ranks",
    "By Cash Flow Statement Analysis": "/cash-ranks",
    "By Valuation Ratios": "/valuation-ranks",
  });
  const [interests, setInterests] = useState([]);
  const [highlights, setHighlights] = useState({});

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

  const handle_interests_change = (event) => {
    // inputs are space delimited values
    const tmp = event.target.value
      .split(/\s+/g)
      .map((x) => x.trim())
      .map((x) => x.toUpperCase());

    setInterests(tmp);
    setHighlights(get_highlights(tmp));
  };

  const handle_top_change = (event) => setTop(event.target.value);

  const handle_ratio_change = (event) => {
    let old_thresholds = clone(thresholds);

    old_thresholds[event.target.name] = event.target.value;
    setThresholds(old_thresholds);
  };

  const rankings = map(ranking_resources, (resource, title) => {
    return (
      <Box key={resource} mb={1}>
        <StockRanking
          {...{
            title,
            resource,
            highlights,
            top,
            thresholds,
            handle_ratio_change,
          }}
        />
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
                <Grid item lg={6} sm={6} xs={12}>
                  <TextField
                    label="Filter by Symbol"
                    value={interests.join(" ")}
                    onChange={handle_interests_change}
                    fullWidth={true}
                  />
                </Grid>
                <Grid item lg={6} sm={6} xs={12}>
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
        <Box mt={1}>{rankings}</Box>
      </Container>
    </Page>
  );
}

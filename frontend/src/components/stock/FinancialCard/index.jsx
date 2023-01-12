import { isEmpty, map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";

import { DictTable } from "@fengxia41103/storybook";

const FinancialCard = (props) => {
  const {
    data,
    reported,
    ratio,
    in_period_change,
    p2p_growth,
    pcnt,
    analysis,
    normalized,
  } = props;

  // if ETF, skip
  if (isEmpty(data)) {
    return null;
  }

  const mapping = [
    {
      title: "Analysis",
      data: analysis,
    },
    {
      title: "Reported",
      data: reported,
    },
    {
      title: "Ratios",
      data: ratio,
    },
    {
      title: "In-Period Change (%)",
      data: in_period_change,
    },
    {
      title: "Period-to-Period Growth Rates (%)",
      data: p2p_growth,
    },
    {
      title: "A-over-B as %",
      data: pcnt,
    },
  ];

  const cards = map(mapping, (m) => {
    if (!m.data) return null;

    return (
      <Box key={m.title} mt={1}>
        <Card>
          <CardHeader title={<Typography variant="h3">{m.title}</Typography>} />
          <CardContent>
            <DictTable
              data={data}
              interests={m.data}
              normalized={!normalized ? true : normalized}
              chart
            />
          </CardContent>
        </Card>
      </Box>
    );
  });

  return <Box mt={1}>{cards}</Box>;
};

FinancialCard.propTypes = {
  data: PropTypes.arrayOf(PropTypes.node).isRequired,
  reported: PropTypes.node,
  ratio: PropTypes.node,
  in_period_change: PropTypes.node,
  p2p_growth: PropTypes.node,
  pcnt: PropTypes.node,
  analysis: PropTypes.node,
  normalized: PropTypes.bool,
};

export default FinancialCard;

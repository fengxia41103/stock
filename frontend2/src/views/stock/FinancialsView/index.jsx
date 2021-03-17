import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { isEmpty, isUndefined, map } from "lodash";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from "@material-ui/core";
import DictTable from "src/components/dict_table.jsx";
import StockDetailContext from "src/views/stock/StockDetailView/context.jsx";

function FinancialsView(props) {
  const {
    title,
    data,
    reported,
    ratio,
    in_period_change,
    p2p_growth,
    pcnt,
    analysis,
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

  const cards = map(mapping, m => {
    if (isUndefined(m.data)) return null;

    return (
      <Box key={m.title} mt={3}>
        <Card>
          <CardContent>
            <Box mb={3}>
              <Typography variant="h3">{m.title}</Typography>
            </Box>
            <DictTable data={data} interests={m.data} chart={true} />
          </CardContent>
        </Card>
      </Box>
    );
  });

  return (
    <Box mt={3}>
      <Typography variant="h2">{title}</Typography>
      {cards}
    </Box>
  );
}

export default FinancialsView;

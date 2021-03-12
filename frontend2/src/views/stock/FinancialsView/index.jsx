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
  } = props;

  // if ETF, skip
  if (isEmpty(data)) {
    return null;
  }

  const mapping = [
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
          <CardHeader title={m.title} />
          <CardContent>
            <DictTable data={data} interests={m.data} chart={true} />
          </CardContent>
        </Card>
      </Box>
    );
  });

  return (
    <Box>
      <Typography variant="h3">{title}</Typography>

      <Box mt={3}>
        <Typography paragraph>
          Balance sheet analysis can be defined as an analysis of the assets,
          liabilities, and equity of a company. This analysis is conducted
          generally at set intervals of time, like annually or quarterly. The
          process of balance sheet analysis is used for deriving actual figures
          about the revenue, assets, and liabilities of the company.
        </Typography>
      </Box>

      {cards}
    </Box>
  );
}

export default FinancialsView;

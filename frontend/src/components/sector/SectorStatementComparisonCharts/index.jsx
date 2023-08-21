import { groupBy, map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import { Card, CardContent, CardHeader, Grid } from "@mui/material";

import { MultilineChart } from "@fengxia41103/storybook";

import ShowResource from "@Components/common/ShowResource";

const SectorStatementComparisonCharts = (props) => {
  const { resource } = props;

  const to_ignore_list = ["on", "id", "symbol", "resource_uri", "stock"];

  const render_data = (resp) => {
    const data = resp.objects;
    const attrs = Object.keys(data[0]);
    attrs.sort();

    const group_by_symbol = groupBy(data, (d) => d.symbol);
    const chart_data = map(group_by_symbol, (vals, symbol) => {
      return {
        symbol,
        data: vals,
      };
    });

    const cards = map(attrs, (a) => {
      // these two have no meaning in this context
      if (to_ignore_list.includes(a)) return null;

      const title = a.split("_").join(" ").toUpperCase();
      return (
        <Grid item key={a} lg={4} sm={6} xs={12}>
          <Card>
            <CardHeader title={title} />
            <CardContent>
              <MultilineChart
                {...{
                  data: chart_data,
                  label_by: "symbol",
                  data_by: a,
                  normalized: true,
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      );
    });
    return (
      <Grid container spacing={1}>
        {cards}
      </Grid>
    );
  };

  return <ShowResource {...{ resource, on_success: render_data }} />;
};

SectorStatementComparisonCharts.propTypes = {
  resource: PropTypes.string.isRequired,
};

export default SectorStatementComparisonCharts;

import React, { useState, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardHeader,
  Grid,
} from "@material-ui/core";
import Fetch from "src/components/Fetch";
import { map, groupBy } from "lodash";
import GlobalContext from "src/context";
import MultilineChart from "src/components/MultilineChart";

export default function SectorStatementComparisonCharts(props) {
  const { api } = useContext(GlobalContext);
  const { resource } = props;

  const render_data = resp => {
    const data = resp.objects;
    let attrs = Object.keys(data[0]);
    attrs.sort();

    const group_by_symbol = groupBy(data, d => d.symbol);
    const chart_data = map(group_by_symbol, (vals, symbol) => {
      return {
        symbol: symbol,
        data: vals,
      };
    });

    const cards = map(attrs, a => {
      // these two have no meaning in this context
      if (a === "on" || a === "id") return null;

      const title = a
        .split("_")
        .join(" ")
        .toUpperCase();
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

  return <Fetch {...{ api, resource, render_data }} />;
}

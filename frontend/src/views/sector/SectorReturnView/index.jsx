import React, { useState, useContext } from "react";
import GlobalContext from "src/context";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import { map } from "lodash";
import Fetch from "src/components/Fetch";

import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
} from "@material-ui/core";

import SectorReturnComparisonChart from "src/components/sector/SectorReturnComparisonChart";

export default function SectorReturnView() {
  const { api } = useContext(GlobalContext);
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_property, s => s.id).join(",");

  const [start] = useState("2021-02-01");
  const [end] = useState(new Date().toLocaleDateString("en-CA"));
  const [resource] = useState(
    `/historicals?stock__in=${stock_ids}&on__range=${start},${end}`
  );

  const render_data = data => {
    const stocks = data.objects;

    return (
      <Box>
        <Typography variant="h1">Returns Comparison</Typography>

        <Box mt={3}>
          <Card>
            <CardHeader
              title={
                <Typography variant="h3">
                  Daytime Returns between {start} and {end}
                </Typography>
              }
            />
            <CardContent>
              <SectorReturnComparisonChart data={stocks} kind={"daily"} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader
              title={
                <Typography variant="h3">
                  Overnight Returns between {start} and {end}
                </Typography>
              }
            />
            <CardContent>
              <SectorReturnComparisonChart data={stocks} kind={"overnight"} />
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  };

  return <Fetch {...{ api, resource, render_data }} />;
}

import React, { useState, useContext } from "react";
import GlobalContext from "src/context";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import { map } from "lodash";
import Fetch from "src/components/Fetch";

import { Box, Typography, Card, CardContent } from "@material-ui/core";

import SectorDailyOvernightReturnScatterChart from "src/components/sector/SectorDailyOvernightReturnScatterChart";

export default function SectorReturnView() {
  const { api } = useContext(GlobalContext);
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_id_symbol, s => s.id).join(",");

  const [start, setStart] = useState("2021-02-01");
  const [end, setEnd] = useState(new Date().toLocaleDateString("en-CA"));
  const [resource] = useState(
    `/historical/stats?stock__in=${stock_ids}&start=${start}&end=${end}`
  );

  const render_data = data => {
    const stats = data.objects;

    return (
      <Box>
        <Typography variant={"h1"}>Sector {sector.name} Returns</Typography>

        <Box mt={3}>
          <Card>
            <CardContent>
              <SectorDailyOvernightReturnScatterChart data={stats} />
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  };

  return <Fetch {...{ api, resource, render_data }} />;
}
